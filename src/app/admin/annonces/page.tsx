'use client'

import { useEffect, useState } from 'react'

interface Annonce {
  id: string
  title: string
  price: number
  make?: string
  model?: string
  year?: number
  status: string
  createdAt: string
}

const emptyForm = {
  title: '', description: '', price: '', make: '', model: '', year: '',
  mileage: '', condition: '', category: 'CAR',
}

export default function AdminAnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    fetch('/api/admin/annonces')
      .then((r) => r.json())
      .then((d) => { setAnnonces(d.annonces ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/annonces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSaving(false)
    if (res.ok) { setForm(emptyForm); setShowForm(false); load() }
    else { const d = await res.json(); setError(d.error ?? 'Erreur') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await fetch(`/api/admin/annonces/${id}`, { method: 'DELETE' })
    load()
  }

  async function toggleStatus(id: string, current: string) {
    const status = current === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE'
    await fetch(`/api/admin/annonces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Annonces</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700">
          + Nouvelle annonce
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Nouvelle annonce</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            {[
              { label: 'Prix (€) *', name: 'price', required: true },
              { label: 'Marque', name: 'make', required: false },
              { label: 'Modèle', name: 'model', required: false },
              { label: 'Année', name: 'year', required: false },
              { label: 'Kilométrage', name: 'mileage', required: false },
              { label: 'État', name: 'condition', required: false },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input name={f.name} value={form[f.name as keyof typeof form]} onChange={handleChange} required={f.required} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="text-gray-500">Chargement...</div> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Titre</th>
                <th className="text-left px-5 py-3 font-medium">Prix</th>
                <th className="text-left px-5 py-3 font-medium">Véhicule</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
                <th className="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {annonces.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-medium text-gray-800">{a.title}</td>
                  <td className="px-5 py-3 text-blue-600 font-medium">{a.price.toLocaleString('fr-FR')} €</td>
                  <td className="px-5 py-3 text-gray-600">{[a.make, a.model, a.year].filter(Boolean).join(' ')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => toggleStatus(a.id, a.status)} className="text-xs text-blue-600 hover:underline">
                        {a.status === 'ACTIVE' ? 'Masquer' : 'Activer'}
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
