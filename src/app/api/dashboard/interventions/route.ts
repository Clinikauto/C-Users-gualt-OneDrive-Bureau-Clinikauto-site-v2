import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const interventions = await prisma.intervention.findMany({
    where: { userId: session.user.id },
    include: { vehicle: true },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(interventions)
}
