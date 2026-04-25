import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Disponible uniquement en développement.' }, { status: 403 })
  }
  const existing = await prisma.user.findUnique({ where: { email: 'admin@clinikauto.fr' } })
  if (existing) {
    return NextResponse.json({ message: 'Admin déjà existant.', email: 'admin@clinikauto.fr' })
  }
  const hashed = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: { name: 'Admin Clinikauto', email: 'admin@clinikauto.fr', password: hashed, role: 'ADMIN' },
  })
  return NextResponse.json({ message: 'Admin créé !', email: admin.email })
}
