import React from 'react'

const variants = {
  primary: 'bg-vault text-ink-950 hover:bg-vault-light shadow-[0_8px_24px_-8px_rgba(201,162,39,0.5)]',
  secondary: 'bg-white/[0.06] text-ledger-primary border border-white/10 hover:bg-white/[0.1]',
  ghost: 'text-ledger-secondary hover:text-ledger-primary',
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
