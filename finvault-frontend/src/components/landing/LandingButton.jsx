import React from 'react'
import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-vault text-ink-950 hover:bg-vault-light shadow-[0_8px_24px_-8px_rgba(201,162,39,0.5)]',
  secondary: 'bg-black/[0.04] dark:bg-white/[0.06] text-ledger-light-primary dark:text-ledger-dark-primary border border-line-light dark:border-white/10 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]',
  ghost: 'text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary',
}

/**
 * Landing-page button. Two ways to use it:
 *   - `to="/app"`        -> renders a React Router <Link> (in-app navigation, no page reload)
 *   - `href="#features"` -> renders a plain <a> (same-page anchor scrolling)
 *
 * Kept separate from components/ui/Button.jsx because the landing page's
 * visual style (gold-filled primary CTA) and link-vs-button semantics are
 * different from the in-app Button used on Dashboard/Expenses/etc.
 */
export default function Button({ children, variant = 'primary', className = '', to, href, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold
    transition-all duration-150 ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  )
}
