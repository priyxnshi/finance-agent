import React from 'react'

const variants = {
  primary: 'bg-vault text-ink-950 hover:bg-vault-light shadow-[0_8px_24px_-8px_rgba(201,162,39,0.5)]',
  secondary: 'bg-black/[0.04] dark:bg-white/[0.06] text-ledger-light-primary dark:text-ledger-dark-primary border border-line-light dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]',
  ghost: 'text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary',
}

export default function Button({ children, variant = 'primary', className = '', as: As = 'a', ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold
        transition-all duration-150 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </As>
  )
}
