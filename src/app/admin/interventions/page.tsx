import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminInterventionsClient from './AdminInterventionsClient'

export default async function AdminInterventionsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/login')

  const interventions = await prisma.intervention.findMany({
    orderBy: { date: 'desc' },
    include: { user: { select: { name: true, email: true } }, vehicle: true },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-clinik-dark">Interventions</h1>
            <p className="text-gray-500 mt-1">{interventions.length} intervention(s)</p>
          </div>
          <a href="/admin" className="text-clinik-blue hover:underline text-sm">← Retour admin</a>
        </div>
        <AdminInterventionsClient interventions={interventions as any} />
      </div>
    </div>
  )
}
