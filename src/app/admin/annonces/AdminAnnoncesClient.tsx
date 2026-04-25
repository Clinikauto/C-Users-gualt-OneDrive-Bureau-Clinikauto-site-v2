'use client'
import { useState } from 'react'

interface Annonce {
  id: string
  title: string
  price: number
  category: string
  make?: string | null
  model?: string | null
  year?: number | null
  mileage?: number | null
  status: string
  createdAt: string | Date
}

const emptyForm = {
  title: '', description: '', price: '', category: 'CAR',
  make: '', model: '', year: '', mileage: '', condition: '', status: 'ACTIVE'
}

export default function AdminAnnoncesClient({ annonces: initial }: { annonces: Annonce[] }) {
  const [annonces, setAnnonces] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/annonces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          year: form.year ? parseInt(form.year) : undefined,
          mileage: form.mileage ? parseInt(form.mileage) : undefined,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); setLoading(false); return }
      const newAnnonce = await res.json()
      setAnnonces((prev) => [newAnnonce, ...prev])
      setForm(emptyForm)
      setShowForm(false)
    } catch { setError('Erreur réseau') }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return
    await fetch(`/api/annonces/${id}`, { method: 'DELETE' })
    setAnnonces((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-clinik-red hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        {showForm ? '✕ Annuler' : '+ Nouvelle annonce'}
      </button>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-clinik-dark mb-4">Créer une annonce</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'title', label: 'Titre *', placeholder: 'Renault Clio 2019' },
              { name: 'price', label: 'Prix (€) *', placeholder: '5900', type: 'number' },
              { name: 'make', label: 'Marque', placeholder: 'Renault' },
              { name: 'model', label: 'Modèle', placeholder: 'Clio' },
              { name: 'year', label: 'Année', placeholder: '2019', type: 'number' },
              { name: 'mileage', label: 'Kilométrage', placeholder: '85000', type: 'number' },
              { name: 'condition', label: 'État', placeholder: 'Bon état' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input name={f.name} type={f.type || 'text'} value={(form as any)[f.name]} onChange={handleChange}
                  required={f.label.includes('*')} placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinik-red" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinik-red">
                <option value="CAR">Véhicule</option>
                <option value="PIECE">Pièce</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinik-red resize-none" />
            </div>
            {error && <p className="sm:col-span-2 text-red-600 text-xs">{error}</p>}
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="bg-clinik-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-60 transition-colors text-sm">
                {loading ? 'Création...' : 'Créer l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {annonces.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Aucune annonce.</div>
        ) : annonces.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-clinik-dark">{a.title}</p>
              <p className="text-sm text-gray-500">{a.make} {a.model} {a.year && `(${a.year})`} {a.mileage && `• ${a.mileage.toLocaleString('fr-FR')} km`}</p>
            </div>
            <p className="text-clinik-red font-bold">{a.price.toLocaleString('fr-FR')} €</p>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{a.category}</span>
            <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-sm transition-colors">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  )
}
