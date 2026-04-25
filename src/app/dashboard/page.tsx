'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate?: string
  vin?: string
}

interface Intervention {
  id: string
  title: string
  description: string
  date: string
  mileage?: number
  price?: number
  status: string
  vehicle?: Vehicle
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', licensePlate: '', vin: '' })
  const [addVehicleError, setAddVehicleError] = useState('')
  const [addVehicleLoading, setAddVehicleLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/vehicles').then(r => r.json()).then(setVehicles).catch(() => {})
      fetch('/api/interventions').then(r => r.json()).then(setInterventions).catch(() => {})
    }
  }, [status])

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddVehicleError('')
    setAddVehicleLoading(true)
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicleForm, year: parseInt(vehicleForm.year) }),
      })
      if (!res.ok) {
        const d = await res.json()
        setAddVehicleError(d.error || 'Erreur')
        setAddVehicleLoading(false)
        return
      }
      const newVehicle = await res.json()
      setVehicles((prev) => [...prev, newVehicle])
      setVehicleForm({ make: '', model: '', year: '', licensePlate: '', vin: '' })
      setShowAddVehicle(false)
    } catch {
      setAddVehicleError('Erreur réseau')
    }
    setAddVehicleLoading(false)
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Supprimer ce véhicule ?')) return
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    setVehicles((prev) => prev.filter((v) => v.id !== id))
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-clinik-dark text-white rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 bg-clinik-red rounded-full flex items-center justify-center text-2xl font-bold">
            {session.user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bonjour, {session.user?.name} 👋</h1>
            <p className="text-gray-400 text-sm">{session.user?.email}</p>
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-clinik-dark">🚗 Mes véhicules</h2>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="bg-clinik-red hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Ajouter
            </button>
          </div>

          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="bg-gray-50 rounded-xl p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'make', label: 'Marque *', placeholder: 'Renault' },
                { name: 'model', label: 'Modèle *', placeholder: 'Clio' },
                { name: 'year', label: 'Année *', placeholder: '2020', type: 'number' },
                { name: 'licensePlate', label: 'Immatriculation', placeholder: 'AB-123-CD' },
                { name: 'vin', label: 'N° VIN', placeholder: 'VF1...' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    value={(vehicleForm as any)[field.name]}
                    onChange={(e) => setVehicleForm((p) => ({ ...p, [field.name]: e.target.value }))}
                    required={field.label.includes('*')}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinik-red"
                  />
                </div>
              ))}
              {addVehicleError && <p className="col-span-2 text-red-600 text-xs">{addVehicleError}</p>}
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={addVehicleLoading}
                  className="bg-clinik-red text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors">
                  {addVehicleLoading ? 'Ajout...' : 'Ajouter le véhicule'}
                </button>
                <button type="button" onClick={() => setShowAddVehicle(false)}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {vehicles.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Aucun véhicule enregistré.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="border border-gray-200 rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <p className="font-bold text-clinik-dark">{v.make} {v.model} <span className="text-gray-400 font-normal">({v.year})</span></p>
                    {v.licensePlate && <p className="text-xs text-gray-500 mt-1">🔖 {v.licensePlate}</p>}
                    {v.vin && <p className="text-xs text-gray-400">VIN: {v.vin}</p>}
                  </div>
                  <button onClick={() => handleDeleteVehicle(v.id)}
                    className="text-red-400 hover:text-red-600 text-xs ml-4 mt-1 transition-colors">
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interventions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-clinik-dark mb-5">🔧 Historique des interventions</h2>
          {interventions.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Aucune intervention enregistrée.</p>
          ) : (
            <div className="space-y-4">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-clinik-dark">{intervention.title}</h3>
                      {intervention.vehicle && (
                        <p className="text-xs text-gray-500">{intervention.vehicle.make} {intervention.vehicle.model}</p>
                      )}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[intervention.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[intervention.status] || intervention.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{intervention.description}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span>📅 {new Date(intervention.date).toLocaleDateString('fr-FR')}</span>
                    {intervention.mileage && <span>📏 {intervention.mileage.toLocaleString('fr-FR')} km</span>}
                    {intervention.price && <span>💶 {intervention.price.toLocaleString('fr-FR')} €</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
