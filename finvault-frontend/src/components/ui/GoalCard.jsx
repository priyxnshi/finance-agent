import React, { useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react'
import Card from './Card.jsx'
import { updateGoal, deleteGoal } from '../../services/api.js'

const paceConfig = {
  ahead: { icon: TrendingUp, color: 'text-signal-green', label: 'Ahead of schedule' },
  on_track: { icon: CheckCircle2, color: 'text-signal-blue', label: 'On track' },
  behind: { icon: AlertTriangle, color: 'text-signal-amber', label: 'Behind schedule' },
  completed: { icon: CheckCircle2, color: 'text-signal-green', label: 'Completed!' },
  insufficient_data: { icon: Clock, color: 'text-ledger-light-tertiary dark:text-ledger-dark-tertiary', label: 'Building history…' },
}

const accentColors = ['vault', 'green', 'blue', 'amber', 'red']

export default function GoalCard({ goal, index, onUpdate, onDelete }) {
  const [contributing, setContributing] = useState(false)
  const [contribution, setContribution] = useState('')
  const [loading, setLoading] = useState(false)

  const accent = accentColors[index % accentColors.length]
  const pace = paceConfig[goal.pace_status] ?? paceConfig.insufficient_data
  const PaceIcon = pace.icon

  async function handleContribute() {
    const amount = parseFloat(contribution)
    if (!amount || amount <= 0) return
    setLoading(true)
    try {
      const updated = await updateGoal(goal.id, {
        current_amount: (goal.current_amount || 0) + amount,
      })
      onUpdate(updated)
      setContribution('')
      setContributing(false)
    } catch (_) {}
    setLoading(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${goal.name}"?`)) return
    try {
      await deleteGoal(goal.id)
      onDelete(goal.id)
    } catch (_) {}
  }

  const barWidth = Math.min(100, goal.progress_percent)

  return (
    <Card accent={accent}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold tracking-tight">{goal.name || 'Unnamed Goal'}</h3>
          <p className="flex items-center gap-1.5 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-1">
            <Calendar size={11} /> Target {goal.target_date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="ledger-num text-xl font-semibold text-vault">{goal.progress_percent}%</span>
          <button onClick={handleDelete} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary hover:text-signal-red transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-ink-950/[0.06] dark:bg-white/[0.08] overflow-hidden mb-2">
        <div className="h-full rounded-full bg-vault transition-all duration-500" style={{ width: `${barWidth}%` }} />
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="ledger-num font-medium">{'\u20B9'}{(goal.current_amount || 0).toLocaleString('en-IN')}</span>
        <span className="ledger-num text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          of {'\u20B9'}{goal.target_amount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Stat label="Gap" value={`\u20B9${goal.gap_amount.toLocaleString('en-IN')}`} />
        <Stat label="Monthly needed" value={`\u20B9${goal.required_monthly_savings.toLocaleString('en-IN')}`} />
        <Stat label="Days left" value={goal.days_remaining > 0 ? `${goal.days_remaining}d` : 'Overdue'} warn={goal.days_remaining <= 0} />
        <Stat
          label="Est. completion"
          value={goal.estimated_completion_date ?? '—'}
        />
      </div>

      {/* Pace badge */}
      <div className="flex items-center gap-1.5 text-2xs mb-3">
        <PaceIcon size={12} className={pace.color} />
        <span className={pace.color}>{pace.label}</span>
      </div>

      {/* Contribute input */}
      {contributing ? (
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            step="any"
            placeholder="Amount (₹)"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            className="flex-1 h-9 px-3 rounded-md text-sm border border-line-light dark:border-line bg-paper dark:bg-ink-850
              text-ledger-light-primary dark:text-ledger-dark-primary placeholder:text-ledger-light-tertiary dark:placeholder:text-ledger-dark-tertiary
              focus:outline-none focus:ring-2 focus:ring-signal-blue/40 transition"
          />
          <button
            onClick={handleContribute}
            disabled={loading}
            className="h-9 px-3 rounded-md bg-vault text-ink-950 text-xs font-semibold hover:bg-vault-light transition disabled:opacity-60"
          >
            Add
          </button>
          <button
            onClick={() => { setContributing(false); setContribution('') }}
            className="h-9 px-3 rounded-md border border-line-light dark:border-line text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary hover:bg-ink-950/[0.04] dark:hover:bg-white/[0.04] transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setContributing(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-vault hover:text-vault-light transition"
        >
          <Plus size={13} /> Log contribution
        </button>
      )}
    </Card>
  )
}

function Stat({ label, value, warn }) {
  return (
    <div className="rounded-md bg-ink-950/[0.03] dark:bg-white/[0.04] p-2">
      <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-0.5">{label}</p>
      <p className={`ledger-num text-xs font-medium ${warn ? 'text-signal-red' : ''}`}>{value}</p>
    </div>
  )
}
