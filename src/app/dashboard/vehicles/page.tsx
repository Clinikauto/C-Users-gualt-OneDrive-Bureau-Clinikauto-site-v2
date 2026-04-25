'use client'

import { useEffect, useState } from 'react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate?: string
  vin?: string
}

const emptyForm = { make: '', model: '', year: '', licensePlate: '', vin: '' }

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    fetch('/api/dashboard/vehicles')
      .then((r) => r.json())
      .then((v) => { setVehicles(Array.isArray(v) ? v : []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = editId ? `/api/dashboard/vehicles/${editId}` : '/api/dashboard/vehicles'
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, year: parseInt(form.year) }),
    })

    setSaving(false)
    if (res.ok) {
      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      load()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la sauvegarde.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce véhicule ?')) return
    await fetch(`/api/dashboard/vehicles/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(v: Vehicle) {
    setForm({ make: v.make, model: v.model, year: String(v.year), licensePlate: v.licensePlate ?? '', vin: v.vin ?? '' })
    setEditId(v.id)
    setShowForm(true)
  }

  if (loading) return <div className="text-gray-500">Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Mes véhicules</h2>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">{editId ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Marque *', name: 'make', required: true, placeholder: 'Renault' },
              { label: 'Modèle *', name: 'model', required: true, placeholder: 'Clio' },
              { label: 'Année *', name: 'year', required: true, placeholder: '2020' },
              { label: 'Immatriculation', name: 'licensePlate', required: false, placeholder: 'AB-123-CD' },
              { label: 'VIN', name: 'vin', required: false, placeholder: 'VF1ABC...' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type="text"
                  name={f.name}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  required={f.required}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            {error && <div className="col-span-2 text-red-600 text-sm">{error}</div>}
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          <div className="text-5xl mb-3">🚗</div>
          <p>Aucun véhicule enregistré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="font-bold text-gray-800">{v.make} {v.model}</h3>
              <p className="text-gray-500 text-sm">{v.year}</p>
              {v.licensePlate && <p className="text-gray-500 text-sm">{v.licensePlate}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => startEdit(v)} className="text-sm text-blue-600 hover:underline">Modifier</button>
                <button onClick={() => handleDelete(v.id)} className="text-sm text-red-600 hover:underline">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
