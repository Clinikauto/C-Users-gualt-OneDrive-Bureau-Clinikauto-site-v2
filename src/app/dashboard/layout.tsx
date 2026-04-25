import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6 border-b">
          <Link href="/" className="text-xl font-bold text-blue-600">🔧 Clinikauto</Link>
          <p className="text-sm text-gray-500 mt-1 truncate">{session.user.name}</p>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            📊 Vue d&apos;ensemble
          </Link>
          <Link href="/dashboard/vehicles" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            🚗 Mes véhicules
          </Link>
          <Link href="/dashboard/interventions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
            🔧 Mes interventions
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-gray-800 font-semibold">Mon espace client</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">← Retour au site</Link>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
