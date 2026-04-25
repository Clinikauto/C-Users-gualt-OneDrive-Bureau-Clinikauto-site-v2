import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default async function AnnoncesPage() {
  const annonces = await prisma.annonce.findMany({
    where: { status: 'ACTIVE' },
    take: 12,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nos annonces</h1>
          <p className="text-gray-600 mb-8">Découvrez nos véhicules disponibles à la vente.</p>

          {annonces.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🚗</div>
              <p>Aucune annonce disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {annonces.map((annonce) => {
                const images = (() => {
                  try { return JSON.parse(annonce.images) as string[] } catch { return [] }
                })()
                return (
                  <Link key={annonce.id} href={`/annonces/${annonce.id}`}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        {images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={images[0]} alt={annonce.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl">🚗</span>
                        )}
                      </div>
                      <div className="p-5">
                        <h2 className="font-bold text-gray-800 text-lg mb-1 truncate">{annonce.title}</h2>
                        {(annonce.make || annonce.model || annonce.year) && (
                          <p className="text-gray-500 text-sm mb-2">
                            {[annonce.make, annonce.model, annonce.year].filter(Boolean).join(' • ')}
                          </p>
                        )}
                        {annonce.mileage && (
                          <p className="text-gray-500 text-sm mb-2">{annonce.mileage.toLocaleString('fr-FR')} km</p>
                        )}
                        <p className="text-blue-600 font-bold text-xl mt-3">
                          {annonce.price.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
