import React, { useState } from 'react'
import { Vault, Menu, X } from 'lucide-react'
import Button from './Button.jsx'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#ai-agent', label: 'AI Agent' },
  { href: '#privacy', label: 'Privacy' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-md bg-vault grid place-items-center">
            <Vault size={16} className="text-ink-950" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight">Finvault</span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ledger-secondary hover:text-ledger-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" href="#login">
            Login
          </Button>
          <Button href="#get-started">Get Started</Button>
        </div>

        <button
          className="md:hidden h-9 w-9 grid place-items-center text-ledger-secondary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/[0.06] px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-ledger-secondary hover:text-ledger-primary"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" href="#login" className="flex-1 justify-center">
              Login
            </Button>
            <Button href="#get-started" className="flex-1 justify-center">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
