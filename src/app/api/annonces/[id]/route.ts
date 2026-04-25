import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const annonce = await prisma.annonce.findUnique({ where: { id } })
  if (!annonce) return NextResponse.json({ error: 'Non trouvé.' }, { status: 404 })
  return NextResponse.json(annonce)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()
  const annonce = await prisma.annonce.update({ where: { id }, data: body })
  return NextResponse.json(annonce)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const { id } = await params
  await prisma.annonce.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
