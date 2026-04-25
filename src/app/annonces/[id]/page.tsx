import Link from 'next/link'
import { notFound } from 'next/navigation'

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

async function getAnnonce(id: string): Promise<Annonce | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/annonces/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AnnoncePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const annonce = await getAnnonce(id)
  if (!annonce) notFound()

  const images: string[] = (() => { try { return JSON.parse(annonce.images) } catch { return [] } })()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/annonces" className="inline-flex items-center gap-2 text-clinik-blue hover:underline mb-6 text-sm font-medium">
          ← Retour aux annonces
        </Link>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Image gallery */}
          <div className="h-64 md:h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            {images[0] ? (
              <img src={images[0]} alt={annonce.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-8xl">{annonce.category === 'CAR' ? '🚗' : '🔩'}</span>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full mb-2 inline-block">
                  {annonce.category === 'CAR' ? 'Véhicule' : 'Pièce'}
                </span>
                <h1 className="text-3xl font-bold text-clinik-dark">{annonce.title}</h1>
                {(annonce.make || annonce.model) && (
                  <p className="text-gray-500 mt-1">{annonce.make} {annonce.model} {annonce.year && `• ${annonce.year}`}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold text-clinik-red">{annonce.price.toLocaleString('fr-FR')} €</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {annonce.mileage && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">📏</p>
                  <p className="text-xs text-gray-400">Kilométrage</p>
                  <p className="font-semibold text-clinik-dark">{annonce.mileage.toLocaleString('fr-FR')} km</p>
                </div>
              )}
              {annonce.year && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">📅</p>
                  <p className="text-xs text-gray-400">Année</p>
                  <p className="font-semibold text-clinik-dark">{annonce.year}</p>
                </div>
              )}
              {annonce.condition && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">⭐</p>
                  <p className="text-xs text-gray-400">État</p>
                  <p className="font-semibold text-clinik-dark">{annonce.condition}</p>
                </div>
              )}
              {annonce.make && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">🏷️</p>
                  <p className="text-xs text-gray-400">Marque</p>
                  <p className="font-semibold text-clinik-dark">{annonce.make}</p>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="font-bold text-clinik-dark text-xl mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{annonce.description}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-clinik-red hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                📞 Contacter le garage
              </Link>
              <a
                href="tel:0620185627"
                className="border-2 border-clinik-dark text-clinik-dark hover:bg-clinik-dark hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                0 620 185 627
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
