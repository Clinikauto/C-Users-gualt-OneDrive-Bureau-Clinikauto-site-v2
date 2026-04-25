'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface Intervention {
  id: string
  title: string
  description: string
  date: string
  status: string
  price?: number
  user: { name: string; email: string }
  vehicle?: { make: string; model: string; year: number }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700' },
}

const emptyForm = { userId: '', vehicleId: '', title: '', description: '', date: '', mileage: '', price: '', status: 'PENDING', notes: '' }

export default function AdminInterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  function load(status?: string) {
    setLoading(true)
    const url = status ? `/api/admin/interventions?status=${status}` : '/api/admin/interventions'
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setInterventions(d.interventions ?? []); setLoading(false) })
  }

  useEffect(() => {
    load()
    fetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(d.users ?? []))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { setForm(emptyForm); setShowForm(false); load(filterStatus || undefined) }
    else { const d = await res.json(); setError(d.error ?? 'Erreur') }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/interventions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load(filterStatus || undefined)
  }

  function handleFilterStatus(s: string) {
    setFilterStatus(s)
    load(s || undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Interventions</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700">
          + Nouvelle intervention
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => handleFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {s === '' ? 'Tous' : STATUS_LABELS[s]?.label ?? s}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Nouvelle intervention</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select name="userId" value={form.userId} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            {[
              { label: 'Titre *', name: 'title', required: true },
              { label: 'Date *', name: 'date', required: true, type: 'date' },
              { label: 'Prix (€)', name: 'price', required: false },
              { label: 'Kilométrage', name: 'mileage', required: false },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type ?? 'text'} name={f.name} value={form[f.name as keyof typeof form]} onChange={handleChange} required={f.required} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
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
        <div className="space-y-4">
          {interventions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">Aucune intervention.</div>
          ) : interventions.map((i) => {
            const s = STATUS_LABELS[i.status] ?? { label: i.status, color: 'bg-gray-100 text-gray-700' }
            return (
              <div key={i.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-800">{i.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{i.user.name} · {new Date(i.date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-gray-600">{i.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 min-w-max">
                    {i.status !== 'IN_PROGRESS' && (
                      <button onClick={() => updateStatus(i.id, 'IN_PROGRESS')} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-200">En cours</button>
                    )}
                    {i.status !== 'COMPLETED' && (
                      <button onClick={() => updateStatus(i.id, 'COMPLETED')} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200">Terminé</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
