import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GoalCard from '../components/ui/GoalCard.jsx'
import GoalModal from '../components/ui/GoalModal.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import { getGoals } from '../services/api.js'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  async function fetchGoals() {
    setLoading(true)
    setError('')
    try {
      const data = await getGoals()
      setGoals(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  function handleCreated(goal) {
    setGoals((prev) => [...prev, goal])
  }

  function handleUpdate(updated) {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  function handleDelete(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalCurrent = goals.reduce((s, g) => s + (g.current_amount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
          {goals.length > 0
            ? `${goals.length} active goal${goals.length > 1 ? 's' : ''} · \u20B9${Math.round(totalCurrent).toLocaleString('en-IN')} saved of \u20B9${Math.round(totalTarget).toLocaleString('en-IN')} targeted`
            : 'No goals yet — create one to start tracking.'}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink-950 dark:bg-vault text-paper-raised dark:text-ink-950
            px-3.5 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={15} /> New Goal
        </button>
      </div>

      {loading && <LoadingState label="Loading goals…" />}
      {!loading && error && <ErrorState message={error} onRetry={fetchGoals} />}

      {!loading && !error && goals.length === 0 && (
        <div
          onClick={() => setShowModal(true)}
          className="rounded-card border-2 border-dashed border-line-light dark:border-line
            flex flex-col items-center justify-center py-16 gap-3 cursor-pointer
            hover:border-vault/40 transition-colors group"
        >
          <div className="h-12 w-12 rounded-full bg-vault/10 grid place-items-center group-hover:bg-vault/20 transition-colors">
            <Plus size={22} className="text-vault" />
          </div>
          <p className="font-display font-semibold text-sm">Create your first savings goal</p>
          <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary max-w-xs text-center">
            Set a target amount and date. Finvault will calculate how much you need to save each month and track your pace.
          </p>
        </div>
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <GoalModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
