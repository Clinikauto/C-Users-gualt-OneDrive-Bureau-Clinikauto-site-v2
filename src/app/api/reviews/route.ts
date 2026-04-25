import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = session && (session.user as any)?.role === 'ADMIN'
  const reviews = await prisma.review.findMany({
    where: isAdmin ? {} : { approved: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  try {
    const { authorName, authorEmail, rating, comment } = await req.json()
    if (!authorName || !authorEmail || !rating || !comment) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }
    const review = await prisma.review.create({
      data: { authorName, authorEmail, rating: parseInt(rating), comment, approved: false },
    })
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
