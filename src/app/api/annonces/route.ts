import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '12')
  const make = searchParams.get('make') ?? undefined
  const category = searchParams.get('category') ?? undefined

  const where = {
    status: 'ACTIVE',
    ...(make ? { make } : {}),
    ...(category ? { category } : {}),
  }

  const [annonces, total] = await Promise.all([
    prisma.annonce.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.annonce.count({ where }),
  ])

  return NextResponse.json({ annonces, total, page, limit })
}
