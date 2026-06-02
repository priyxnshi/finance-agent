import { useState, useEffect } from 'react'
import { analysisApi } from '../services/api'
import { S, MetricCard, SectionLabel, Pill, InsightCard, Card } from '../components/layout/UIKit'

const ICON_MAP = { warn: '⚠', good: '✓', info: '◷', bad: '✗' }

export default function Insights() {
  const [insights, setInsights] = useState([])
  const [summary,  setSummary]  = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ins, s] = await Promise.all([
          analysisApi.insights(),
          analysisApi.summary(),
        ])
        setInsights(ins)
        setSummary(s)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const warnings = insights.filter(i => i.type === 'warn' || i.type === 'bad').length
  const positive  = insights.filter(i => i.type === 'good').length
  const changePct = summary?.change_pct ?? 0

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={S.pageTitle}>Insights</div>
        <div style={S.pageSub}>AI-generated analysis of your financial behaviour</div>
      </div>

      <div style={S.metricsGrid}>
        <MetricCard label="Total insights"    value={loading ? '—' : insights.length} foot={<><Pill type="nt">this session</Pill></>} />
        <MetricCard label="Spending change"   value={loading ? '—' : `${changePct >= 0 ? '+' : ''}${changePct}%`} foot={<><Pill type={changePct >= 0 ? 'dn' : 'up'}>{changePct >= 0 ? 'up' : 'down'}</Pill> vs last month</>} />
        <MetricCard label="Alerts"            value={loading ? '—' : warnings} foot={<><Pill type={warnings > 0 ? 'dn' : 'up'}>{warnings > 0 ? 'needs attention' : 'all clear'}</Pill></>} />
        <MetricCard label="Positive signals"  value={loading ? '—' : positive} foot={<><Pill type="up">good trends</Pill></>} />
      </div>

      <SectionLabel>All insights</SectionLabel>

      {loading ? (
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading insights…</div>
      ) : insights.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)', fontSize: 13 }}>
            No insights yet. Add expenses and goals to receive AI-powered analysis.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
          {insights.map((ins, i) => (
            <InsightCard
              key={i}
              icon={ICON_MAP[ins.type] ?? '◷'}
              type={ins.type}
              text={ins.text}
              meta={ins.meta}
            />
          ))}
        </div>
      )}
    </div>
  )
}
