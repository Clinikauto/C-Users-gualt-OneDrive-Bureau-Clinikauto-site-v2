'use client'

import { useEffect, useState } from 'react'

interface Intervention {
  id: string
  title: string
  description: string
  date: string
  status: string
  price?: number
  mileage?: number
  vehicle?: { make: string; model: string; year: number }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700' },
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/interventions')
      .then((r) => r.json())
      .then((d) => { setInterventions(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  if (loading) return <div className="text-gray-500">Chargement...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mes interventions</h2>

      {interventions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          <div className="text-5xl mb-3">🔧</div>
          <p>Aucune intervention enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interventions.map((i) => {
            const s = STATUS_LABELS[i.status] ?? { label: i.status, color: 'bg-gray-100 text-gray-700' }
            return (
              <div key={i.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800">{i.title}</h3>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{i.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📅 {new Date(i.date).toLocaleDateString('fr-FR')}</span>
                      {i.vehicle && <span>🚗 {i.vehicle.make} {i.vehicle.model} ({i.vehicle.year})</span>}
                      {i.mileage && <span>📍 {i.mileage.toLocaleString('fr-FR')} km</span>}
                    </div>
                  </div>
                  {i.price !== undefined && i.price !== null && (
                    <div className="text-xl font-bold text-blue-600 whitespace-nowrap">
                      {i.price.toLocaleString('fr-FR')} €
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
