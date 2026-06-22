import React, { useState } from 'react'
import { X, Target, Loader2 } from 'lucide-react'
import { createGoal } from '../../services/api.js'

export default function GoalModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  // Minimum date: tomorrow
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Goal name is required'
    const amount = parseFloat(targetAmount)
    if (!targetAmount || isNaN(amount) || amount <= 0) next.targetAmount = 'Enter a valid positive amount'
    if (!targetDate) next.targetDate = 'Target date is required'
    const current = parseFloat(currentAmount || '0')
    if (isNaN(current) || current < 0) next.currentAmount = 'Must be 0 or more'
    if (!next.targetAmount && !next.currentAmount && current >= amount) {
      next.currentAmount = 'Current savings must be less than the target'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    setServerError('')
    try {
      const created = await createGoal({
        name: name.trim(),
        target_amount: parseFloat(targetAmount),
        target_date: targetDate,
        current_amount: parseFloat(currentAmount || '0'),
      })
      onCreated(created)
      onClose()
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-card border border-line-light dark:border-line bg-paper-raised dark:bg-ink-900 shadow-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-vault" />
            <h2 className="font-display font-semibold text-base tracking-tight">New Savings Goal</h2>
          </div>
          <button onClick={onClose} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary">
            <X size={18} />
          </button>
        </div>

        {serverError && (
          <div className="mb-4 rounded-md bg-signal-red/10 border border-signal-red/20 px-3 py-2 text-xs text-signal-red">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field label="Goal name" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              className={inputCls(errors.name)}
            />
          </Field>

          <Field label="Target amount (₹)" error={errors.targetAmount}>
            <input
              type="number"
              min="1"
              step="any"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 300000"
              className={inputCls(errors.targetAmount)}
            />
          </Field>

          <Field label="Target date" error={errors.targetDate}>
            <input
              type="date"
              min={minDateStr}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={inputCls(errors.targetDate)}
            />
          </Field>

          <Field label="Already saved (₹)" hint="Leave blank if starting from zero" error={errors.currentAmount}>
            <input
              type="number"
              min="0"
              step="any"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              className={inputCls(errors.currentAmount)}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-md border border-line-light dark:border-line text-sm font-medium
                text-ledger-light-secondary dark:text-ledger-dark-secondary hover:bg-ink-950/[0.04] dark:hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-md bg-vault text-ink-950 text-sm font-semibold
                hover:bg-vault-light transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function inputCls(error) {
  return `w-full h-10 px-3 rounded-md text-sm border ${
    error ? 'border-signal-red/60' : 'border-line-light dark:border-line'
  } bg-paper dark:bg-ink-850 text-ledger-light-primary dark:text-ledger-dark-primary
  placeholder:text-ledger-light-tertiary dark:placeholder:text-ledger-dark-tertiary
  focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition`
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1.5">
        {label}
        {hint && <span className="ml-1 text-ledger-light-tertiary dark:text-ledger-dark-tertiary font-normal">— {hint}</span>}
      </label>
      {children}
      {error && <p className="text-2xs text-signal-red mt-1">{error}</p>}
    </div>
  )
}
