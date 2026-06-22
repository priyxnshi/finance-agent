import React from 'react'
import { TrendingUp, AlertTriangle, Target, PiggyBank, Sparkles } from 'lucide-react'

const insights = [
  {
    icon: TrendingUp,
    tone: 'text-signal-red bg-signal-red/10',
    text: 'Food spending increased 14% this month.',
  },
  {
    icon: AlertTriangle,
    tone: 'text-signal-amber bg-signal-amber/10',
    text: 'You may exceed your dining budget next week.',
  },
  {
    icon: Target,
    tone: 'text-signal-green bg-signal-green/10',
    text: 'Goal completion probability: 82%.',
  },
  {
    icon: PiggyBank,
    tone: 'text-vault bg-vault/10',
    text: 'Potential monthly savings: ₹2,400.',
  },
]

export default function AIInsightsPreview() {
  return (
    <section id="ai-agent" className="border-t border-white/[0.06] py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-vault mb-3">AI Agent</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.25rem] tracking-tight leading-tight">
            Insights that read like a person, not a spreadsheet.
          </h2>
          <p className="mt-4 text-ledger-dark-secondary leading-relaxed max-w-md">
            Every insight is generated from your real transaction patterns — not generic
            budgeting tips. The agent tells you what changed, why it matters, and what it expects
            to happen next.
          </p>
        </div>

        <div className="rounded-card border border-white/10 bg-ink-900 shadow-panel overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-vault" />
              <h3 className="font-display font-semibold text-sm tracking-tight">This week's insights</h3>
            </div>
            <span className="text-2xs px-2 py-0.5 rounded-full bg-vault/10 text-vault-light font-medium">Live</span>
          </div>

          <div className="p-5 space-y-3">
            {insights.map(({ icon: Icon, tone, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-md border border-white/10 bg-ink-850 px-4 py-3"
              >
                <div className={`h-8 w-8 rounded-md grid place-items-center shrink-0 ${tone}`}>
                  <Icon size={15} />
                </div>
                <p className="text-sm text-ledger-dark-primary leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
