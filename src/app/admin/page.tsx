import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/login')

  const [contacts, annonces, users, reviews] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.annonce.count(),
    prisma.user.count(),
    prisma.review.count({ where: { approved: false } }),
  ])

  const stats = [
    { label: 'Demandes de contact', value: contacts, icon: '📬', href: '/admin/contacts', color: 'bg-blue-500' },
    { label: 'Annonces', value: annonces, icon: '🚗', href: '/admin/annonces', color: 'bg-green-500' },
    { label: 'Utilisateurs', value: users, icon: '👥', href: '#', color: 'bg-purple-500' },
    { label: 'Avis en attente', value: reviews, icon: '⭐', href: '/admin/reviews', color: 'bg-yellow-500' },
  ]

  const links = [
    { href: '/admin/contacts', label: 'Demandes de contact', icon: '📬', desc: 'Gérer les RDV et demandes' },
    { href: '/admin/annonces', label: 'Annonces', icon: '🚗', desc: 'Créer et gérer les annonces' },
    { href: '/admin/reviews', label: 'Avis clients', icon: '⭐', desc: 'Modérer les avis' },
    { href: '/admin/interventions', label: 'Interventions', icon: '🔧', desc: 'Suivi des interventions' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-clinik-dark">Administration</h1>
          <p className="text-gray-500 mt-1">Tableau de bord Clinikauto</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
              <div className={`${stat.color} text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-clinik-dark">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <h2 className="text-xl font-bold text-clinik-dark mb-4">Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-start gap-4 group"
            >
              <div className="text-3xl">{link.icon}</div>
              <div>
                <p className="font-bold text-clinik-dark group-hover:text-clinik-red transition-colors">{link.label}</p>
                <p className="text-sm text-gray-500">{link.desc}</p>
              </div>
              <span className="ml-auto text-gray-300 group-hover:text-clinik-red transition-colors text-xl">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
