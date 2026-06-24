import React from 'react'
import { Target, Brain, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Card from './Card.jsx'
import { useNavigate } from 'react-router-dom'

const labelConfig = {
  'Very Likely': { color: 'text-signal-green', icon: CheckCircle2, bar: 'bg-signal-green' },
  'Likely':      { color: 'text-signal-blue',  icon: TrendingUp,   bar: 'bg-signal-blue'  },
  'Uncertain':   { color: 'text-signal-amber', icon: AlertTriangle, bar: 'bg-signal-amber' },
  'Unlikely':    { color: 'text-signal-red',   icon: AlertTriangle, bar: 'bg-signal-red'   },
}

/*
 * Dashboard card showing an at-a-glance overview of all goal achievement
 * probabilities. Clicking a goal row navigates to the Goals page.
 *
 * Props:
 *   goals       — raw goal list from GET /goals
 *   predictions — map of goal_id -> prediction object from GET /predict-goals
 */
export default function GoalsSummaryCard({ goals = [], predictions = {} }) {
  const navigate = useNavigate()

  // Average probability across all goals that have a prediction
  const predList = goals
    .map((g) => predictions[g.id])
    .filter(Boolean)

  const avgProb = predList.length
    ? Math.round((predList.reduce((s, p) => s + p.achievement_probability, 0) / predList.length) * 100)
    : null

  return (
    <Card accent="green">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-signal-green" />
          <p className="text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            Goal Outlook
          </p>
        </div>
        {avgProb !== null && (
          <div className="flex items-center gap-1.5">
            <Brain size={11} className="text-vault" />
            <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              avg probability
            </span>
            <span className="ledger-num text-sm font-semibold text-signal-green">{avgProb}%</span>
          </div>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-5 text-center">
          <Target size={22} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
          <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            No goals yet.
          </p>
          <button
            onClick={() => navigate('/app/goals')}
            className="text-xs text-vault hover:text-vault-light font-medium transition"
          >
            Create your first goal →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {goals.slice(0, 4).map((goal) => {
            const pred = predictions[goal.id]
            const pct = Math.round(goal.progress_percent)
            const probPct = pred ? Math.round(pred.achievement_probability * 100) : null
            const cfg = pred ? (labelConfig[pred.label] ?? labelConfig['Uncertain']) : null
            const PaceIcon = cfg?.icon

            return (
              <button
                key={goal.id}
                onClick={() => navigate('/app/goals')}
                className="w-full text-left rounded-md border border-line-light dark:border-line
                  bg-paper dark:bg-ink-850 px-3 py-2.5 hover:border-vault/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <p className="text-xs font-medium truncate flex-1">{goal.name || 'Unnamed'}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {cfg && PaceIcon && (
                      <PaceIcon size={12} className={cfg.color} />
                    )}
                    {probPct !== null && (
                      <span className={`ledger-num text-xs font-semibold ${cfg?.color ?? ''}`}>
                        {probPct}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar — shows goal progress in vault, probability in green */}
                <div className="h-1.5 rounded-full bg-ink-950/[0.06] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-vault transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                    {pct}% saved
                  </span>
                  {pred && (
                    <span className={`text-2xs font-medium ${cfg?.color}`}>
                      {pred.label}
                    </span>
                  )}
                </div>
              </button>
            )
          })}

          {goals.length > 4 && (
            <button
              onClick={() => navigate('/app/goals')}
              className="w-full text-center text-2xs text-vault hover:text-vault-light font-medium transition py-1"
            >
              +{goals.length - 4} more goals →
            </button>
          )}

          {predList.length === 0 && goals.length > 0 && (
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary text-center pt-1">
              Train the goal predictor to see AI forecasts.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
