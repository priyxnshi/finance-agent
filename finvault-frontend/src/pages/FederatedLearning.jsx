import React, { useState, useEffect, useCallback } from 'react'
import { Network, Cpu, CheckCircle2, CircleDot, CircleOff, Brain } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import MLStatusPanel from '../components/ui/MLStatusPanel.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import { getMLStatus } from '../services/api.js'

// Simulated FL clients — real Flower integration is Phase 6
const FL_CLIENTS = [
  { id: 'client-01', label: 'Device — Pixel 9',      status: 'Training',    accuracy: 0.912, lastRound: 14 },
  { id: 'client-02', label: 'Device — MacBook Air',  status: 'Idle',        accuracy: 0.927, lastRound: 14 },
  { id: 'client-03', label: 'Device — iPhone 16',    status: 'Aggregating', accuracy: 0.901, lastRound: 13 },
  { id: 'client-04', label: 'Device — ThinkPad X1',  status: 'Training',    accuracy: 0.918, lastRound: 14 },
  { id: 'client-05', label: 'Device — Galaxy Tab',   status: 'Offline',     accuracy: 0.889, lastRound: 11 },
]

const FL_ROUNDS = [
  { round: 1, accuracy: 0.71 }, { round: 2, accuracy: 0.76 },
  { round: 3, accuracy: 0.79 }, { round: 4, accuracy: 0.81 },
  { round: 5, accuracy: 0.84 }, { round: 6, accuracy: 0.85 },
  { round: 7, accuracy: 0.87 }, { round: 8, accuracy: 0.885 },
  { round: 9, accuracy: 0.897 }, { round: 10, accuracy: 0.903 },
  { round: 11, accuracy: 0.908 }, { round: 12, accuracy: 0.912 },
  { round: 13, accuracy: 0.915 }, { round: 14, accuracy: 0.918 },
]

const statusConfig = {
  Training:    { tone: 'blue',    icon: CircleDot    },
  Aggregating: { tone: 'vault',   icon: Cpu          },
  Idle:        { tone: 'neutral', icon: CheckCircle2 },
  Offline:     { tone: 'red',     icon: CircleOff    },
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
  const [mlStatus, setMLStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMLStatus()
      setMLStatus(data.models)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const trainedCount = mlStatus
    ? Object.values(mlStatus).filter((m) => m.trained).length
    : 0

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex items-center gap-2">
        <Network size={16} className="text-vault" />
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
          Phase 4 ML models are active locally. Phase 6 will wire Flower (flwr) for federated training across devices.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="ML Models Trained" value={`${trainedCount} / 5`}
          delta={trainedCount === 5 ? 'All models ready' : 'Run train_models.py to complete'}
          deltaTone={trainedCount === 5 ? 'green' : 'amber'}
          icon={Brain} accent="vault" />
        <MetricCard label="FL Global Round" value="14"
          delta="Simulated · Phase 6 live"
          deltaTone="neutral" icon={Network} accent="blue" />
        <MetricCard label="Connected Clients" value="4 / 5"
          delta="1 offline · simulated"
          deltaTone="red" icon={Cpu} accent="red" />
      </div>

      {/* ML Model Status — live from API */}
      {loading && <LoadingState label="Loading model status…" />}
      {!loading && error && <ErrorState message={error} onRetry={fetchStatus} />}
      {!loading && !error && mlStatus && (
        <MLStatusPanel models={mlStatus} onRefresh={fetchStatus} />
      )}

      {/* Simulated FL accuracy curve */}
      <Card accent="vault">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-sm tracking-tight">Accuracy by FL Round</h3>
          <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            FedAvg aggregation · simulated until Phase 6
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={FL_ROUNDS} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor"
              className="text-ink-950/5 dark:text-white/5" vertical={false} />
            <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#8B92A5' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0.6, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fontSize: 11, fill: '#8B92A5' }}
              axisLine={false} tickLine={false} width={42}
            />
            <Tooltip content={<RoundTooltip />} />
            <Line type="monotone" dataKey="accuracy" stroke="#4C8DFF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Simulated client nodes */}
      <Card padded={false}>
        <div className="p-5 pb-3">
          <h3 className="font-display font-semibold text-sm tracking-tight">FL Client Nodes</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
            Simulated Flower clients — real multi-device training wires up in Phase 6.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-line-light dark:border-line text-2xs uppercase tracking-wider
                text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                <th className="text-left font-medium px-5 py-2.5">Client</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
                <th className="text-left font-medium px-5 py-2.5">Local Accuracy</th>
                <th className="text-right font-medium px-5 py-2.5">Last Round</th>
              </tr>
            </thead>
            <tbody>
              {FL_CLIENTS.map((c) => {
                const cfg = statusConfig[c.status]
                const Icon = cfg.icon
                return (
                  <tr key={c.id}
                    className="border-b border-line-light dark:border-line last:border-0">
                    <td className="px-5 py-3 font-medium">{c.label}</td>
                    <td className="px-5 py-3">
                      <Badge tone={cfg.tone}>
                        <Icon size={11} /> {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 ledger-num">{(c.accuracy * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right ledger-num
                      text-ledger-light-secondary dark:text-ledger-dark-secondary">
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
