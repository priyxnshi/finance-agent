import { useState, useEffect } from 'react'
import { analysisApi, goalApi } from '../services/api'
import { S, MetricCard, SectionLabel, Card, Pill, InsightCard, GoalCard } from '../components/layout/UIKit'
import { BarChart, CategoryChart, HeatmapChart } from '../components/charts/Charts'

const FL_CLIENTS = [
  { name: 'Client A', type: 'Student profile',  acc: '+2.1%', color: 'var(--green)' },
  { name: 'Client B', type: 'Office worker',     acc: '+1.8%', color: 'var(--blue)'  },
  { name: 'Client C', type: 'Family profile',    acc: '+2.4%', color: 'var(--amber)' },
]

export default function Dashboard() {
  const [summary,  setSummary]  = useState(null)
  const [insights, setInsights] = useState([])
  const [goals,    setGoals]    = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, ins, g] = await Promise.all([
          analysisApi.summary(),
          analysisApi.insights(),
          goalApi.list(),
        ])
        setSummary(s)
        setInsights(ins)
        setGoals(g)
      } catch (e) {
        console.error('Dashboard load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const changePct  = summary?.change_pct ?? 0
  const changeType = changePct >= 0 ? 'dn' : 'up'
  const changeLabel= `${changePct >= 0 ? '↑' : '↓'} ${Math.abs(changePct)}%`

  // Overall goal progress across all active goals
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalSaved  = goals.reduce((s, g) => s + g.saved_amount,  0)
  const goalPct     = totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) : 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={S.pageTitle}>Dashboard</div>
        <div style={S.pageSub}>Financial summary · {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
      </div>

      {/* Metric cards — real data */}
      <div style={S.metricsGrid}>
        <MetricCard
          label="Total spending"
          value={loading ? '—' : `₹${(summary?.total_this_month ?? 0).toLocaleString()}`}
          foot={loading ? '—' : <><Pill type={changeType}>{changeLabel}</Pill> vs last month</>}
        />
        <MetricCard
          label="Last month"
          value={loading ? '—' : `₹${(summary?.total_last_month ?? 0).toLocaleString()}`}
          foot={<><Pill type="nt">previous month</Pill></>}
        />
        <MetricCard
          label="Avg daily spend"
          value={loading ? '—' : `₹${(summary?.avg_daily ?? 0).toLocaleString()}`}
          foot={<><Pill type="nt">this month</Pill></>}
        />
        <MetricCard
          label="Goal progress"
          value={loading ? '—' : `${goalPct}%`}
          foot={<><Pill type="nt">{goals.length} active goal{goals.length !== 1 ? 's' : ''}</Pill></>}
        />
      </div>

      {/* Charts — real data from summary */}
      <SectionLabel>Spending analytics</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 14, marginBottom: 14 }}>
        <Card title="Monthly trend" sub="Last 6 months · INR">
          <BarChart data={summary?.monthly_trend ?? []} />
        </Card>
        <Card title="Category breakdown" sub="This month">
          <CategoryChart data={summary?.category_breakdown ?? []} />
        </Card>
      </div>

      {/* Heatmap */}
      <SectionLabel>Daily activity</SectionLabel>
      <Card title="Spending heatmap" sub="Daily expenditure intensity · past 12 months" style={{ marginBottom: 14 }}>
        <HeatmapChart />
      </Card>

      {/* Insights — real AI output */}
      <SectionLabel>AI insights</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 28 }}>
        {loading ? (
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading insights…</div>
        ) : insights.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>
            Add expenses to see AI-generated insights.
          </div>
        ) : (
          insights.map((ins, i) => (
            <InsightCard key={i} icon={iconFor(ins.type)} type={ins.type} text={ins.text} meta={ins.meta} />
          ))
        )}
      </div>

      {/* Goals + FL */}
      <SectionLabel>Goals &amp; federated learning</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginBottom: 40 }}>
        {/* First active goal or empty state */}
        {goals.length > 0 ? (
          <GoalCard {...goals[0]} />
        ) : (
          <Card>
            <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
              No goals yet. Go to the Goals tab to create one.
            </div>
          </Card>
        )}

        {/* FL card */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Federated learning</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>Privacy-preserving training</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--green)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
              Active
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {[['Rounds', '24'], ['Clients', '3'], ['Accuracy', '91%']].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text)' }}>{v}</div>
              </div>
            ))}
          </div>
          {FL_CLIENTS.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{c.type}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.color }}>{c.acc}</div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '9px 11px', background: 'var(--surface2)', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 13, color: 'var(--green)' }}>⊕</span>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>Raw data never leaves your device. Only model weights are shared.</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function iconFor(type) {
  return { warn: '⚠', good: '✓', info: '◷', bad: '✗' }[type] ?? '◷'
}
