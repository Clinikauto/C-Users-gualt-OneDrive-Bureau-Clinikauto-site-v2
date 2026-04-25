'use client'

import { useEffect, useState } from 'react'

interface Stats {
  users: number
  vehicles: number
  interventions: number
  contacts: number
  annonces: number
  reviews: number
  pendingContacts: number
  pendingReviews: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats)
  }, [])

  if (!stats) return <div className="text-gray-500">Chargement...</div>

  const cards = [
    { label: 'Utilisateurs', value: stats.users, icon: '👥', color: 'blue' },
    { label: 'Véhicules', value: stats.vehicles, icon: '🚗', color: 'blue' },
    { label: 'Interventions', value: stats.interventions, icon: '🔧', color: 'blue' },
    { label: 'Annonces', value: stats.annonces, icon: '📋', color: 'blue' },
    { label: 'Contacts en attente', value: stats.pendingContacts, icon: '📬', color: 'orange' },
    { label: 'Avis à valider', value: stats.pendingReviews, icon: '⭐', color: 'orange' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-gray-500 text-sm mb-1">{card.label}</p>
            <p className={`text-4xl font-bold ${card.color === 'orange' ? 'text-orange-500' : 'text-blue-600'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
