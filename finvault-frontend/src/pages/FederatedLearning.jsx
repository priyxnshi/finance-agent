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
import { getMLStatus, getFederatedStatus } from '../services/api.js'

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
  const [flStatus, setFlStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [mlData, flData] = await Promise.all([
        getMLStatus(),
        getFederatedStatus().catch(() => ({
          status: "Offline",
          current_round: 0,
          connected_clients: 0,
          global_accuracy: 0.0,
          history: []
        }))
      ])
      setMLStatus(mlData.models)
      setFlStatus(flData)
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

  const connectedCount = flStatus?.connected_clients || 0
  const clientsList = []
  for (let i = 0; i < connectedCount; i++) {
    clientsList.push({
      id: `client-0${i + 1}`,
      label: `Federated Node — Node 0${i + 1}`,
      status: 'Aggregating',
      accuracy: flStatus?.global_accuracy || 0.0,
      lastRound: flStatus?.current_round || 0,
    })
  }

  const flHistory = flStatus?.history || []

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex items-center gap-2">
        <Network size={16} className="text-vault" />
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
          Phase 4 ML models are active locally. Federated learning status is updated live from the aggregation server.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="ML Models Trained" value={`${trainedCount} / 5`}
          delta={trainedCount === 5 ? 'All models ready' : 'Run train_models.py to complete'}
          deltaTone={trainedCount === 5 ? 'green' : 'amber'}
          icon={Brain} accent="vault" />
        <MetricCard label="FL Global Round" value={flStatus?.current_round != null ? `${flStatus.current_round}` : '0'}
          delta={flStatus?.status || 'Offline'}
          deltaTone="neutral" icon={Network} accent="blue" />
        <MetricCard label="Connected Clients" value={`${connectedCount}`}
          delta={flStatus?.privacy_status || 'Secure (On-Device Local Context Only)'}
          deltaTone={connectedCount > 0 ? 'green' : 'red'}
          icon={Cpu} accent="red" />
      </div>

      {/* ML Model Status — live from API */}
      {loading && <LoadingState label="Loading model status…" />}
      {!loading && error && <ErrorState message={error} onRetry={fetchStatus} />}
      {!loading && !error && mlStatus && (
        <MLStatusPanel models={mlStatus} onRefresh={fetchStatus} />
      )}

      {/* FL accuracy curve */}
      <Card accent="vault">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-semibold text-sm tracking-tight">Accuracy by FL Round</h3>
          <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            FedAvg aggregation · live status
          </span>
        </div>
        {flHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={flHistory} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor"
                className="text-ink-950/5 dark:text-white/5" vertical={false} />
              <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#8B92A5' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0.0, 1.0]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                tick={{ fontSize: 11, fill: '#8B92A5' }}
                axisLine={false} tickLine={false} width={42}
              />
              <Tooltip content={<RoundTooltip />} />
              <Line type="monotone" dataKey="accuracy" stroke="#4C8DFF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-12 text-center text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            No federated learning rounds completed yet (accuracy: 0.0%). Start the Flower aggregator and client network.
          </div>
        )}
      </Card>

      {/* Client nodes */}
      <Card padded={false}>
        <div className="p-5 pb-3">
          <h3 className="font-display font-semibold text-sm tracking-tight">FL Client Nodes</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
            Client nodes currently connected to the federated learning loop.
          </p>
        </div>
        <div className="overflow-x-auto">
          {clientsList.length > 0 ? (
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
                {clientsList.map((c) => {
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
          ) : (
            <div className="p-8 text-center text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              0 client nodes currently connected to the aggregator.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
