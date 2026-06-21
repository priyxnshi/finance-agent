import React from 'react'
import { Plus, Calendar } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { goals } from '../data/mockData.js'

const colorMap = {
  'signal-green': { bar: 'bg-signal-green', text: 'text-signal-green' },
  'signal-blue': { bar: 'bg-signal-blue', text: 'text-signal-blue' },
  vault: { bar: 'bg-vault', text: 'text-vault-dim dark:text-vault-light' },
  'signal-amber': { bar: 'bg-signal-amber', text: 'text-signal-amber' },
}

export default function Goals() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
          4 active goals · ₹7,70,700 saved of ₹18,40,000 targeted
        </p>
        <Button>
          <Plus size={15} /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          const c = colorMap[g.color]
          return (
            <Card key={g.id} accent={g.color === 'signal-green' ? 'green' : g.color === 'signal-blue' ? 'blue' : g.color === 'vault' ? 'vault' : 'amber'}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold tracking-tight">{g.name}</h3>
                  <p className="flex items-center gap-1.5 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-1">
                    <Calendar size={12} /> Target {g.deadline}
                  </p>
                </div>
                <span className={`ledger-num text-lg font-semibold ${c.text}`}>{pct}%</span>
              </div>

              <div className="h-2 rounded-full bg-ink-950/[0.06] dark:bg-white/[0.08] overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${c.bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="ledger-num font-medium">₹{g.current.toLocaleString('en-IN')}</span>
                <span className="ledger-num text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                  of ₹{g.target.toLocaleString('en-IN')}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      <Card accent="vault" className="border-dashed">
        <div className="flex flex-col items-center text-center py-6 gap-2">
          <p className="font-display font-semibold text-sm">Goal forecasting arrives in Phase 5</p>
          <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary max-w-md">
            Once the AI agent memory layer is connected, Finvault will project completion dates and suggest contribution adjustments automatically.
          </p>
        </div>
      </Card>
    </div>
  )
}
