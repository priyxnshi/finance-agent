import React from 'react'
import { Eye, SearchCode, GitBranch, Zap, RefreshCw, ArrowRight, ArrowDown } from 'lucide-react'

const steps = [
  { icon: Eye, label: 'Observe', description: 'Collect spending activity.' },
  { icon: SearchCode, label: 'Analyze', description: 'Detect trends and patterns.' },
  { icon: GitBranch, label: 'Decide', description: 'Identify actions.' },
  { icon: Zap, label: 'Act', description: 'Generate recommendations.' },
  { icon: RefreshCw, label: 'Learn', description: 'Adapt based on user behavior.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line-light dark:border-white/[0.06] py-24 bg-paper/50 dark:bg-ink-900/40 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="max-w-xl mb-16 text-ledger-light-primary dark:text-ledger-dark-primary">
          <p className="text-2xs font-semibold uppercase tracking-wider text-vault mb-3">How the agent works</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.25rem] tracking-tight leading-tight">
            A continuous loop, not a one-time report.
          </h2>
          <p className="mt-4 text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed">
            Finvault doesn't just show you a dashboard once a month. It runs this cycle
            continuously, getting more useful the longer it watches.
          </p>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:flex items-stretch justify-between gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <StepCard step={step} index={i} />
              {i < steps.length - 1 && (
                <div className="flex items-center shrink-0 text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                  <ArrowRight size={18} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile/tablet: vertical flow */}
        <div className="flex lg:hidden flex-col items-center gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <StepCard step={step} index={i} className="w-full max-w-sm" />
              {i < steps.length - 1 && <ArrowDown size={18} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          <RefreshCw size={12} />
          <span>Learn feeds back into Observe — the loop never stops</span>
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index, className = '' }) {
  const { icon: Icon, label, description } = step
  return (
    <div className={`relative flex-1 rounded-card border border-line-light dark:border-white/10 bg-paper-raised dark:bg-ink-900 p-5 text-ledger-light-primary dark:text-ledger-dark-primary transition-colors duration-150 ${className}`}>
      <span className="absolute top-4 right-4 text-2xs font-mono text-ledger-light-tertiary dark:text-ledger-dark-tertiary">0{index + 1}</span>
      <div className="h-9 w-9 rounded-md bg-vault/10 text-vault grid place-items-center mb-4">
        <Icon size={17} strokeWidth={2} />
      </div>
      <h3 className="font-display font-semibold text-sm tracking-tight">{label}</h3>
      <p className="mt-1 text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed">{description}</p>
    </div>
  )
}
