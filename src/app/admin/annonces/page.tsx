import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminAnnoncesClient from './AdminAnnoncesClient'

export default async function AdminAnnoncesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/login')

  const annonces = await prisma.annonce.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-clinik-dark">Annonces</h1>
            <p className="text-gray-500 mt-1">{annonces.length} annonce(s)</p>
          </div>
          <a href="/admin" className="text-clinik-blue hover:underline text-sm">← Retour admin</a>
        </div>
        <AdminAnnoncesClient annonces={annonces} />
      </div>
    </div>
  )
}
