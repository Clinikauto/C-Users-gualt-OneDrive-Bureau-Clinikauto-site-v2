import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-clinik-dark text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-xl mb-3">
              Clinik<span className="text-clinik-red">Auto</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre garage de confiance à Scionzier. Entretien, réparation et diagnostic automobile par des professionnels.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/#services', label: 'Services' },
                { href: '/annonces', label: 'Annonces' },
                { href: '/contact', label: 'Contact' },
                { href: '/login', label: 'Mon espace' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact & Horaires</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-clinik-red mt-0.5">📍</span>
                <span>118 clos des teppes<br />74950 Scionzier</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-clinik-red">📞</span>
                <a href="tel:0620185627" className="hover:text-white transition-colors">0 620 185 627</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clinik-red mt-0.5">🕐</span>
                <span>
                  Lun–Ven : 9h–12h / 14h–18h<br />
                  Samedi : 9h–12h
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Clinikauto — Tous droits réservés
        </div>
      </div>
    </footer>
  )
}
