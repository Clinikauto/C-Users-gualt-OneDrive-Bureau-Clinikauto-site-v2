'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

const LOGO_URL = 'https://github.com/user-attachments/assets/ec9cd494-9372-4b03-a607-7664abcaa6c2'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/#services', label: 'Services' },
    { href: '/annonces', label: 'Annonces' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="bg-clinik-dark sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white">
              <Image
                src={LOGO_URL}
                alt="Clinikauto Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">
              Clinik<span className="text-clinik-red">Auto</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <span className="text-clinik-red">●</span>
                  {session.user.name}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mon tableau de bord
                    </Link>
                    {(session.user as any).role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-clinik-red font-semibold hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-clinik-red hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-700 my-2" />
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Mon tableau de bord
                </Link>
                {(session.user as any).role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-clinik-red hover:bg-gray-800 rounded-lg text-sm font-semibold"
                    onClick={() => setMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-clinik-red text-white rounded-lg text-sm text-center font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
