/**
 * IMAP client – connects to the mailbox, fetches unseen messages and
 * optionally watches the INBOX via IMAP IDLE for real-time delivery.
 *
 * Credentials are read from environment variables (never hard-coded):
 *   IMAP_HOST, IMAP_PORT, IMAP_SECURE, IMAP_USER, IMAP_PASSWORD
 */

import { ImapFlow, FetchMessageObject } from 'imapflow'

export interface RawEmail {
  uid: number
  messageId: string
  from: string
  to: string
  subject: string
  body: string
  receivedAt: Date
}

function buildClient(): ImapFlow {
  return new ImapFlow({
    host: process.env.IMAP_HOST ?? 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT ?? 993),
    secure: process.env.IMAP_SECURE !== 'false',
    auth: {
      user: process.env.IMAP_USER ?? '',
      pass: process.env.IMAP_PASSWORD ?? '',
    },
    logger: false,
  })
}

/** Build a "Name <address>" formatted string from an envelope address object. */
function formatAddress(addrObj: { name?: string; address?: string } | undefined): string {
  if (!addrObj) return ''
  const { name, address } = addrObj
  if (name && address) return `${name} <${address}>`
  return address ?? name ?? ''
}

/**
 * Extract readable text from a raw RFC822 message.
 * Handles multipart/mixed, multipart/alternative, quoted-printable and base64.
 * Falls back to stripped plain content when no text/plain part is found.
 */
function extractTextFromMime(source: string): string {
  // Normalise line endings
  const src = source.replace(/\r\n/g, '\n')

  // Split headers from body at the first blank line
  const sepIdx = src.indexOf('\n\n')
  if (sepIdx === -1) return src.trim()

  const rawHeaders = src.slice(0, sepIdx).toLowerCase()
  const rawBody = src.slice(sepIdx + 2)

  // Helper: decode a part body
  const decodePart = (headers: string, body: string): string => {
    let text = body
    if (headers.includes('content-transfer-encoding: quoted-printable')) {
      text = text
        .replace(/=\n/g, '')
        .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    } else if (headers.includes('content-transfer-encoding: base64')) {
      try {
        text = Buffer.from(text.replace(/\s/g, ''), 'base64').toString('utf-8')
      } catch (err) {
        console.warn('[imapClient] base64 body decoding failed:', err)
      }
    }
    // Strip HTML tags if content is HTML
    if (headers.includes('content-type: text/html')) {
      text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    }
    return text.trim()
  }

  // Multipart handling
  const boundaryMatch = rawHeaders.match(/boundary="?([^"\n;]+)"?/)
  if (boundaryMatch) {
    const boundary = boundaryMatch[1].trim()
    const parts = rawBody.split(`--${boundary}`)
    const textParts: string[] = []
    const htmlParts: string[] = []

    for (const part of parts) {
      if (part.startsWith('--') || part.trim() === '') continue
      const partSep = part.indexOf('\n\n')
      if (partSep === -1) continue
      const partHeaders = part.slice(0, partSep).toLowerCase()
      const partBody = part.slice(partSep + 2)

      if (partHeaders.includes('content-type: text/plain')) {
        textParts.push(decodePart(partHeaders, partBody))
      } else if (partHeaders.includes('content-type: text/html')) {
        htmlParts.push(decodePart(partHeaders, partBody))
      }
    }

    if (textParts.length > 0) return textParts.join('\n\n').trim()
    if (htmlParts.length > 0) return htmlParts.join('\n\n').trim()
  }

  return decodePart(rawHeaders, rawBody)
}

/**
 * Fetch all unseen messages from INBOX and return them as plain objects.
 * Uses IMAP SEARCH to retrieve only unseen UIDs before fetching, avoiding
 * iterating the entire mailbox on every poll.
 * The caller is responsible for marking them as seen / moving them.
 */
export async function fetchUnseenEmails(): Promise<RawEmail[]> {
  const client = buildClient()
  const results: RawEmail[] = []

  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      // Search for unseen messages first – avoids scanning the entire mailbox
      const unseenSeqs = await client.search({ seen: false })
      if (!unseenSeqs || unseenSeqs.length === 0) return results

      for await (const msg of client.fetch(unseenSeqs, {
        uid: true,
        envelope: true,
        source: true,
        internalDate: true,
      }) as AsyncIterable<FetchMessageObject>) {
        const from = formatAddress(msg.envelope?.from?.[0])
        const to = formatAddress(msg.envelope?.to?.[0])
        const subject = msg.envelope?.subject ?? '(sans objet)'
        const messageId = msg.envelope?.messageId ?? `uid-${msg.uid}`
        const receivedAt = msg.internalDate instanceof Date ? msg.internalDate : new Date()

        // Extract readable text body from the raw RFC822 source
        const body = extractTextFromMime(msg.source?.toString('utf-8') ?? '')

        results.push({
          uid: msg.uid,
          messageId,
          from,
          to,
          subject,
          body,
          receivedAt,
        })
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }

  return results
}

/**
 * Mark a message as seen by UID.
 */
export async function markAsSeen(uid: number): Promise<void> {
  const client = buildClient()
  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      await client.messageFlagsAdd({ uid }, ['\\Seen'])
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }
}

/**
 * Move a message to a destination IMAP folder (creates it if absent).
 * If the folder cannot be created or the move fails, the mail stays in INBOX
 * and no error is thrown.
 */
export async function moveToFolder(uid: number, folder: string): Promise<void> {
  if (!folder || folder === 'INBOX') return
  const client = buildClient()
  await client.connect()
  try {
    // Ensure destination mailbox exists
    try {
      const mailboxes = await client.list()
      const exists = mailboxes.some((m) => m.path === folder)
      if (!exists) {
        await client.mailboxCreate(folder)
      }
    } catch (err) {
      console.warn(`[imapClient] Could not ensure folder "${folder}" exists – skipping move:`, err)
      return
    }

    const lock = await client.getMailboxLock('INBOX')
    try {
      await client.messageMove({ uid }, folder)
    } catch (err) {
      console.warn(`[imapClient] Could not move message uid=${uid} to "${folder}":`, err)
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
  }
}

/**
 * Watch INBOX via IMAP IDLE.  Calls `onNewMail` whenever new messages arrive.
 * Returns a stop function.  Run this in a long-lived process only.
 * The stop function actively closes the current IMAP connection so the loop
 * exits promptly rather than waiting for the IDLE timeout.
 */
export function watchInbox(onNewMail: () => Promise<void>): () => void {
  let stopped = false
  let activeClient: ImapFlow | null = null

  async function run() {
    while (!stopped) {
      const client = buildClient()
      activeClient = client
      try {
        await client.connect()
        const lock = await client.getMailboxLock('INBOX')
        try {
          // imapflow fires 'exists' event when new messages arrive
          client.on('exists', async () => {
            await onNewMail()
          })
          // Block here while IDLE is active (imapflow handles re-IDLE)
          await client.idle()
        } finally {
          lock.release()
        }
        await client.logout()
      } catch {
        // Reconnect after a short pause on error
        if (!stopped) await new Promise((r) => setTimeout(r, 10_000))
      } finally {
        activeClient = null
      }
    }
  }

  void run()

  return () => {
    stopped = true
    if (activeClient) {
      // Actively close the connection so client.idle() resolves immediately
      try { void activeClient.logout() } catch { /* ignore */ }
      activeClient = null
    }
  }
}
