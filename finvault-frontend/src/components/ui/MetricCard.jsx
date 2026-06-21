import React from 'react'
import Card from './Card.jsx'

export default function MetricCard({ label, value, delta, deltaTone = 'green', icon: Icon, accent = 'vault' }) {
  const toneClass =
    deltaTone === 'green'
      ? 'text-signal-green'
      : deltaTone === 'red'
      ? 'text-signal-red'
      : 'text-ledger-light-tertiary dark:text-ledger-dark-tertiary'

  return (
    <Card accent={accent} className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          {label}
        </p>
        {Icon && (
          <div className="h-7 w-7 rounded-md bg-ink-950/[0.04] dark:bg-white/[0.06] grid place-items-center">
            <Icon size={14} className="text-ledger-light-secondary dark:text-ledger-dark-secondary" />
          </div>
        )}
      </div>
      <p className="ledger-num text-2xl font-semibold tracking-tight">{value}</p>
      {delta && (
        <p className={`text-xs font-medium ${toneClass}`}>{delta}</p>
      )}
    </Card>
  )
}
