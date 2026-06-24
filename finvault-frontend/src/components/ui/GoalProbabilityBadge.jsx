import React from 'react'
import { Brain } from 'lucide-react'

/*
 * Compact badge that sits inside a GoalCard showing the ML-predicted
 * achievement probability. Kept small — just one stat — so it doesn't
 * crowd the goal's own metrics.
 */
const labelConfig = {
  'Very Likely': { color: 'text-signal-green', bg: 'bg-signal-green/10', bar: 'bg-signal-green' },
  'Likely':      { color: 'text-signal-blue',  bg: 'bg-signal-blue/10',  bar: 'bg-signal-blue'  },
  'Uncertain':   { color: 'text-signal-amber', bg: 'bg-signal-amber/10', bar: 'bg-signal-amber' },
  'Unlikely':    { color: 'text-signal-red',   bg: 'bg-signal-red/10',   bar: 'bg-signal-red'   },
}

export default function GoalProbabilityBadge({ probability, label }) {
  if (probability === null || probability === undefined) return null

  const cfg = labelConfig[label] ?? labelConfig['Uncertain']
  const pct = Math.round(probability * 100)

  return (
    <div className={`rounded-md border border-white/10 ${cfg.bg} px-3 py-2`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Brain size={11} className={cfg.color} />
        <p className="text-2xs font-semibold text-ledger-light-secondary dark:text-ledger-dark-secondary">
          AI Achievement Forecast
        </p>
      </div>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-sm font-semibold ${cfg.color}`}>{label}</p>
        <p className={`ledger-num text-sm font-semibold ${cfg.color}`}>{pct}%</p>
      </div>
      <div className="h-1.5 rounded-full bg-ink-950/[0.08] dark:bg-white/[0.08] overflow-hidden">
        <div
          className={`h-full rounded-full ${cfg.bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
