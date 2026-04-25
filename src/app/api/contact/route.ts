import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, vehicleMake, vehicleModel, vehicleYear, description, preferredDate } = body

  if (!name || !email || !phone || !vehicleMake || !vehicleModel || !vehicleYear || !description) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const contact = await prisma.contactRequest.create({
    data: { name, email, phone, vehicleMake, vehicleModel, vehicleYear, description, preferredDate },
  })

  return NextResponse.json(contact, { status: 201 })
}
