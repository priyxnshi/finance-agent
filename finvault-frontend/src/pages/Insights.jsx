import React, { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import AIInsightsPanel from '../components/ui/AIInsightsPanel.jsx'
import MonthlyTrendChart from '../components/ui/MonthlyTrendChart.jsx'
import CategoryBarChart from '../components/ui/CategoryBarChart.jsx'
import MonthlySummaryCard from '../components/ui/MonthlySummaryCard.jsx'
import SpendingForecastCard from '../components/ui/SpendingForecastCard.jsx'
import AnomalyFeed from '../components/ui/AnomalyFeed.jsx'
import ChartPlaceholder from '../components/ui/ChartPlaceholder.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import {
  getAnalyticsTrends,
  getAnalyticsCategories,
  getAnalyticsMonthlySummary,
  predictSpending,
  detectAnomalies,
} from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

const aiInsights = [
  { id: 1, tone: 'positive', title: 'ML categorizer active', body: 'All new transactions can be auto-categorized — try it from the Expenses page.' },
  { id: 2, tone: 'warning', title: 'Anomaly detector watching', body: 'Isolation Forest is scanning every transaction against your baseline. Unusual spend appears in the feed below.' },
  { id: 3, tone: 'neutral', title: 'Goal predictor running', body: 'Achievement probability is shown on every goal card. Go to Goals to see your forecast.' },
]

export default function Insights() {
  const [trends, setTrends] = useState(null)
  const [categories, setCategories] = useState([])
  const [monthlySummary, setMonthlySummary] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [anomalies, setAnomalies] = useState(null)
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
      setLoading(false)
      return
    }

    // ML endpoints — each fails independently (model may not be trained yet)
    predictSpending().then(setForecast).catch(() => {})
    detectAnomalies(100).then(setAnomalies).catch(() => {})

    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  if (loading) return <LoadingState label="Loading insights…" />
  if (error) return <ErrorState message={error} onRetry={fetchAll} />

  const growth = trends?.spending_growth_percent
  const growthLabel = growth != null
    ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% vs last month.`
    : 'First month — no prior period to compare.'

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <Card accent="vault" className="bg-gradient-to-br from-vault/[0.06] to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-vault" />
          <h2 className="font-display font-semibold tracking-tight">Agent Summary</h2>
        </div>
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed max-w-2xl">
          Spending is {growth != null ? (growth <= 0 ? 'down' : 'up') : 'being tracked'} this period.{' '}
          {growthLabel} Phase 4 ML models are active — anomaly detection, spending forecast, and goal probability all running live.
        </p>
      </Card>

      {/* Trend + Agent notes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="blue">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Monthly Spend Trend</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-2">Last 6 months · live</p>
          {trends?.monthly_trend?.length > 0
            ? <MonthlyTrendChart data={trends.monthly_trend} />
            : <p className="text-xs text-center text-ledger-light-tertiary dark:text-ledger-dark-tertiary py-10">No monthly data yet.</p>
          }
        </Card>
        <AIInsightsPanel insights={aiInsights} title="ML Status Notes" />
      </div>

      {/* Forecast + Monthly summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forecast
          ? <SpendingForecastCard data={forecast} />
          : (
            <Card accent="blue">
              <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Spending Forecast</h3>
              <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
                Train the model to unlock predictions.
              </p>
              <ChartPlaceholder label="Run: python scripts/train_models.py --only spend" height={120} />
            </Card>
          )
        }
        {monthlySummary && <MonthlySummaryCard data={monthlySummary} />}
      </div>

      {/* Anomaly feed */}
      {anomalies
        ? <AnomalyFeed
            scanned={anomalies.scanned}
            anomaliesFound={anomalies.anomalies_found}
            results={anomalies.results}
          />
        : (
          <Card accent="red">
            <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Anomaly Detection</h3>
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
              Isolation Forest not trained yet.
            </p>
            <ChartPlaceholder label="Run: python scripts/train_models.py --only anomaly" height={100} />
          </Card>
        )
      }

      {/* Category breakdown */}
      <div className="grid grid-cols-1 gap-4">
        <Card accent="amber">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-4">Category Breakdown</h3>
          <CategoryBarChart data={categories} />
        </Card>
      </div>
    </div>
  )
}
