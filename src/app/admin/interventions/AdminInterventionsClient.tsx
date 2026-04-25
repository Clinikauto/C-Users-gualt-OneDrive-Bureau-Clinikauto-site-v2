'use client'
import { useState } from 'react'

interface Intervention {
  id: string
  title: string
  description: string
  date: string | Date
  mileage?: number | null
  price?: number | null
  status: string
  notes?: string | null
  user: { name: string; email: string }
  vehicle?: { make: string; model: string; year: number } | null
}

const STATUS_LABELS: Record<string, string> = { PENDING: 'En attente', IN_PROGRESS: 'En cours', DONE: 'Terminé' }
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
}

export default function AdminInterventionsClient({ interventions: initial }: { interventions: Intervention[] }) {
  const [interventions, setInterventions] = useState(initial)

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/interventions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setInterventions((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  return (
    <div className="space-y-4">
      {interventions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Aucune intervention.</div>
      ) : interventions.map((i) => (
        <div key={i.id} className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-clinik-dark text-lg">{i.title}</h3>
              <p className="text-sm text-gray-500">{i.user.name} ({i.user.email})</p>
              {i.vehicle && (
                <p className="text-xs text-gray-400">{i.vehicle.make} {i.vehicle.model} ({i.vehicle.year})</p>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[i.status] || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABELS[i.status] || i.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{i.description}</p>
          {i.notes && <p className="text-sm text-gray-500 italic mb-3">Notes: {i.notes}</p>}
          <div className="flex gap-3 text-xs text-gray-400 mb-4">
            <span>📅 {new Date(i.date).toLocaleDateString('fr-FR')}</span>
            {i.mileage && <span>📏 {i.mileage.toLocaleString('fr-FR')} km</span>}
            {i.price && <span>💶 {i.price.toLocaleString('fr-FR')} €</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {['PENDING', 'IN_PROGRESS', 'DONE'].map((s) => (
              <button key={s} onClick={() => updateStatus(i.id, s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  i.status === s ? 'bg-clinik-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
