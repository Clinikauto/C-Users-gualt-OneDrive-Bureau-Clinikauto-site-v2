import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const vehicles = await prisma.vehicle.findMany({ where: { userId: session.user.id } })
  return NextResponse.json(vehicles)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { make, model, year, licensePlate, vin } = await req.json()
  if (!make || !model || !year) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const vehicle = await prisma.vehicle.create({
    data: { userId: session.user.id, make, model, year: parseInt(year), licensePlate, vin },
  })
  return NextResponse.json(vehicle, { status: 201 })
}
