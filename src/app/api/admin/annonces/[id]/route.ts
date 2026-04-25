import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.price !== undefined) data.price = parseFloat(body.price)
  if (body.category !== undefined) data.category = body.category
  if (body.images !== undefined) data.images = JSON.stringify(body.images)
  if (body.mileage !== undefined) data.mileage = parseInt(body.mileage)
  if (body.make !== undefined) data.make = body.make
  if (body.model !== undefined) data.model = body.model
  if (body.year !== undefined) data.year = parseInt(body.year)
  if (body.condition !== undefined) data.condition = body.condition
  if (body.status !== undefined) data.status = body.status

  const annonce = await prisma.annonce.update({ where: { id }, data })
  return NextResponse.json(annonce)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id } = await params
  await prisma.annonce.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
