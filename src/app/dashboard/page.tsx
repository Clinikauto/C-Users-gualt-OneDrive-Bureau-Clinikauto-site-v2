'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate?: string
}

interface Intervention {
  id: string
  title: string
  date: string
  status: string
  vehicle?: Vehicle
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-700' },
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/vehicles').then((r) => r.json()),
      fetch('/api/dashboard/interventions').then((r) => r.json()),
    ]).then(([v, i]) => {
      setVehicles(Array.isArray(v) ? v : [])
      setInterventions(Array.isArray(i) ? i : [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-gray-500">Chargement...</div>

  const recent = interventions.slice(0, 5)

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Vue d&apos;ensemble</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-gray-500 text-sm mb-1">Mes véhicules</p>
          <p className="text-4xl font-bold text-blue-600">{vehicles.length}</p>
          <Link href="/dashboard/vehicles" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Gérer →</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-gray-500 text-sm mb-1">Mes interventions</p>
          <p className="text-4xl font-bold text-blue-600">{interventions.length}</p>
          <Link href="/dashboard/interventions" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Voir →</Link>
        </div>
      </div>

      {/* Recent interventions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Interventions récentes</h3>
        {recent.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune intervention pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((i) => {
              const s = STATUS_LABELS[i.status] ?? { label: i.status, color: 'bg-gray-100 text-gray-700' }
              return (
                <div key={i.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{i.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(i.date).toLocaleDateString('fr-FR')}
                      {i.vehicle ? ` · ${i.vehicle.make} ${i.vehicle.model}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
