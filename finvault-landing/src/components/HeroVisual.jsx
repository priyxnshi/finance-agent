import React from 'react'
import { AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { Sparkles, TrendingUp, Target } from 'lucide-react'

const sparkData = [
  { v: 30 }, { v: 38 }, { v: 33 }, { v: 44 }, { v: 40 }, { v: 52 }, { v: 48 }, { v: 60 }, { v: 56 }, { v: 68 },
]

const healthScoreData = [{ name: 'score', value: 78, fill: '#C9A227' }]

export default function HeroVisual() {
  return (
    <div className="relative">
      {/* Main dashboard preview panel */}
      <div className="rounded-card border border-white/10 bg-ink-900 shadow-panel overflow-hidden">
        <div className="h-10 flex items-center gap-1.5 px-4 border-b border-white/[0.06] bg-ink-850">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-red/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal-green/70" />
          <span className="ml-3 text-2xs text-ledger-tertiary">finvault.app/dashboard</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xs uppercase tracking-wider text-ledger-tertiary">Balance Trend</p>
              <p className="ledger-num text-xl font-semibold mt-0.5">₹5,81,300</p>
            </div>
            <span className="text-2xs px-2 py-1 rounded-full bg-signal-green/10 text-signal-green font-medium">
              +4.1%
            </span>
          </div>

          <div className="h-20 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A227" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#C9A227" strokeWidth={2} fill="url(#heroFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-white/10 bg-ink-850 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target size={12} className="text-signal-blue" />
                <p className="text-2xs text-ledger-tertiary">Japan Trip Goal</p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[53%] rounded-full bg-signal-blue" />
              </div>
              <p className="ledger-num text-xs mt-1.5 text-ledger-secondary">₹96,200 of ₹1,80,000</p>
            </div>

            <div className="rounded-md border border-white/10 bg-ink-850 p-3 flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={healthScoreData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.08)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <span className="absolute inset-0 grid place-items-center ledger-num text-2xs font-semibold">
                  78
                </span>
              </div>
              <div>
                <p className="text-2xs text-ledger-tertiary leading-tight">Financial Health Score</p>
                <p className="text-2xs text-signal-green font-medium mt-0.5">Good standing</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-vault/20 bg-vault/[0.06] p-3">
            <Sparkles size={14} className="text-vault mt-0.5 shrink-0" />
            <p className="text-xs text-ledger-secondary leading-relaxed">
              You could save an extra <span className="text-ledger-primary font-medium">₹2,400/month</span> by
              trimming dining spend back to your usual pace.
            </p>
          </div>
        </div>
      </div>

      {/* Floating accent cards for depth */}
      <div className="hidden sm:flex absolute -left-8 top-10 items-center gap-2.5 rounded-md border border-white/10 bg-ink-900/95 backdrop-blur px-3.5 py-2.5 shadow-panel">
        <TrendingUp size={14} className="text-signal-green" />
        <div>
          <p className="text-2xs text-ledger-tertiary">Goal completion</p>
          <p className="ledger-num text-sm font-semibold text-signal-green">82%</p>
        </div>
      </div>

      <div className="hidden sm:flex absolute -right-6 -bottom-6 items-center gap-2.5 rounded-md border border-white/10 bg-ink-900/95 backdrop-blur px-3.5 py-2.5 shadow-panel">
        <div className="h-7 w-7 rounded-full bg-vault/15 grid place-items-center">
          <Sparkles size={13} className="text-vault" />
        </div>
        <div>
          <p className="text-2xs text-ledger-tertiary">AI agent active</p>
          <p className="text-xs font-medium text-ledger-primary">Watching 6 categories</p>
        </div>
      </div>
    </div>
  )
}
