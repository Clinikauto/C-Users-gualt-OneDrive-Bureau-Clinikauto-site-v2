import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

async function getApprovedReviews() {
  return prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export default async function Home() {
  const reviews = await getApprovedReviews()

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Votre garage de confiance
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Diagnostic, réparation, entretien et carrosserie — nous prenons soin de votre véhicule avec expertise et transparence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                📅 Prendre RDV
              </Link>
              <Link
                href="/annonces"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-colors"
              >
                🚗 Voir nos annonces
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nos services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🔍', title: 'Diagnostic', desc: 'Identification précise des pannes grâce à nos équipements de pointe.' },
                { icon: '🔧', title: 'Réparation', desc: 'Réparations mécaniques et électroniques de toutes marques.' },
                { icon: '🛢️', title: 'Entretien', desc: 'Révision, vidange, freins, pneumatiques et plus encore.' },
                { icon: '🚗', title: 'Carrosserie', desc: 'Remise en état de carrosserie et peinture professionnelle.' },
              ].map((s) => (
                <div key={s.title} className="bg-blue-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-4">{s.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Pourquoi nous choisir ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '🏆', title: 'Expertise reconnue', desc: "Plus de 15 ans d'expérience dans la réparation automobile toutes marques." },
                { icon: '⚡', title: "Rapidité d'intervention", desc: "Diagnostic rapide et délais d'intervention optimisés pour votre confort." },
                { icon: '💬', title: 'Transparence totale', desc: 'Devis détaillé avant chaque intervention, sans mauvaise surprise.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Avis de nos clients</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <p className="text-gray-700 italic mb-4">&quot;{review.comment}&quot;</p>
                    <p className="text-sm font-semibold text-gray-600">— {review.authorName}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 px-4 bg-blue-600 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Besoin d&apos;un rendez-vous ?</h2>
            <p className="text-blue-100 mb-8 text-lg">Contactez-nous dès maintenant pour planifier votre intervention.</p>
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow"
            >
              Contactez-nous
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
