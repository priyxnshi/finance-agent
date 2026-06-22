import React, { useState } from 'react'
import { HeartPulse, ChevronDown, ChevronUp } from 'lucide-react'
import Card from './Card.jsx'

const labelColors = {
  Excellent: 'text-signal-green',
  Good: 'text-signal-blue',
  Fair: 'text-signal-amber',
  'Needs Attention': 'text-signal-red',
}

const accentMap = {
  Excellent: 'green',
  Good: 'blue',
  Fair: 'amber',
  'Needs Attention': 'red',
}

export default function HealthScoreCard({ score, label, factors = [] }) {
  const [expanded, setExpanded] = useState(false)
  const accent = accentMap[label] ?? 'vault'
  const labelColor = labelColors[label] ?? 'text-vault'

  const circumference = 2 * Math.PI * 34
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <Card accent={accent}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeartPulse size={15} className={labelColor} />
          <p className="text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            Budget Health Score
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4">
        <div className="relative shrink-0 h-20 w-20">
          <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
            <circle cx="38" cy="38" r="34" fill="none" stroke="currentColor" strokeWidth="6"
              className="text-ink-950/10 dark:text-white/10" />
            <circle cx="38" cy="38" r="34" fill="none"
              stroke={label === 'Excellent' ? '#34C77B' : label === 'Good' ? '#4C8DFF' : label === 'Fair' ? '#E8A53D' : '#E2574C'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="ledger-num text-xl font-semibold">{score}</span>
          </div>
        </div>

        <div>
          <p className={`font-display font-semibold text-2xl tracking-tight ${labelColor}`}>{label}</p>
          <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary mt-0.5 leading-relaxed">
            Based on spending trend, consistency, category spread, and goal progress.
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary transition-colors"
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? 'Hide' : 'Show'} factor breakdown
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {factors.map((f) => (
            <div key={f.name}>
              <div className="flex items-center justify-between text-2xs mb-1">
                <span className="text-ledger-light-secondary dark:text-ledger-dark-secondary font-medium">{f.name}</span>
                <span className="ledger-num">{f.score.toFixed(0)}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-950/[0.08] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-vault transition-all"
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">{f.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
