import Image from 'next/image'
import Link from 'next/link'

const LOGO_URL = 'https://github.com/user-attachments/assets/ec9cd494-9372-4b03-a607-7664abcaa6c2'

const services = [
  { icon: '🔧', title: 'Révision & Entretien', desc: 'Entretien complet selon les préconisations constructeur.' },
  { icon: '💻', title: 'Diagnostic Électronique', desc: 'Lecture de codes défauts et analyse des systèmes embarqués.' },
  { icon: '🛑', title: 'Freinage', desc: 'Remplacement des plaquettes, disques et liquide de frein.' },
  { icon: '🔴', title: 'Pneumatiques', desc: 'Montage, équilibrage et permutation de pneus.' },
  { icon: '🎨', title: 'Carrosserie & Peinture', desc: 'Réparation de carrosserie et retouche peinture.' },
  { icon: '❄️', title: 'Climatisation', desc: 'Recharge et entretien du circuit de climatisation.' },
  { icon: '⚙️', title: 'Distribution', desc: 'Remplacement de la courroie de distribution.' },
  { icon: '🛢️', title: 'Vidange', desc: 'Vidange huile moteur et remplacement du filtre.' },
]

const reviews = [
  { name: 'Marie L.', rating: 5, comment: 'Excellent garage, personnel professionnel et à l\'écoute. Je recommande vivement !' },
  { name: 'Thomas B.', rating: 5, comment: 'Très satisfait du service. Diagnostic rapide et réparation de qualité. Merci !' },
  { name: 'Julien M.', rating: 5, comment: 'Tarifs honnêtes et travail soigné. Mon garage de confiance depuis 3 ans.' },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-yellow-400">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-clinik-dark text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-clinik-dark to-gray-800 opacity-95" />
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-full overflow-hidden mb-8 ring-4 ring-clinik-red shadow-2xl">
            <Image
              src={LOGO_URL}
              alt="Clinikauto"
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Bienvenue chez <span className="text-clinik-red">Clinik</span><span className="text-clinik-blue">Auto</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl">
            Votre garage de confiance à Scionzier
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-clinik-red hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg shadow-lg"
            >
              📅 Prendre RDV
            </Link>
            <Link
              href="/annonces"
              className="border-2 border-white text-white hover:bg-white hover:text-clinik-dark font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              🚗 Voir nos annonces
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-clinik-dark mb-3">Nos Services</h2>
            <p className="text-gray-500 text-lg">Tout ce dont votre véhicule a besoin, en un seul endroit</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-bold text-clinik-dark text-lg mb-2 group-hover:text-clinik-red transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horaires & Localisation */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-clinik-dark mb-3">Horaires & Localisation</h2>
            <p className="text-gray-500 text-lg">Nous sommes là pour vous</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hours */}
            <div className="bg-clinik-dark text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-clinik-red">🕐</span> Horaires d&apos;ouverture
              </h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-700">
                  {[
                    { day: 'Lundi', hours: '9h – 12h / 14h – 18h' },
                    { day: 'Mardi', hours: '9h – 12h / 14h – 18h' },
                    { day: 'Mercredi', hours: '9h – 12h / 14h – 18h' },
                    { day: 'Jeudi', hours: '9h – 12h / 14h – 18h' },
                    { day: 'Vendredi', hours: '9h – 12h / 14h – 18h' },
                    { day: 'Samedi', hours: '9h – 12h' },
                    { day: 'Dimanche', hours: 'Fermé', closed: true },
                  ].map(({ day, hours, closed }) => (
                    <tr key={day}>
                      <td className="py-3 font-medium text-gray-200">{day}</td>
                      <td className={`py-3 text-right ${closed ? 'text-red-400' : 'text-green-400'}`}>{hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-clinik-dark mb-6 flex items-center gap-2">
                <span className="text-clinik-red">📍</span> Nous trouver
              </h3>
              <div className="space-y-5 text-gray-600">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">🏠</div>
                  <div>
                    <p className="font-semibold text-clinik-dark">Adresse</p>
                    <p>118 clos des teppes<br />74950 Scionzier, France</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <p className="font-semibold text-clinik-dark">Téléphone</p>
                    <a href="tel:0620185627" className="text-clinik-blue hover:underline font-medium text-lg">
                      0 620 185 627
                    </a>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/118+clos+des+teppes+74950+Scionzier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-clinik-blue text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-2"
                >
                  ��️ Voir sur Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avis Clients */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-clinik-dark mb-3">Avis Clients</h2>
            <p className="text-gray-500 text-lg">Ce que nos clients pensent de nous</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.name} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <StarRating count={review.rating} />
                <p className="text-gray-600 mt-3 mb-4 italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                <p className="font-semibold text-clinik-dark">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-clinik-red text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Votre voiture a besoin d&apos;entretien ?
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Prenez rendez-vous en ligne dès maintenant ou appelez-nous directement.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-clinik-red hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg shadow-lg"
            >
              📅 Prendre RDV
            </Link>
            <a
              href="tel:0620185627"
              className="border-2 border-white text-white hover:bg-white hover:text-clinik-red font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              📞 0 620 185 627
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
