import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const isAdmin = (session.user as any)?.role === 'ADMIN'
  const userId = (session.user as any)?.id
  const interventions = await prisma.intervention.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { date: 'desc' },
    include: { vehicle: true },
  })
  return NextResponse.json(interventions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { userId, vehicleId, title, description, date, mileage, price, status, notes } = body
    const intervention = await prisma.intervention.create({
      data: {
        userId, vehicleId: vehicleId || null, title, description,
        date: new Date(date), mileage: mileage || null, price: price || null,
        status: status || 'PENDING', notes: notes || null,
      },
    })
    return NextResponse.json(intervention, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
