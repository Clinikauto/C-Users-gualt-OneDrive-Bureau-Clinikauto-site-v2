import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold mb-3">🔧 Clinikauto</h3>
            <p className="text-sm text-gray-400">Votre garage de confiance pour l&apos;entretien et la réparation de votre véhicule.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="/annonces" className="hover:text-white transition-colors">Annonces</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Mon espace</Link></li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-white font-semibold mb-3">Nous contacter</h4>
            <ul className="space-y-2 text-sm">
              <li>📍 123 Rue de la Mécanique, 75000 Paris</li>
              <li>📞 01 23 45 67 89</li>
              <li>✉️ contact@clinikauto.fr</li>
              <li>🕐 Lun–Ven : 8h–18h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Clinikauto. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
