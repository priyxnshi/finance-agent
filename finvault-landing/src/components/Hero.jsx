import React from 'react'
import { Play } from 'lucide-react'
import Button from './Button.jsx'
import HeroVisual from './HeroVisual.jsx'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-grid bg-radial-glow">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line-light dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
            <span className="text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary">Your AI finance agent, not another bank</span>
          </div>

          <h1 className="font-display font-semibold text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] tracking-tight text-ledger-light-primary dark:text-ledger-dark-primary">
            Meet your personal finance agent.
          </h1>

          <p className="mt-6 text-lg text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed max-w-md">
            Track expenses. Predict future spending. Achieve savings goals. Receive intelligent
            recommendations. All while keeping your financial data private.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="#get-started">Get Started</Button>
            <Button variant="secondary" href="#how-it-works">
              <Play size={14} /> Watch Demo
            </Button>
          </div>

          <p className="mt-8 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            No bank connection required to start · Your data never leaves your device by default
          </p>
        </div>

        <div className="lg:pl-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
