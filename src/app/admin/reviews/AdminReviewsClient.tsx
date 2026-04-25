'use client'
import { useState } from 'react'

interface Review {
  id: string
  authorName: string
  authorEmail: string
  rating: number
  comment: string
  approved: boolean
  createdAt: string | Date
}

export default function AdminReviewsClient({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initial)

  const approve = async (id: string, approved: boolean) => {
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    })
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)))
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Supprimer cet avis ?')) return
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">Aucun avis.</div>
      ) : reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="font-bold text-clinik-dark">{r.authorName}</p>
              <p className="text-xs text-gray-400">{r.authorEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {r.approved ? 'Approuvé' : 'En attente'}
              </span>
              <div className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-3 italic">&ldquo;{r.comment}&rdquo;</p>
          <div className="flex gap-2 mt-4">
            {!r.approved ? (
              <button onClick={() => approve(r.id, true)}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                ✓ Approuver
              </button>
            ) : (
              <button onClick={() => approve(r.id, false)}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                Désapprouver
              </button>
            )}
            <button onClick={() => deleteReview(r.id)}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors">
              Supprimer
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  )
}
