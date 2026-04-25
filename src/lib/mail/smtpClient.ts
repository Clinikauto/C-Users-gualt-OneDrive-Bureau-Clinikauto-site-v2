/**
 * SMTP client using Nodemailer.
 *
 * Credentials are read from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME
 */

import nodemailer from 'nodemailer'

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASSWORD ?? '',
    },
  })
}

export interface SendMailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendMail(opts: SendMailOptions): Promise<void> {
  const transporter = buildTransport()
  const from = `"${process.env.SMTP_FROM_NAME ?? 'Clinikauto'}" <${process.env.SMTP_USER}>`
  await transporter.sendMail({ from, ...opts })
}

/** Pre-built auto-reply template */
export async function sendAutoReply(to: string, recipientName: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Clinikauto – Votre message a bien été reçu',
    html: `
      <p>Bonjour ${recipientName || ''},</p>
      <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
      <p>Merci de votre confiance.</p>
      <br />
      <p>Cordialement,<br /><strong>L'équipe Clinikauto</strong></p>
    `,
    text: `Bonjour ${recipientName || ''},\n\nNous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.\n\nCordialement,\nL'équipe Clinikauto`,
  })
}

/** Daily digest email sent to the admin */
export async function sendAdminDigest(
  summary: { total: number; byCategory: Record<string, number> }
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? ''
  if (!adminEmail) return

  const rows = Object.entries(summary.byCategory)
    .map(([cat, count]) => `<tr><td>${cat}</td><td>${count}</td></tr>`)
    .join('')

  await sendMail({
    to: adminEmail,
    subject: `Clinikauto – Résumé emails du ${new Date().toLocaleDateString('fr-FR')}`,
    html: `
      <h2>Résumé quotidien des emails reçus</h2>
      <p>Total traité : <strong>${summary.total}</strong></p>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead><tr><th>Catégorie</th><th>Nombre</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `,
  })
}
