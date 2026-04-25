import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const [annonces, total] = await Promise.all([
    prisma.annonce.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.annonce.count(),
  ])

  return NextResponse.json({ annonces, total, page, limit })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await req.json()
  const { title, description, price, category, images, mileage, make, model, year, condition } = body

  const annonce = await prisma.annonce.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      category: category ?? 'CAR',
      images: images ? JSON.stringify(images) : '[]',
      mileage: mileage ? parseInt(mileage) : undefined,
      make,
      model,
      year: year ? parseInt(year) : undefined,
      condition,
    },
  })
  return NextResponse.json(annonce, { status: 201 })
}
