import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminContactsClient from './AdminContactsClient'

export default async function AdminContactsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/login')

  const contacts = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-clinik-dark">Demandes de contact</h1>
            <p className="text-gray-500 mt-1">{contacts.length} demande(s)</p>
          </div>
          <a href="/admin" className="text-clinik-blue hover:underline text-sm">← Retour admin</a>
        </div>
        <AdminContactsClient contacts={contacts} />
      </div>
    </div>
  )
}
