'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">🔧 Clinikauto</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Accueil
            </Link>
            <Link href="/annonces" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Annonces
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
            {session?.user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Mon espace
              </Link>
            )}
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Auth buttons desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {session?.user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2">
          <Link href="/" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/annonces" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Annonces</Link>
          <Link href="/contact" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Contact</Link>
          {session?.user && (
            <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Mon espace</Link>
          )}
          {session?.user?.role === 'ADMIN' && (
            <Link href="/admin" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {session?.user ? (
            <button onClick={() => signOut({ callbackUrl: '/' })} className="block w-full text-left py-2 text-gray-700">
              Déconnexion
            </button>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-blue-600" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link href="/register" className="block py-2 text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Inscription</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
