/**
 * GET  /api/admin/email-rules  – list all rules
 * POST /api/admin/email-rules  – create a rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const rules = await prisma.emailRule.findMany({ orderBy: { priority: 'desc' } })
  return NextResponse.json(rules)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json()
  const { name, senders, subjects, keywords, category, imapFolder, autoReply, priority } = body

  if (!name || !category || !imapFolder) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const rule = await prisma.emailRule.create({
    data: {
      name,
      senders: JSON.stringify(Array.isArray(senders) ? senders : []),
      subjects: JSON.stringify(Array.isArray(subjects) ? subjects : []),
      keywords: JSON.stringify(Array.isArray(keywords) ? keywords : []),
      category,
      imapFolder,
      autoReply: Boolean(autoReply),
      priority: Number(priority ?? 0),
    },
  })

  return NextResponse.json(rule, { status: 201 })
}
