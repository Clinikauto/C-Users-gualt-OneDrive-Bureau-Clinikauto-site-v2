import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6 border-b">
          <Link href="/" className="text-xl font-bold text-blue-600">🔧 Clinikauto</Link>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Administration</p>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { href: '/admin', label: '📊 Tableau de bord' },
            { href: '/admin/contacts', label: '📬 Contacts' },
            { href: '/admin/annonces', label: '🚗 Annonces' },
            { href: '/admin/interventions', label: '🔧 Interventions' },
            { href: '/admin/avis', label: '⭐ Avis' },
            { href: '/admin/users', label: '👥 Utilisateurs' },
            { href: '/admin/emails', label: '✉️ Emails' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-gray-800 font-semibold">Espace administrateur</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">← Retour au site</Link>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
