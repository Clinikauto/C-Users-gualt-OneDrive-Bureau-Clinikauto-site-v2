import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const [users, vehicles, interventions, contacts, annonces, reviews, pendingContacts, pendingReviews] =
    await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.intervention.count(),
      prisma.contactRequest.count(),
      prisma.annonce.count(),
      prisma.review.count(),
      prisma.contactRequest.count({ where: { status: 'NEW' } }),
      prisma.review.count({ where: { approved: false } }),
    ])

  return NextResponse.json({
    users,
    vehicles,
    interventions,
    contacts,
    annonces,
    reviews,
    pendingContacts,
    pendingReviews,
  })
}
