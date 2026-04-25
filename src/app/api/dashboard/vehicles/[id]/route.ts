import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({ where: { id } })
  if (!vehicle || vehicle.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  }

  const { make, model, year, licensePlate, vin } = await req.json()
  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(make !== undefined ? { make } : {}),
      ...(model !== undefined ? { model } : {}),
      ...(year !== undefined ? { year: parseInt(year) } : {}),
      ...(licensePlate !== undefined ? { licensePlate } : {}),
      ...(vin !== undefined ? { vin } : {}),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({ where: { id } })
  if (!vehicle || vehicle.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  }

  await prisma.vehicle.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
