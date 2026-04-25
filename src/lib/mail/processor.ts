/**
 * Email processor.
 *
 * For each classified email this module:
 *   1. Persists an EmailLog record
 *   2. Moves the message to the correct IMAP folder
 *   3. Creates DB records (ContactRequest / Intervention) when relevant
 *   4. Sends an auto-reply when the rule requires it
 *   5. Marks the message as seen
 */

import { prisma } from '@/lib/prisma'
import { markAsSeen, moveToFolder, type RawEmail } from './imapClient'
import { classifyEmail, type ClassificationResult } from './classifier'
import { sendAutoReply } from './smtpClient'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract a human name from an "From" header value like "John Doe <john@example.com>" */
function parseName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</)?.[1]
  return match?.trim() ?? from.split('@')[0] ?? ''
}

/** Very simple phone extractor – looks for digit sequences of 10+ chars */
// Matches optional country code (+XX) followed by at least 10 digit/separator chars
const PHONE_REGEX = /(?:\+\d{1,3}[\s-]?)?\d[\d\s\-().]{8,}\d/

function extractPhone(text: string): string {
  const m = text.match(PHONE_REGEX)
  return m ? m[0].replace(/\s/g, '') : ''
}

/** Extract a car make/model/year hint from subject or body */
function extractVehicleInfo(text: string): { make: string; model: string; year: string } {
  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  return {
    make: '',
    model: '',
    year: yearMatch ? yearMatch[0] : '',
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Process a single raw email end-to-end.
 */
export async function processEmail(email: RawEmail): Promise<void> {
  // Skip if already logged (idempotency)
  const existing = await prisma.emailLog.findUnique({
    where: { messageId: email.messageId },
  })
  if (existing) return

  let result: ClassificationResult
  try {
    result = await classifyEmail(email)
  } catch {
    result = { category: 'GENERAL', imapFolder: 'Clinikauto/General', autoReply: false }
  }

  // 1. Persist EmailLog
  const log = await prisma.emailLog.create({
    data: {
      messageId: email.messageId,
      from: email.from,
      to: email.to,
      subject: email.subject,
      receivedAt: email.receivedAt,
      category: result.category,
      imapFolder: result.imapFolder,
      status: 'PENDING',
      ruleId: result.ruleId ?? null,
    },
  })

  let linkedType: string | null = null
  let linkedId: string | null = null
  let autoReplied = false
  let status = 'PROCESSED'

  try {
    // 2. Move to IMAP folder
    await moveToFolder(email.uid, result.imapFolder)

    // 3. Category-specific processing
    if (result.category === 'CONTACT') {
      const vehicle = extractVehicleInfo(email.subject + ' ' + email.body)
      const contact = await prisma.contactRequest.create({
        data: {
          name: parseName(email.from),
          email: email.from.match(/<(.+)>/)?.[1] ?? email.from,
          phone: extractPhone(email.body),
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          vehicleYear: vehicle.year,
          description: email.body.slice(0, 1000),
          status: 'NEW',
        },
      })
      linkedType = 'ContactRequest'
      linkedId = contact.id
    } else if (result.category === 'REVIEW') {
      const emailAddr = email.from.match(/<(.+)>/)?.[1] ?? email.from
      const review = await prisma.review.create({
        data: {
          authorName: parseName(email.from),
          authorEmail: emailAddr,
          rating: 5, // default; admin can adjust
          comment: email.body.slice(0, 500),
          approved: false,
        },
      })
      linkedType = 'Review'
      linkedId = review.id
    }

    // 4. Auto-reply
    if (result.autoReply) {
      const emailAddr = email.from.match(/<(.+)>/)?.[1] ?? email.from
      await sendAutoReply(emailAddr, parseName(email.from))
      autoReplied = true
    }

    // 5. Mark as seen
    await markAsSeen(email.uid)
  } catch (err) {
    status = 'ERROR'
    console.error(`[mailProcessor] Error processing message ${email.messageId}:`, err)
  }

  // Update log with final status
  await prisma.emailLog.update({
    where: { id: log.id },
    data: {
      status,
      linkedType,
      linkedId,
      autoReplied,
    },
  })
}

/**
 * Process an array of raw emails sequentially.
 */
export async function processEmails(emails: RawEmail[]): Promise<void> {
  for (const email of emails) {
    await processEmail(email)
  }
}
