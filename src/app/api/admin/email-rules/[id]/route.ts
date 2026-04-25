/**
 * PUT    /api/admin/email-rules/[id]  – update a rule
 * DELETE /api/admin/email-rules/[id]  – delete a rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      ...(senders !== undefined && { senders: JSON.stringify(senders) }),
      ...(subjects !== undefined && { subjects: JSON.stringify(subjects) }),
      ...(keywords !== undefined && { keywords: JSON.stringify(keywords) }),
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
