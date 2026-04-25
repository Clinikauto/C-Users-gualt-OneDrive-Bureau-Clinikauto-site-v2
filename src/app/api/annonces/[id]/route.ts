import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const annonce = await prisma.annonce.findFirst({ where: { id, status: 'ACTIVE' } })
  if (!annonce) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(annonce)
}
