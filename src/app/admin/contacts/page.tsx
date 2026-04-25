'use client'

import { useEffect, useState } from 'react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  description: string
  preferredDate?: string
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  READ: 'bg-yellow-100 text-yellow-800',
  HANDLED: 'bg-green-100 text-green-800',
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  function load(status?: string) {
    setLoading(true)
    const url = status ? `/api/admin/contacts?status=${status}` : '/api/admin/contacts'
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setContacts(d.contacts ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  function handleFilter(status: string) {
    setFilter(status)
    load(status || undefined)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load(filter || undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Demandes de contact</h2>
        <div className="flex gap-2">
          {['', 'NEW', 'READ', 'HANDLED'].map((s) => (
            <button
              key={s}
              onClick={() => handleFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {s === '' ? 'Tous' : s === 'NEW' ? 'Nouveau' : s === 'READ' ? 'Lu' : 'Traité'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">Aucune demande.</div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-800">{c.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{c.email} · {c.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Véhicule : {c.vehicleMake} {c.vehicleModel} ({c.vehicleYear})
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  {c.preferredDate && <p className="text-sm text-gray-500 mt-1">📅 Date souhaitée : {c.preferredDate}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-max">
                  {c.status !== 'READ' && (
                    <button onClick={() => updateStatus(c.id, 'READ')} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg hover:bg-yellow-200">
                      Marquer lu
                    </button>
                  )}
                  {c.status !== 'HANDLED' && (
                    <button onClick={() => updateStatus(c.id, 'HANDLED')} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200">
                      Marquer traité
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
