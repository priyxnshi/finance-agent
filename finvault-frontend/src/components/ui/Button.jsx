import React from 'react'

const variants = {
  primary:
    'bg-ink-950 text-paper-raised hover:bg-ink-800 dark:bg-vault dark:text-ink-950 dark:hover:bg-vault-light',
  secondary:
    'bg-transparent border border-line-light dark:border-line text-ledger-light-primary dark:text-ledger-dark-primary hover:bg-ink-950/[0.04] dark:hover:bg-white/[0.05]',
  ghost:
    'bg-transparent text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary',
}

export default function Button({ children, variant = 'primary', className = '', as: As = 'button', ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium
        transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}
