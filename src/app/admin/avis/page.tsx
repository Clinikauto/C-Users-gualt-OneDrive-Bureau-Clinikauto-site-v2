'use client'

import { useEffect, useState } from 'react'

interface Review {
  id: string
  authorName: string
  authorEmail: string
  rating: number
  comment: string
  approved: boolean
  createdAt: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)

  function load(approved?: string) {
    setLoading(true)
    const url = approved !== undefined && approved !== '' ? `/api/admin/reviews?approved=${approved}` : '/api/admin/reviews'
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  function handleFilter(val: string) {
    setFilter(val)
    load(val)
  }

  async function updateApproval(id: string, approved: boolean) {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    load(filter)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Avis clients</h2>
        <div className="flex gap-2">
          {[{ val: '', label: 'Tous' }, { val: 'false', label: 'En attente' }, { val: 'true', label: 'Approuvés' }].map((f) => (
            <button
              key={f.val}
              onClick={() => handleFilter(f.val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-gray-500">Chargement...</div> : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">Aucun avis.</div>
          ) : reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-800">{r.authorName}</span>
                    <span className="text-yellow-500">{'⭐'.repeat(r.rating)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.approved ? 'Approuvé' : 'En attente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{r.authorEmail} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p className="text-gray-700 italic">&quot;{r.comment}&quot;</p>
                </div>
                <div className="flex flex-col gap-2 min-w-max">
                  {!r.approved && (
                    <button onClick={() => updateApproval(r.id, true)} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200">
                      Approuver
                    </button>
                  )}
                  {r.approved && (
                    <button onClick={() => updateApproval(r.id, false)} className="text-xs bg-red-100 text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-200">
                      Rejeter
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
