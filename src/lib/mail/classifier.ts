/**
 * Email classification engine.
 *
 * Rules are loaded from the database (EmailRule table).
 * The engine evaluates each rule in priority order (highest first) and
 * returns the first matching category + target IMAP folder.
 *
 * Built-in fallback rules are applied when no DB rule matches.
 */

import { prisma } from '@/lib/prisma'
import type { RawEmail } from './imapClient'

export type EmailCategory = 'CONTACT' | 'INVOICE' | 'REVIEW' | 'SPAM' | 'GENERAL'

export interface ClassificationResult {
  category: EmailCategory
  imapFolder: string
  autoReply: boolean
  ruleId?: string
}

// ─── Built-in fallback rules (applied when no DB rule matches) ────────────────

const BUILTIN_RULES: Array<{
  senders: string[]
  subjects: string[]
  keywords: string[]
  category: EmailCategory
  imapFolder: string
  autoReply: boolean
}> = [
  {
    senders: [],
    subjects: ['devis', 'rendez-vous', 'rdv', 'contact', 'demande', 'renseignement'],
    keywords: ['devis', 'rendez-vous', 'rdv', 'disponibilité', 'intervention', 'réparation'],
    category: 'CONTACT',
    imapFolder: 'Clinikauto/Devis',
    autoReply: true,
  },
  {
    senders: [],
    subjects: ['facture', 'invoice', 'fournisseur', 'commande', 'bon de commande'],
    keywords: ['facture', 'invoice', 'paiement', 'règlement', 'fournisseur'],
    category: 'INVOICE',
    imapFolder: 'Clinikauto/Factures',
    autoReply: false,
  },
  {
    senders: [],
    subjects: ['avis', 'review', 'évaluation', 'satisfaction', 'témoignage'],
    keywords: ['avis', 'étoile', 'note', 'satisfaction', 'témoignage', 'review'],
    category: 'REVIEW',
    imapFolder: 'Clinikauto/Avis',
    autoReply: false,
  },
  {
    senders: [],
    subjects: ['spam', 'promotion', 'offre spéciale', 'unsubscribe', 'désabonner', 'newsletter'],
    keywords: ['spam', 'promotion', 'unsubscribe', 'click here', 'cliquez ici', 'offre limitée'],
    category: 'SPAM',
    imapFolder: 'Clinikauto/Spam',
    autoReply: false,
  },
]

function matchesArray(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase()
  return terms.some((t) => lower.includes(t.toLowerCase()))
}

function scoreEmail(
  email: RawEmail,
  senders: string[],
  subjects: string[],
  keywords: string[],
): boolean {
  if (senders.length > 0 && !matchesArray(email.from, senders)) return false
  const subjectMatch = subjects.length === 0 || matchesArray(email.subject, subjects)
  const bodyMatch = keywords.length === 0 || matchesArray(email.body, keywords)
  return subjectMatch || bodyMatch
}

/**
 * Classify an email against DB rules then built-in fallbacks.
 */
export async function classifyEmail(email: RawEmail): Promise<ClassificationResult> {
  // Load active DB rules ordered by priority desc
  const dbRules = await prisma.emailRule.findMany({
    where: { active: true },
    orderBy: { priority: 'desc' },
  })

  for (const rule of dbRules) {
    let senders: string[]
    let subjects: string[]
    let keywords: string[]

    try {
      senders = JSON.parse(rule.senders)
      subjects = JSON.parse(rule.subjects)
      keywords = JSON.parse(rule.keywords)
    } catch (err) {
      console.error(`[classifier] Invalid JSON in rule ${rule.id}:`, err)
      continue
    }

    if (scoreEmail(email, senders, subjects, keywords)) {
      return {
        category: rule.category as EmailCategory,
        imapFolder: rule.imapFolder,
        autoReply: rule.autoReply,
        ruleId: rule.id,
      }
    }
  }

  // Fallback to built-in rules
  for (const rule of BUILTIN_RULES) {
    if (scoreEmail(email, rule.senders, rule.subjects, rule.keywords)) {
      return {
        category: rule.category,
        imapFolder: rule.imapFolder,
        autoReply: rule.autoReply,
      }
    }
  }

  return { category: 'GENERAL', imapFolder: 'Clinikauto/General', autoReply: false }
}
