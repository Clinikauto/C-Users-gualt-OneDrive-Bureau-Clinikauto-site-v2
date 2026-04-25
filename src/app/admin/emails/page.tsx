'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailLog {
  id: string
  from: string
  subject: string
  receivedAt: string
  category: string
  status: string
  imapFolder: string
  autoReplied: boolean
  linkedType: string | null
  linkedId: string | null
}

interface EmailRule {
  id: string
  name: string
  senders: string
  subjects: string
  keywords: string
  category: string
  imapFolder: string
  autoReply: boolean
  active: boolean
  priority: number
}

const CATEGORIES = ['CONTACT', 'INVOICE', 'REVIEW', 'SPAM', 'GENERAL']

const CATEGORY_LABELS: Record<string, string> = {
  CONTACT: 'Devis / Contact',
  INVOICE: 'Factures',
  REVIEW: 'Avis clients',
  SPAM: 'Spam',
  GENERAL: 'Général',
}

const STATUS_COLORS: Record<string, string> = {
  PROCESSED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  IGNORED: 'bg-gray-100 text-gray-600',
}

const CATEGORY_COLORS: Record<string, string> = {
  CONTACT: 'bg-blue-100 text-blue-800',
  INVOICE: 'bg-purple-100 text-purple-800',
  REVIEW: 'bg-orange-100 text-orange-800',
  SPAM: 'bg-red-100 text-red-700',
  GENERAL: 'bg-gray-100 text-gray-700',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ text, colorClass }: { text: string; colorClass: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{text}</span>
  )
}

function RuleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<EmailRule>
  onSave: (data: Partial<EmailRule>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? 'CONTACT',
    imapFolder: initial?.imapFolder ?? '',
    senders: initial?.senders ? JSON.parse(initial.senders).join(', ') : '',
    subjects: initial?.subjects ? JSON.parse(initial.subjects).join(', ') : '',
    keywords: initial?.keywords ? JSON.parse(initial.keywords).join(', ') : '',
    autoReply: initial?.autoReply ?? false,
    active: initial?.active ?? true,
    priority: initial?.priority ?? 0,
  })

  const splitCSV = (v: string) =>
    v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: form.name,
      category: form.category,
      imapFolder: form.imapFolder,
      senders: JSON.stringify(splitCSV(form.senders)),
      subjects: JSON.stringify(splitCSV(form.subjects)),
      keywords: JSON.stringify(splitCSV(form.keywords)),
      autoReply: form.autoReply,
      active: form.active,
      priority: Number(form.priority),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-gray-50 p-4 rounded-lg border">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nom de la règle *</label>
          <input
            required
            className="w-full border rounded px-3 py-1.5 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie *</label>
          <select
            className="w-full border rounded px-3 py-1.5 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dossier IMAP cible *</label>
          <input
            required
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="ex: Clinikauto/Devis"
            value={form.imapFolder}
            onChange={(e) => setForm({ ...form, imapFolder: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priorité</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-1.5 text-sm"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Expéditeurs (séparés par des virgules)
          </label>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="ex: @fournisseur.com, contact@garage.fr"
            value={form.senders}
            onChange={(e) => setForm({ ...form, senders: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Mots-clés objet (séparés par des virgules)
          </label>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="ex: devis, rdv, rendez-vous"
            value={form.subjects}
            onChange={(e) => setForm({ ...form, subjects: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Mots-clés corps (séparés par des virgules)
          </label>
          <input
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="ex: intervention, réparation"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoReply}
            onChange={(e) => setForm({ ...form, autoReply: e.target.checked })}
          />
          Accusé de réception automatique
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Règle active
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 text-sm rounded border hover:bg-gray-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminEmailsPage() {
  const [tab, setTab] = useState<'logs' | 'rules'>('logs')

  // Logs state
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [logsLoading, setLogsLoading] = useState(false)

  // Rules state
  const [rules, setRules] = useState<EmailRule[]>([])
  const [rulesLoading, setRulesLoading] = useState(false)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<EmailRule | null>(null)

  // ── Fetch logs ──
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(logsPage), limit: '20' })
      if (filterCategory) params.set('category', filterCategory)
      if (filterStatus) params.set('status', filterStatus)
      const res = await fetch(`/api/admin/emails?${params}`)
      const json = await res.json()
      setLogs(json.data ?? [])
      setLogsTotal(json.total ?? 0)
    } finally {
      setLogsLoading(false)
    }
  }, [logsPage, filterCategory, filterStatus])

  useEffect(() => { void fetchLogs() }, [fetchLogs])

  // ── Fetch rules ──
  const fetchRules = useCallback(async () => {
    setRulesLoading(true)
    try {
      const res = await fetch('/api/admin/email-rules')
      setRules(await res.json())
    } finally {
      setRulesLoading(false)
    }
  }, [])

  useEffect(() => { void fetchRules() }, [fetchRules])

  // ── Create / update rule ──
  async function saveRule(data: Partial<EmailRule>) {
    if (editingRule) {
      await fetch(`/api/admin/email-rules/${editingRule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/admin/email-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setShowRuleForm(false)
    setEditingRule(null)
    void fetchRules()
  }

  async function deleteRule(id: string) {
    if (!confirm('Supprimer cette règle ?')) return
    await fetch(`/api/admin/email-rules/${id}`, { method: 'DELETE' })
    void fetchRules()
  }

  const totalPages = Math.max(1, Math.ceil(logsTotal / 20))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion automatique des emails</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['logs', 'rules'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'logs' ? '📥 Historique des emails' : '⚙️ Règles de tri'}
          </button>
        ))}
      </div>

      {/* ── LOGS TAB ── */}
      {tab === 'logs' && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setLogsPage(1) }}
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-1.5 text-sm"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setLogsPage(1) }}
            >
              <option value="">Tous statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PROCESSED">Traité</option>
              <option value="ERROR">Erreur</option>
              <option value="IGNORED">Ignoré</option>
            </select>
            <button
              onClick={() => void fetchLogs()}
              className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
            >
              🔄 Actualiser
            </button>
            <span className="ml-auto text-sm text-gray-500 self-center">
              {logsTotal} email(s) au total
            </span>
          </div>

          {logsLoading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Chargement…</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Aucun email enregistré</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Expéditeur</th>
                    <th className="px-4 py-3 text-left">Objet</th>
                    <th className="px-4 py-3 text-left">Reçu le</th>
                    <th className="px-4 py-3 text-left">Catégorie</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left">AR</th>
                    <th className="px-4 py-3 text-left">Lié à</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 max-w-[160px] truncate" title={log.from}>
                        {log.from}
                      </td>
                      <td className="px-4 py-3 max-w-[240px] truncate" title={log.subject}>
                        {log.subject}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(log.receivedAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          text={CATEGORY_LABELS[log.category] ?? log.category}
                          colorClass={CATEGORY_COLORS[log.category] ?? 'bg-gray-100'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          text={log.status}
                          colorClass={STATUS_COLORS[log.status] ?? 'bg-gray-100'}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {log.autoReplied ? '✅' : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {log.linkedType ? `${log.linkedType} #${log.linkedId?.slice(0, 8)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              <button
                disabled={logsPage === 1}
                onClick={() => setLogsPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="px-3 py-1 text-sm">
                Page {logsPage} / {totalPages}
              </span>
              <button
                disabled={logsPage === totalPages}
                onClick={() => setLogsPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── RULES TAB ── */}
      {tab === 'rules' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {rules.length} règle(s) configurée(s). Les règles de plus haute priorité s&apos;appliquent en premier.
            </p>
            <button
              onClick={() => { setEditingRule(null); setShowRuleForm(true) }}
              className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              + Nouvelle règle
            </button>
          </div>

          {(showRuleForm && !editingRule) && (
            <div className="mb-4">
              <RuleForm
                onSave={saveRule}
                onCancel={() => setShowRuleForm(false)}
              />
            </div>
          )}

          {rulesLoading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Chargement…</p>
          ) : rules.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">
              Aucune règle. Les règles intégrées s&apos;appliquent par défaut.
            </p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  {editingRule?.id === rule.id ? (
                    <RuleForm
                      initial={rule}
                      onSave={saveRule}
                      onCancel={() => setEditingRule(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{rule.name}</span>
                          <Badge
                            text={CATEGORY_LABELS[rule.category] ?? rule.category}
                            colorClass={CATEGORY_COLORS[rule.category] ?? 'bg-gray-100'}
                          />
                          {!rule.active && (
                            <Badge text="Désactivée" colorClass="bg-gray-100 text-gray-500" />
                          )}
                          {rule.autoReply && (
                            <Badge text="AR auto" colorClass="bg-green-100 text-green-700" />
                          )}
                          <span className="text-xs text-gray-400 ml-auto">
                            Priorité {rule.priority}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p>📁 {rule.imapFolder}</p>
                          {JSON.parse(rule.senders).length > 0 && (
                            <p>👤 {JSON.parse(rule.senders).join(', ')}</p>
                          )}
                          {JSON.parse(rule.subjects).length > 0 && (
                            <p>📝 Objet : {JSON.parse(rule.subjects).join(', ')}</p>
                          )}
                          {JSON.parse(rule.keywords).length > 0 && (
                            <p>🔍 Corps : {JSON.parse(rule.keywords).join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => void deleteRule(rule.id)}
                          className="px-3 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
