/**
 * PUT    /api/admin/email-rules/[id]  – update a rule
 * DELETE /api/admin/email-rules/[id]  – delete a rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Normalise a senders/subjects/keywords value to a JSON array string.
 * Accepts either an array (from updated UI) or a JSON string (legacy).
 */
function toJsonArray(val: unknown): string {
  if (Array.isArray(val)) return JSON.stringify(val)
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return JSON.stringify(parsed)
    } catch { /* fall through */ }
  }
  return '[]'
}

// In Next.js 15, route segment params are async – keep the Promise signature.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json()
  const { name, senders, subjects, keywords, category, imapFolder, autoReply, active, priority } =
    body

  const rule = await prisma.emailRule.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(senders !== undefined && { senders: toJsonArray(senders) }),
      ...(subjects !== undefined && { subjects: toJsonArray(subjects) }),
      ...(keywords !== undefined && { keywords: toJsonArray(keywords) }),
      ...(category !== undefined && { category }),
      ...(imapFolder !== undefined && { imapFolder }),
      ...(autoReply !== undefined && { autoReply: Boolean(autoReply) }),
      ...(active !== undefined && { active: Boolean(active) }),
      ...(priority !== undefined && { priority: Number(priority) }),
    },
  })

  return NextResponse.json(rule)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  await prisma.emailRule.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
