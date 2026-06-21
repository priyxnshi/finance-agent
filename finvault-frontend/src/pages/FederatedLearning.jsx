import React from 'react'
import { Network, Cpu, CheckCircle2, CircleDot, CircleOff } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import { flClients, flRounds } from '../data/mockData.js'

const statusConfig = {
  Training: { tone: 'blue', icon: CircleDot },
  Aggregating: { tone: 'vault', icon: Cpu },
  Idle: { tone: 'neutral', icon: CheckCircle2 },
  Offline: { tone: 'red', icon: CircleOff },
}

function RoundTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line-light dark:border-line bg-paper-raised dark:bg-ink-850 px-3 py-2 shadow-popover text-xs">
      <p className="font-medium mb-0.5">Round {label}</p>
      <p className="ledger-num text-ledger-light-secondary dark:text-ledger-dark-secondary">
        Global accuracy: {(payload[0].value * 100).toFixed(1)}%
      </p>
    </div>
  )
}

export default function FederatedLearning() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Network size={16} className="text-vault" />
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
          Simulated Flower (flwr) clients training the spending categorizer without sharing raw transaction data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Global Round" value="14" delta="Next round in ~4 min" deltaTone="neutral" accent="vault" />
        <MetricCard label="Global Accuracy" value="91.8%" delta="+0.3 pts last round" deltaTone="green" accent="green" />
        <MetricCard label="Connected Clients" value="4 / 5" delta="1 offline" deltaTone="red" accent="red" />
      </div>

      <Card accent="vault">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-sm tracking-tight">Accuracy by Round</h3>
          <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            FedAvg aggregation · simulated
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={flRounds} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-950/5 dark:text-white/5" vertical={false} />
            <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#8B92A5' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0.6, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fontSize: 11, fill: '#8B92A5' }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<RoundTooltip />} />
            <Line type="monotone" dataKey="accuracy" stroke="#4C8DFF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-3">
          <h3 className="font-display font-semibold text-sm tracking-tight">Client Nodes</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
            Simulated devices for local Flower client/server testing — wired up in Phase 6.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-line-light dark:border-line text-2xs uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                <th className="text-left font-medium px-5 py-2.5">Client</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
                <th className="text-left font-medium px-5 py-2.5">Local Accuracy</th>
                <th className="text-right font-medium px-5 py-2.5">Last Round</th>
              </tr>
            </thead>
            <tbody>
              {flClients.map((c) => {
                const cfg = statusConfig[c.status]
                const Icon = cfg.icon
                return (
                  <tr key={c.id} className="border-b border-line-light dark:border-line last:border-0">
                    <td className="px-5 py-3 font-medium">{c.label}</td>
                    <td className="px-5 py-3">
                      <Badge tone={cfg.tone}>
                        <Icon size={11} /> {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 ledger-num">{(c.accuracy * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right ledger-num text-ledger-light-secondary dark:text-ledger-dark-secondary">
                      #{c.lastRound}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
