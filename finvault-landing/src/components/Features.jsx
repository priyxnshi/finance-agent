import React from 'react'
import { Receipt, TrendingUp, Target, Sparkles, HeartPulse, Network } from 'lucide-react'

const features = [
  {
    icon: Receipt,
    title: 'Expense Intelligence',
    description: 'Automatically organize and analyze transactions.',
    accent: 'text-signal-blue bg-signal-blue/10',
  },
  {
    icon: TrendingUp,
    title: 'Spending Predictions',
    description: 'Forecast future expenses using machine learning.',
    accent: 'text-signal-green bg-signal-green/10',
  },
  {
    icon: Target,
    title: 'Goal Planning',
    description: 'Plan and track savings goals.',
    accent: 'text-vault bg-vault/10',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Receive personalized financial suggestions.',
    accent: 'text-signal-amber bg-signal-amber/10',
  },
  {
    icon: HeartPulse,
    title: 'Financial Health Score',
    description: 'Understand your financial wellbeing instantly.',
    accent: 'text-signal-red bg-signal-red/10',
  },
  {
    icon: Network,
    title: 'Federated Learning',
    description: 'Improve AI models without sharing personal financial data.',
    accent: 'text-signal-blue bg-signal-blue/10',
  },
]

export default function Features() {
  return (
    <section id="features" className="border-t border-line-light dark:border-white/[0.06] py-24 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="max-w-xl mb-14 text-ledger-light-primary dark:text-ledger-dark-primary">
          <p className="text-2xs font-semibold uppercase tracking-wider text-vault mb-3">What it does</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.25rem] tracking-tight leading-tight">
            One agent, watching your whole financial picture.
          </h2>
          <p className="mt-4 text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed">
            Not a ledger you fill in yourself. Not a dashboard of numbers you have to interpret.
            An agent that does the analysis and tells you what to do next.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-ledger-light-primary dark:text-ledger-dark-primary">
          {features.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="group relative rounded-card border border-line-light dark:border-white/10 bg-paper-raised dark:bg-ink-900 p-5 overflow-hidden hover:border-vault/30 transition-colors duration-150"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-vault opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`h-9 w-9 rounded-md grid place-items-center mb-4 ${accent}`}>
                <Icon size={17} strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-base tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
