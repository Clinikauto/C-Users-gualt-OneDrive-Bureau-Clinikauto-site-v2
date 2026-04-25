import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const userId = (session.user as any)?.id
  const vehicles = await prisma.vehicle.findMany({ where: { userId }, orderBy: { id: 'desc' } })
  return NextResponse.json(vehicles)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const userId = (session.user as any)?.id
  try {
    const { make, model, year, licensePlate, vin } = await req.json()
    if (!make || !model || !year) {
      return NextResponse.json({ error: 'Marque, modèle et année requis.' }, { status: 400 })
    }
    const vehicle = await prisma.vehicle.create({
      data: { userId, make, model, year: parseInt(year), licensePlate: licensePlate || null, vin: vin || null },
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
