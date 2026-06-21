import React from 'react'

const tones = {
  neutral: 'bg-ink-950/[0.05] dark:bg-white/[0.06] text-ledger-light-secondary dark:text-ledger-dark-secondary',
  green: 'bg-signal-green/10 text-signal-green',
  red: 'bg-signal-red/10 text-signal-red',
  blue: 'bg-signal-blue/10 text-signal-blue',
  amber: 'bg-signal-amber/10 text-signal-amber',
  vault: 'bg-vault/10 text-vault-dim dark:text-vault-light',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
