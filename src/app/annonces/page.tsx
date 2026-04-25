'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Annonce {
  id: string
  title: string
  description: string
  price: number
  category: string
  images: string
  mileage?: number
  make?: string
  model?: string
  year?: number
  condition?: string
  status: string
  createdAt: string
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'CAR' | 'PIECE'>('ALL')

  useEffect(() => {
    fetch('/api/annonces')
      .then((r) => r.json())
      .then((data) => { setAnnonces(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? annonces : annonces.filter((a) => a.category === filter)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-clinik-dark mb-3">Nos Annonces</h1>
          <p className="text-gray-500 text-lg">Véhicules et pièces disponibles</p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-8">
          {(['ALL', 'CAR', 'PIECE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-clinik-red text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-clinik-red hover:text-clinik-red'
              }`}
            >
              {f === 'ALL' ? 'Tout' : f === 'CAR' ? '🚗 Véhicules' : '🔩 Pièces'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-gray-500 text-lg">Aucune annonce disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((annonce) => {
              const images = (() => { try { return JSON.parse(annonce.images) } catch { return [] } })()
              return (
                <div key={annonce.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    {images[0] ? (
                      <img src={images[0]} alt={annonce.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-5xl">{annonce.category === 'CAR' ? '🚗' : '🔩'}</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-clinik-dark text-lg leading-tight">{annonce.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                        {annonce.category === 'CAR' ? 'Véhicule' : 'Pièce'}
                      </span>
                    </div>
                    {(annonce.make || annonce.model) && (
                      <p className="text-sm text-gray-500 mb-1">{annonce.make} {annonce.model} {annonce.year && `(${annonce.year})`}</p>
                    )}
                    {annonce.mileage && (
                      <p className="text-sm text-gray-400">📏 {annonce.mileage.toLocaleString('fr-FR')} km</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-clinik-red">{annonce.price.toLocaleString('fr-FR')} €</span>
                      <Link
                        href={`/annonces/${annonce.id}`}
                        className="bg-clinik-blue hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Voir le détail →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
