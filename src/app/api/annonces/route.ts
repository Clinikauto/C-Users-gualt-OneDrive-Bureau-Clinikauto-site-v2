import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const annonces = await prisma.annonce.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(annonces)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { title, description, price, category, make, model, year, mileage, condition, status } = body
    if (!title || !description || price == null) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }
    const annonce = await prisma.annonce.create({
      data: {
        title, description, price: parseFloat(price),
        category: category || 'CAR',
        make: make || null, model: model || null,
        year: year ? parseInt(year) : null,
        mileage: mileage ? parseInt(mileage) : null,
        condition: condition || null,
        status: status || 'ACTIVE',
        images: '[]',
      },
    })
    return NextResponse.json(annonce, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
