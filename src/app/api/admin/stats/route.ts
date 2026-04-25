import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const [contacts, annonces, users, pendingReviews] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.annonce.count(),
    prisma.user.count(),
    prisma.review.count({ where: { approved: false } }),
  ])
  return NextResponse.json({ contacts, annonces, users, pendingReviews })
}
