import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import AIInsightsPanel from '../components/ui/AIInsightsPanel.jsx'
import MonthlyTrendChart from '../components/ui/MonthlyTrendChart.jsx'
import CategoryBarChart from '../components/ui/CategoryBarChart.jsx'
import MonthlySummaryCard from '../components/ui/MonthlySummaryCard.jsx'
import ChartPlaceholder from '../components/ui/ChartPlaceholder.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import { getAnalyticsTrends, getAnalyticsCategories, getAnalyticsMonthlySummary } from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

const aiInsights = [
  { id: 1, tone: 'positive', title: 'Savings rate improving', body: 'Based on live transaction data, monthly outflow is tracking below last month.' },
  { id: 2, tone: 'warning', title: 'Review subscriptions', body: 'Recurring charges are a growing share of total spend.' },
  { id: 3, tone: 'neutral', title: 'Categorizer active', body: 'All transactions are categorized. ML-powered re-categorization arrives in Phase 4.' },
]

export default function Insights() {
  const [trends, setTrends] = useState(null)
  const [categories, setCategories] = useState([])
  const [monthlySummary, setMonthlySummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchAll() {
    setLoading(true)
    setError('')
    try {
      const [t, c, ms] = await Promise.all([
        getAnalyticsTrends(6),
        getAnalyticsCategories(),
        getAnalyticsMonthlySummary(),
      ])
      setTrends(t)
      setCategories(withCategoryColors(c.categories))
      setMonthlySummary(ms)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  if (loading) return <LoadingState label="Loading insights…" />
  if (error) return <ErrorState message={error} onRetry={fetchAll} />

  const growth = trends?.spending_growth_percent
  const growthLabel = growth !== null && growth !== undefined
    ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% vs last month.`
    : 'First month — no prior period to compare.'

  return (
    <div className="space-y-6">
      <Card accent="vault" className="bg-gradient-to-br from-vault/[0.06] to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-vault" />
          <h2 className="font-display font-semibold tracking-tight">Agent Summary</h2>
        </div>
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed max-w-2xl">
          Spending is {growth !== null && growth !== undefined
            ? (growth <= 0 ? 'down' : 'up')
            : 'being tracked'}{' '}
          this period. {growthLabel} Full ML-powered narrative analysis arrives in Phase 4.
        </p>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="blue">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Monthly Spend Trend</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-2">Last 6 months · live</p>
          {trends?.monthly_trend?.length > 0
            ? <MonthlyTrendChart data={trends.monthly_trend} />
            : <p className="text-xs text-center text-ledger-light-tertiary dark:text-ledger-dark-tertiary py-10">No monthly data yet.</p>
          }
        </Card>
        <AIInsightsPanel insights={aiInsights} title="Agent Notes" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="amber">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-4">Category Breakdown</h3>
          <CategoryBarChart data={categories} />
        </Card>
        {monthlySummary && <MonthlySummaryCard data={monthlySummary} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card accent="green">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Anomaly Detection</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
            Flags unusual transactions against your spending baseline.
          </p>
          <ChartPlaceholder label="Anomaly scoring connects once the ML categorizer ships in Phase 4" />
        </Card>
        <Card accent="red">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Cash Flow Forecast</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
            30-day projected inflow vs outflow — arrives in Phase 4.
          </p>
          <ChartPlaceholder label="Forecasting model connects in Phase 4" />
        </Card>
      </div>
    </div>
  )
}
