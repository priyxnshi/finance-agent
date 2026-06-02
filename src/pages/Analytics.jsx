import { useState, useEffect } from 'react'
import { analysisApi, expenseApi } from '../services/api'
import { S, MetricCard, SectionLabel, Card, Pill } from '../components/layout/UIKit'
import { DowChart } from '../components/charts/Charts'

export default function Analytics() {
  const [summary,   setSummary]   = useState(null)
  const [expenses,  setExpenses]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, exps] = await Promise.all([
          analysisApi.summary(),
          expenseApi.list({ limit: 500 }),
        ])
        setSummary(s)
        setExpenses(exps)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  // Top merchants from real expenses
  const merchants = Object.values(
    expenses.reduce((acc, e) => {
      const key = e.description.split(' ')[0]
      if (!acc[key]) acc[key] = { name: key, cat: e.category, amt: 0 }
      acc[key].amt += e.amount
      return acc
    }, {})
  ).sort((a, b) => b.amt - a.amt).slice(0, 5)
  const mMax = merchants[0]?.amt || 1

  // Monthly trend from summary
  const trend = summary?.monthly_trend ?? []
  const tMax  = Math.max(...trend.map(t => t.total), 1)

  const changePct  = summary?.change_pct ?? 0
  const changeType = changePct >= 0 ? 'dn' : 'up'

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={S.pageTitle}>Analytics</div>
        <div style={S.pageSub}>Deep dive into your spending patterns</div>
      </div>

      <div style={S.metricsGrid}>
        <MetricCard
          label="Avg daily spend"
          value={loading ? '—' : `₹${(summary?.avg_daily ?? 0).toLocaleString()}`}
          foot={<><Pill type={changeType}>{changePct >= 0 ? '↑' : '↓'} {Math.abs(changePct)}%</Pill> vs last month</>}
        />
        <MetricCard
          label="Top category"
          value={loading ? '—' : (summary?.top_category ?? 'N/A')}
          foot={loading ? '—' : <>
            <Pill type="nt">
              ₹{(summary?.category_breakdown?.[0]?.total ?? 0).toLocaleString()}
            </Pill> this month
          </>}
        />
        <MetricCard
          label="Transactions"
          value={loading ? '—' : summary?.transaction_count ?? 0}
          foot={<><Pill type="nt">this month</Pill></>}
        />
        <MetricCard
          label="Total expenses"
          value={loading ? '—' : expenses.length}
          foot={<><Pill type="nt">all time</Pill></>}
        />
      </div>

      {/* 6-month trend from real data */}
      <SectionLabel>Trend analysis</SectionLabel>
      <Card title="6-month spending trend" sub="All categories combined" style={{ marginBottom: 14 }}>
        {trend.length === 0 ? (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No data yet — add expenses to see your trend.
          </div>
        ) : (
          <>
            <svg width="100%" height="150" viewBox="0 0 600 130" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--text)" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="var(--text)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0,1,2,3].map(i => (
                <line key={i} x1="0" y1={i*40} x2="600" y2={i*40} stroke="var(--border)" strokeWidth="1"/>
              ))}
              <polyline fill="url(#tg)" stroke="none"
                points={trend.map((t,i) => `${i*(600/(trend.length-1||1))},${110-Math.round(t.total/tMax*100)}`).join(' ') + ` 600,110 0,110`}
              />
              <polyline fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinejoin="round"
                points={trend.map((t,i) => `${i*(600/(trend.length-1||1))},${110-Math.round(t.total/tMax*100)}`).join(' ')}
              />
              {trend.map((t,i) => (
                <circle key={i} cx={i*(600/(trend.length-1||1))} cy={110-Math.round(t.total/tMax*100)}
                  r="3" fill="var(--surface)" stroke="var(--text)" strokeWidth="1.5"/>
              ))}
            </svg>
            <div style={{ display: 'flex', marginTop: 8 }}>
              {trend.map(t => (
                <div key={t.month} style={{ flex: 1, fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>
                  {t.month.slice(5)}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginBottom: 40 }}>
        {/* Top merchants from real expenses */}
        <Card title="Top merchants" sub="By total spend">
          {merchants.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
              No expense data yet.
            </div>
          ) : merchants.map(m => (
            <div key={m.name} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{m.name}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>₹{m.amt.toLocaleString()}</span>
              </div>
              <div style={{ height: 2, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${Math.round(m.amt/mMax*100)}%`, background: 'var(--text)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{m.cat}</span>
            </div>
          ))}
        </Card>

        {/* Category breakdown from real data */}
        <Card title="Category breakdown" sub="This month">
          {(summary?.category_breakdown ?? []).length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
              No expense data yet.
            </div>
          ) : (summary?.category_breakdown ?? []).map(c => (
            <div key={c.category} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{c.category}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>₹{c.total.toLocaleString()}</span>
              </div>
              <div style={{ height: 2, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.pct}%`, background: 'var(--text)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{c.pct}% · {c.count} transactions</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
