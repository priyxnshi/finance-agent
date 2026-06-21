import React from 'react'
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react'
import Card from './Card.jsx'

const toneConfig = {
  positive: { icon: TrendingUp, color: 'text-signal-green', bg: 'bg-signal-green/10' },
  warning: { icon: AlertTriangle, color: 'text-signal-amber', bg: 'bg-signal-amber/10' },
  neutral: { icon: Info, color: 'text-signal-blue', bg: 'bg-signal-blue/10' },
}

export default function AIInsightsPanel({ insights, title = 'AI Insights' }) {
  return (
    <Card accent="vault">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-vault" />
          <h3 className="font-display font-semibold text-sm tracking-tight">{title}</h3>
        </div>
        <span className="text-2xs px-2 py-0.5 rounded-full bg-vault/10 text-vault-dim dark:text-vault-light font-medium">
          Beta
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const cfg = toneConfig[insight.tone]
          const Icon = cfg.icon
          return (
            <div
              key={insight.id}
              className="flex gap-3 p-3 rounded-md border border-line-light dark:border-line bg-paper dark:bg-ink-850"
            >
              <div className={`h-7 w-7 rounded-md ${cfg.bg} grid place-items-center shrink-0`}>
                <Icon size={14} className={cfg.color} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{insight.title}</p>
                <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed mt-0.5">
                  {insight.body}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-4">
        Generated from sample data. Insights will reflect your real transactions once the agent is connected in a later phase.
      </p>
    </Card>
  )
}
