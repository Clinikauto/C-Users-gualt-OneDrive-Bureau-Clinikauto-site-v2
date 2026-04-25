'use client'
import { useState } from 'react'

interface ContactRequest {
  id: string
  name: string
  email: string
  phone: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  description: string
  preferredDate?: string | null
  status: string
  createdAt: string | Date
}

const STATUS_LABELS: Record<string, string> = { NEW: 'Nouveau', IN_PROGRESS: 'En cours', DONE: 'Terminé' }
const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
}

export default function AdminContactsClient({ contacts: initial }: { contacts: ContactRequest[] }) {
  const [contacts, setContacts] = useState(initial)

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Aucune demande.</div>
      ) : contacts.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-clinik-dark text-lg">{c.name}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                <a href={`mailto:${c.email}`} className="hover:text-clinik-blue">{c.email}</a>
                <a href={`tel:${c.phone}`} className="hover:text-clinik-blue">{c.phone}</a>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[c.status] || c.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Véhicule :</span> {c.vehicleMake} {c.vehicleModel} {c.vehicleYear && `(${c.vehicleYear})`}
          </p>
          {c.preferredDate && (
            <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Date souhaitée :</span> {c.preferredDate}</p>
          )}
          <p className="text-sm text-gray-600 mb-4">{c.description}</p>
          <div className="flex gap-2 flex-wrap">
            {['NEW', 'IN_PROGRESS', 'DONE'].map((s) => (
              <button key={s} onClick={() => updateStatus(c.id, s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  c.status === s ? 'bg-clinik-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))}
    </div>
  )
}
