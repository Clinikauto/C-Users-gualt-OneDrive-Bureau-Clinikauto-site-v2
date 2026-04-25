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

  const where = status ? { status } : {}
  const [contacts, total] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactRequest.count({ where }),
  ])

  return NextResponse.json({ contacts, total, page, limit })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { id, status } = await req.json()
  const contact = await prisma.contactRequest.update({ where: { id }, data: { status } })
  return NextResponse.json(contact)
}
