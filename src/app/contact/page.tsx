'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', vehicleMake: '', vehicleModel: '',
    vehicleYear: '', description: '', preferredDate: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'Une erreur est survenue.')
        setStatus('error')
        return
      }
      setStatus('success')
      setForm({ name: '', email: '', phone: '', vehicleMake: '', vehicleModel: '', vehicleYear: '', description: '', preferredDate: '' })
    } catch {
      setErrorMsg('Erreur réseau. Veuillez réessayer.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-clinik-dark mb-3">Prendre rendez-vous</h1>
          <p className="text-gray-500 text-lg">Remplissez le formulaire et nous vous recontacterons rapidement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-8">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Demande envoyée !</h2>
                  <p className="text-gray-500">Nous vous contacterons très prochainement.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 bg-clinik-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                      <input name="name" value={form.name} onChange={handleChange} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red"
                        placeholder="Jean Dupont" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red"
                        placeholder="jean@exemple.fr" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red"
                        placeholder="06 00 00 00 00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                      <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marque du véhicule *</label>
                      <input name="vehicleMake" value={form.vehicleMake} onChange={handleChange} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red"
                        placeholder="Renault" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
                      <input name="vehicleModel" value={form.vehicleModel} onChange={handleChange} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red"
                        placeholder="Clio" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                      <input name="vehicleYear" value={form.vehicleYear} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red"
                        placeholder="2019" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description du problème *</label>
                    <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-clinik-red resize-none"
                      placeholder="Décrivez le problème ou la prestation souhaitée..." />
                  </div>
                  {status === 'error' && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-clinik-red hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors text-lg"
                  >
                    {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-clinik-dark text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-clinik-red">📍 Nous trouver</h3>
              <p className="text-gray-300 text-sm">118 clos des teppes<br />74950 Scionzier, France</p>
            </div>
            <div className="bg-clinik-dark text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-clinik-red">📞 Téléphone</h3>
              <a href="tel:0620185627" className="text-gray-300 text-sm hover:text-white">0 620 185 627</a>
            </div>
            <div className="bg-clinik-dark text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-clinik-red">🕐 Horaires</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <p>Lun – Ven : 9h–12h / 14h–18h</p>
                <p>Samedi : 9h–12h</p>
                <p className="text-red-400">Dimanche : Fermé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
