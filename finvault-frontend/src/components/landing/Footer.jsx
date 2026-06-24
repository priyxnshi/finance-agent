import React from 'react'
import { Vault } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-line-light dark:border-white/[0.06] py-10 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-ledger-light-primary dark:text-ledger-dark-primary">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-vault grid place-items-center">
            <Vault size={13} className="text-ink-950" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-sm tracking-tight">Finvault</span>
        </div>

        <nav className="flex items-center gap-6 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          <a href="#features" className="hover:text-ledger-light-secondary dark:hover:text-ledger-dark-secondary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-ledger-light-secondary dark:hover:text-ledger-dark-secondary transition-colors">How It Works</a>
          <a href="#ai-agent" className="hover:text-ledger-light-secondary dark:hover:text-ledger-dark-secondary transition-colors">AI Agent</a>
          <a href="#privacy" className="hover:text-ledger-light-secondary dark:hover:text-ledger-dark-secondary transition-colors">Privacy</a>
        </nav>

        <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">© 2026 Finvault. Personal project, not a financial institution.</p>
      </div>
    </footer>
  )
}
