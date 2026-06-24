import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GoalCard from '../components/ui/GoalCard.jsx'
import GoalModal from '../components/ui/GoalModal.jsx'
import GoalProbabilityBadge from '../components/ui/GoalProbabilityBadge.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import { getGoals, predictGoals } from '../services/api.js'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [predictions, setPredictions] = useState({})   // goal_id -> prediction obj
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  async function fetchGoals() {
    setLoading(true)
    setError('')
    try {
      const data = await getGoals()
      setGoals(data)
      // Fire ML predictions independently — non-blocking
      predictGoals()
        .then((res) => {
          const map = {}
          for (const p of res.predictions ?? []) {
            map[p.goal_id] = p
          }
          setPredictions(map)
        })
        .catch(() => {})
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
    setPredictions((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
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
          className="inline-flex items-center gap-1.5 rounded-md bg-ink-950 dark:bg-vault
            text-paper-raised dark:text-ink-950 px-3.5 py-2 text-sm font-medium hover:opacity-90 transition"
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
            Set a target amount and date. Finvault calculates how much to save monthly, tracks your pace,
            and predicts your probability of success with ML.
          </p>
        </div>
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal, i) => {
            const pred = predictions[goal.id]
            return (
              <div key={goal.id} className="flex flex-col gap-3">
                <GoalCard
                  goal={goal}
                  index={i}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
                {/* ML probability badge sits directly beneath the goal card */}
                {pred && (
                  <GoalProbabilityBadge
                    probability={pred.achievement_probability}
                    label={pred.label}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <GoalModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
