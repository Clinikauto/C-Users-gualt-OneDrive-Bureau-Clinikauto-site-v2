/**
 * Mail Worker – background daemon.
 *
 * Run with:  npx ts-node --project tsconfig.worker.json src/services/mailWorker.ts
 * Or via PM2: pm2 start ecosystem.config.cjs
 *
 * Behaviour:
 *  - Polls the INBOX every MAIL_POLL_INTERVAL_MIN minutes using node-cron
 *  - Also starts an IMAP IDLE watcher for near-real-time delivery
 *  - Sends a daily admin digest at 08:00 local time
 */

// Load .env in standalone mode (not needed inside Next.js runtime)
import 'dotenv/config'

import cron from 'node-cron'
import { fetchUnseenEmails, watchInbox } from '@/lib/mail/imapClient'
import { processEmails } from '@/lib/mail/processor'
import { sendAdminDigest } from '@/lib/mail/smtpClient'
import { prisma } from '@/lib/prisma'

// ─── Interval validation ──────────────────────────────────────────────────────

const DEFAULT_INTERVAL = 5
const MIN_INTERVAL = 1
const MAX_INTERVAL = 59

function parseIntervalMin(raw: string | undefined): number {
  const n = Number(raw)
  if (Number.isFinite(n) && Number.isInteger(n) && n >= MIN_INTERVAL && n <= MAX_INTERVAL) {
    return n
  }
  if (raw !== undefined) {
    console.warn(
      `[mailWorker] Invalid MAIL_POLL_INTERVAL_MIN="${raw}". Using default ${DEFAULT_INTERVAL} minute(s).`
    )
  }
  return DEFAULT_INTERVAL
}

const intervalMin = parseIntervalMin(process.env.MAIL_POLL_INTERVAL_MIN)

// ─── Poll job (with concurrency guard) ───────────────────────────────────────

let isPolling = false
let pollQueued = false

async function pollMailbox() {
  if (isPolling) {
    pollQueued = true
    console.log('[mailWorker] Poll already in progress – queuing another run')
    return
  }

  isPolling = true
  try {
    do {
      pollQueued = false
      console.log(`[mailWorker] Polling mailbox at ${new Date().toISOString()}`)
      try {
        const emails = await fetchUnseenEmails()
        console.log(`[mailWorker] Found ${emails.length} unseen message(s)`)
        await processEmails(emails)
      } catch (err) {
        console.error('[mailWorker] Poll error:', err)
      }
    } while (pollQueued)
  } finally {
    isPolling = false
  }
}

// ─── Daily digest ─────────────────────────────────────────────────────────────

async function sendDailyDigest() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const logs = await prisma.emailLog.findMany({
      where: { createdAt: { gte: today } },
    })
    const byCategory: Record<string, number> = {}
    for (const log of logs) {
      byCategory[log.category] = (byCategory[log.category] ?? 0) + 1
    }
    await sendAdminDigest({ total: logs.length, byCategory })
    console.log('[mailWorker] Daily digest sent')
  } catch (err) {
    console.error('[mailWorker] Daily digest error:', err)
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────

console.log(`[mailWorker] Starting – poll every ${intervalMin} min`)

// Poll on start-up
void pollMailbox()

// Schedule polling
cron.schedule(`*/${intervalMin} * * * *`, () => void pollMailbox())

// Daily digest at 08:00
cron.schedule('0 8 * * *', () => void sendDailyDigest())

// IDLE watcher for near-real-time delivery
const stopWatcher = watchInbox(async () => {
  console.log('[mailWorker] IMAP IDLE triggered – polling now')
  await pollMailbox()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[mailWorker] SIGTERM received – shutting down')
  stopWatcher()
  void prisma.$disconnect().then(() => process.exit(0))
})

process.on('SIGINT', () => {
  console.log('[mailWorker] SIGINT received – shutting down')
  stopWatcher()
  void prisma.$disconnect().then(() => process.exit(0))
})
