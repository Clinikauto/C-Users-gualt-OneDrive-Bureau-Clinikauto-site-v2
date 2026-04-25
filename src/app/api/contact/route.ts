import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, vehicleMake, vehicleModel, vehicleYear, description, preferredDate } = body
    if (!name || !email || !phone || !vehicleMake || !vehicleModel || !description) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }
    const contact = await prisma.contactRequest.create({
      data: { name, email, phone, vehicleMake, vehicleModel, vehicleYear: vehicleYear || '', description, preferredDate: preferredDate || null },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const { id, status } = await req.json()
    const contact = await prisma.contactRequest.update({ where: { id }, data: { status } })
    return NextResponse.json(contact)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
