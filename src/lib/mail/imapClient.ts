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

/**
 * Fetch all unseen messages from INBOX and return them as plain objects.
 * The caller is responsible for marking them as seen / moving them.
 */
export async function fetchUnseenEmails(): Promise<RawEmail[]> {
  const client = buildClient()
  const results: RawEmail[] = []

  await client.connect()
  try {
    const lock = await client.getMailboxLock('INBOX')
    try {
      for await (const msg of client.fetch('1:*', {
        uid: true,
        envelope: true,
        source: true,
        internalDate: true,
        flags: true,
      }) as AsyncIterable<FetchMessageObject>) {
        // Skip already-seen messages
        if (msg.flags?.has('\\Seen')) continue

        const from =
          msg.envelope?.from?.[0]?.address ?? msg.envelope?.from?.[0]?.name ?? ''
        const to =
          msg.envelope?.to?.[0]?.address ?? msg.envelope?.to?.[0]?.name ?? ''
        const subject = msg.envelope?.subject ?? '(sans objet)'
        const messageId = msg.envelope?.messageId ?? `uid-${msg.uid}`
        const receivedAt = msg.internalDate instanceof Date ? msg.internalDate : new Date()

        // Decode body text (source is a Buffer)
        const body = msg.source?.toString('utf-8') ?? ''

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
 * If the folder does not exist the mail stays in INBOX and no error is thrown.
 */
export async function moveToFolder(uid: number, folder: string): Promise<void> {
  if (!folder || folder === 'INBOX') return
  const client = buildClient()
  await client.connect()
  try {
    // Ensure destination mailbox exists
    const mailboxes = await client.list()
    const exists = mailboxes.some((m) => m.path === folder)
    if (!exists) {
      await client.mailboxCreate(folder)
    }

    const lock = await client.getMailboxLock('INBOX')
    try {
      await client.messageMove({ uid }, folder)
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
 */
export function watchInbox(onNewMail: () => Promise<void>): () => void {
  let stopped = false

  async function run() {
    while (!stopped) {
      const client = buildClient()
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
      }
    }
  }

  void run()

  return () => {
    stopped = true
  }
}
