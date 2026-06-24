import React from 'react'
import { Target, TrendingUp, Calendar, PiggyBank } from 'lucide-react'

export default function GoalPlanning() {
  const target = 50000
  const current = 31000
  const pct = Math.round((current / target) * 100)

  return (
    <section className="border-t border-line-light dark:border-white/[0.06] py-24 bg-paper/50 dark:bg-ink-900/40 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div className="order-2 lg:order-1 rounded-card border border-line-light dark:border-white/10 bg-paper-raised dark:bg-ink-900 shadow-panel p-6 text-ledger-light-primary dark:text-ledger-dark-primary transition-colors duration-150">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-md bg-vault/10 text-vault grid place-items-center">
                <Target size={16} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm tracking-tight">New Laptop Fund</h3>
                <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary flex items-center gap-1 mt-0.5">
                  <Calendar size={11} /> Target date: Dec 2026
                </p>
              </div>
            </div>
            <span className="ledger-num text-2xl font-semibold text-vault">{pct}%</span>
          </div>

          <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-vault transition-all" style={{ width: `${pct}%` }} />
          </div>

          <div className="flex items-center justify-between text-sm mb-6">
            <span className="ledger-num font-medium">₹{current.toLocaleString('en-IN')}</span>
            <span className="ledger-num text-ledger-light-tertiary dark:text-ledger-dark-tertiary">of ₹{target.toLocaleString('en-IN')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line-light dark:border-white/10 bg-paper dark:bg-ink-850 p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5 text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                <TrendingUp size={12} />
                <p className="text-2xs">Completion Probability</p>
              </div>
              <p className="ledger-num text-lg font-semibold text-signal-green">84%</p>
            </div>
            <div className="rounded-md border border-line-light dark:border-white/10 bg-paper dark:bg-ink-850 p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5 text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                <PiggyBank size={12} />
                <p className="text-2xs">Suggested Monthly Saving</p>
              </div>
              <p className="ledger-num text-lg font-semibold">₹3,800</p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 text-ledger-light-primary dark:text-ledger-dark-primary">
          <p className="text-2xs font-semibold uppercase tracking-wider text-vault mb-3">Goal Planning</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.25rem] tracking-tight leading-tight">
            Set the goal. The agent works out how to get there.
          </h2>
          <p className="mt-4 text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed max-w-md">
            Tell Finvault what you're saving for and by when. It calculates your realistic
            completion probability from your actual spending pattern, and tells you exactly how
            much to set aside each month to hit it.
          </p>
        </div>
      </div>
    </section>
  )
}
