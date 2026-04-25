import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default async function AnnoncePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const annonce = await prisma.annonce.findFirst({ where: { id, status: 'ACTIVE' } })
  if (!annonce) notFound()

  const images = (() => {
    try { return JSON.parse(annonce.images) as string[] } catch { return [] }
  })()

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/annonces" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
            ← Retour aux annonces
          </Link>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Image */}
            <div className="bg-gray-200 h-72 flex items-center justify-center">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt={annonce.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">🚗</span>
              )}
            </div>

            <div className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{annonce.title}</h1>
                  {(annonce.make || annonce.model || annonce.year) && (
                    <p className="text-gray-500 mt-1">
                      {[annonce.make, annonce.model, annonce.year].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-3xl font-bold text-blue-600 whitespace-nowrap">
                  {annonce.price.toLocaleString('fr-FR')} €
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {annonce.mileage && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Kilométrage</p>
                    <p className="font-semibold text-gray-800">{annonce.mileage.toLocaleString('fr-FR')} km</p>
                  </div>
                )}
                {annonce.year && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Année</p>
                    <p className="font-semibold text-gray-800">{annonce.year}</p>
                  </div>
                )}
                {annonce.condition && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">État</p>
                    <p className="font-semibold text-gray-800">{annonce.condition}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Catégorie</p>
                  <p className="font-semibold text-gray-800">{annonce.category}</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{annonce.description}</p>
              </div>

              <Link
                href="/contact"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                📅 Prendre contact
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
