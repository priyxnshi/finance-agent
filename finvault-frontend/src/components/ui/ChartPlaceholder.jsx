import React from 'react'
import { BarChart3 } from 'lucide-react'

export default function ChartPlaceholder({ label = 'Chart renders once live data is connected', height = 240 }) {
  return (
    <div
      className="ledger-grid-bg rounded-md border border-dashed border-line-light dark:border-line flex flex-col items-center justify-center gap-2 text-center px-6"
      style={{ height }}
    >
      <div className="h-9 w-9 rounded-md bg-ink-950/[0.04] dark:bg-white/[0.06] grid place-items-center">
        <BarChart3 size={16} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
      </div>
      <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary max-w-[220px]">
        {label}
      </p>
    </div>
  )
}
