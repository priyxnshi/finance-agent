import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import Card from './Card.jsx'
import Badge from './Badge.jsx'

function AnomalyScore({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 75 ? 'bg-signal-red' : pct >= 40 ? 'bg-signal-amber' : 'bg-signal-green'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-ink-950/[0.06] dark:bg-white/[0.08] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="ledger-num text-2xs w-7 text-right text-ledger-light-secondary dark:text-ledger-dark-secondary">
        {pct}%
      </span>
    </div>
  )
}

export default function AnomalyFeed({ scanned, anomaliesFound, results = [] }) {
  const [showAll, setShowAll] = useState(false)
  const anomalies = results.filter((r) => r.anomaly)
  const displayList = showAll ? anomalies : anomalies.slice(0, 5)

  return (
    <Card accent="red">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={14} className="text-signal-red" />
        <p className="text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          Anomaly Detection
        </p>
        <span className="ml-auto text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          {scanned} transactions scanned
        </span>
      </div>

      {anomalies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="h-10 w-10 rounded-full bg-signal-green/10 grid place-items-center">
            <CheckCircle2 size={18} className="text-signal-green" />
          </div>
          <p className="text-sm font-medium">No anomalies detected</p>
          <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary max-w-[220px]">
            All recent transactions look normal based on your spending patterns.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-signal-red text-white text-2xs font-bold">
                {anomalies.length}
              </span>
              <p className="text-sm font-medium">
                unusual {anomalies.length === 1 ? 'transaction' : 'transactions'} flagged
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {displayList.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-signal-red/20 bg-signal-red/[0.04] p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.description || `Expense #${item.id}`}
                    </p>
                    <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                      {item.date} · {item.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="ledger-num font-semibold text-signal-red">
                      \u20B9{Number(item.amount).toLocaleString('en-IN')}
                    </p>
                    <Badge tone="red">Anomaly</Badge>
                  </div>
                </div>
                <AnomalyScore score={item.anomaly_score} />
                {item.reason && (
                  <p className="text-2xs text-ledger-light-secondary dark:text-ledger-dark-secondary mt-1.5 leading-relaxed">
                    {item.reason}
                  </p>
                )}
              </div>
            ))}
          </div>

          {anomalies.length > 5 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-signal-blue hover:underline"
            >
              {showAll ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {anomalies.length}</>}
            </button>
          )}

          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-3 leading-relaxed">
            Powered by Isolation Forest · Flags transactions deviating from your spending baseline.
          </p>
        </>
      )}
    </Card>
  )
}
