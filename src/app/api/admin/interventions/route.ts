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
  const status = searchParams.get('status') ?? undefined
  const userId = searchParams.get('userId') ?? undefined

  const where = {
    ...(status ? { status } : {}),
    ...(userId ? { userId } : {}),
  }

  const [interventions, total] = await Promise.all([
    prisma.intervention.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } }, vehicle: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.intervention.count({ where }),
  ])

  return NextResponse.json({ interventions, total, page, limit })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await req.json()
  const { userId, vehicleId, title, description, date, mileage, price, status, notes } = body

  const intervention = await prisma.intervention.create({
    data: {
      userId,
      vehicleId: vehicleId ?? undefined,
      title,
      description,
      date: new Date(date),
      mileage: mileage ? parseInt(mileage) : undefined,
      price: price ? parseFloat(price) : undefined,
      status: status ?? 'PENDING',
      notes: notes ?? undefined,
    },
  })
  return NextResponse.json(intervention, { status: 201 })
}
