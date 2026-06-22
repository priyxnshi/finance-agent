import React from 'react'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
      <Loader2 size={20} className="animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
      <div className="h-10 w-10 rounded-full bg-signal-red/10 grid place-items-center">
        <AlertTriangle size={18} className="text-signal-red" />
      </div>
      <div>
        <p className="text-sm font-medium">Couldn't load this data</p>
        <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-1 max-w-sm">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-signal-blue hover:underline mt-1"
        >
          <RefreshCw size={12} /> Try again
        </button>
      )}
    </div>
  )
}
