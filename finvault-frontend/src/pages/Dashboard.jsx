import React, { useEffect, useState } from 'react'
import { Wallet, TrendingDown, PiggyBank, Target } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import MonthlyTrendChart from '../components/ui/MonthlyTrendChart.jsx'
import CategoryDonut from '../components/ui/CategoryDonut.jsx'
import SpendingHeatmap from '../components/ui/SpendingHeatmap.jsx'
import AIInsightsPanel from '../components/ui/AIInsightsPanel.jsx'
import HealthScoreCard from '../components/ui/HealthScoreCard.jsx'
import MonthlySummaryCard from '../components/ui/MonthlySummaryCard.jsx'
import SpendingForecastCard from '../components/ui/SpendingForecastCard.jsx'
import GoalsSummaryCard from '../components/ui/GoalsSummaryCard.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getAnalyticsCategories,
  getAnalyticsHeatmap,
  getAnalyticsHealthScore,
  getAnalyticsMonthlySummary,
  predictSpending,
  getGoals,
  predictGoals,
} from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

const aiInsights = [
  { id: 1, tone: 'positive', title: 'ML models active', body: 'Categorizer, anomaly detector, spending forecast, and goal predictor are all running.' },
  { id: 2, tone: 'warning', title: 'Review subscriptions', body: 'Recurring charges make up a growing share of monthly spend.' },
  { id: 3, tone: 'neutral', title: 'See full analysis', body: 'Visit the Insights page for anomaly detection and detailed trend breakdowns.' },
]

const fmt = (n) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState(null)
  const [categories, setCategories] = useState(null)
  const [heatmap, setHeatmap] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [monthlySummary, setMonthlySummary] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [goals, setGoals] = useState([])
  const [goalPredictions, setGoalPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchAll() {
    setLoading(true)
    setError('')
    try {
      const [s, t, c, h, hs, ms] = await Promise.all([
        getAnalyticsSummary(),
        getAnalyticsTrends(6),
        getAnalyticsCategories(),
        getAnalyticsHeatmap(365),
        getAnalyticsHealthScore(),
        getAnalyticsMonthlySummary(),
      ])
      setSummary(s)
      setTrends(t)
      setCategories(c)
      setHeatmap(h)
      setHealthScore(hs)
      setMonthlySummary(ms)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)

    // Non-blocking: ML + goals fire after core data is shown
    predictSpending().then(setForecast).catch(() => {})

    getGoals().then((goalList) => {
      setGoals(goalList)
      // Only fire goal predictions if there are goals
      if (goalList.length > 0) {
        predictGoals()
          .then((res) => {
            const map = {}
            for (const p of res.predictions ?? []) map[p.goal_id] = p
            setGoalPredictions(map)
          })
          .catch(() => {})
      }
    }).catch(() => {})
  }

  useEffect(() => { fetchAll() }, [])

  if (loading) return <LoadingState label="Loading dashboard…" />
  if (error) return <ErrorState message={error} onRetry={fetchAll} />

  const coloredCategories = withCategoryColors(categories?.categories ?? [])
  const donutData = coloredCategories.map((c) => ({ name: c.category, value: c.total, color: c.color }))
  const growth = trends?.spending_growth_percent

  return (
    <div className="space-y-6">
      <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
        Here's where you stand today.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Spending"
          value={fmt(summary.total_spending)}
          delta={`${summary.transaction_count} transactions all time`}
          deltaTone="neutral" icon={Wallet} accent="vault"
        />
        <MetricCard
          label="Monthly Spend"
          value={fmt(summary.monthly_spending)}
          delta={growth != null
            ? `${growth > 0 ? '+' : ''}${growth.toFixed(1)}% vs last month`
            : 'No prior month data'}
          deltaTone={growth != null ? (growth <= 0 ? 'green' : 'red') : 'neutral'}
          icon={TrendingDown} accent="red"
        />
        <MetricCard
          label="Weekly Spend"
          value={fmt(summary.weekly_spending)}
          delta="This week (Mon – today)"
          deltaTone="neutral" icon={PiggyBank} accent="green"
        />
        <MetricCard
          label="Top Category"
          value={summary.top_category ?? '—'}
          delta={summary.top_category ? `${fmt(summary.top_category_amount)} total` : 'No data yet'}
          deltaTone="neutral" icon={Target} accent="blue"
        />
      </div>

      {/* Trend + Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="vault">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-sm tracking-tight">Monthly Spend Trend</h3>
            <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              Last 6 months · live
            </span>
          </div>
          {trends?.monthly_trend?.length > 0
            ? <MonthlyTrendChart data={trends.monthly_trend} />
            : <p className="text-xs text-center text-ledger-light-tertiary dark:text-ledger-dark-tertiary py-10">No monthly data yet.</p>
          }
        </Card>
        <Card accent="blue">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Spend by Category</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-2">All time · live</p>
          <CategoryDonut data={donutData} />
        </Card>
      </div>

      {/* Health + Monthly summary + Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthScore && (
          <HealthScoreCard
            score={healthScore.score}
            label={healthScore.label}
            factors={healthScore.factors}
          />
        )}
        {monthlySummary && <MonthlySummaryCard data={monthlySummary} />}
        {forecast
          ? <SpendingForecastCard data={forecast} />
          : <AIInsightsPanel insights={aiInsights} />
        }
      </div>

      {/* Goal Outlook — shows goal progress + ML probability for each goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoalsSummaryCard goals={goals} predictions={goalPredictions} />
        {forecast && <AIInsightsPanel insights={aiInsights} />}
      </div>

      {/* Heatmap */}
      <Card accent="green">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm tracking-tight">Spending Activity</h3>
          <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            Last 365 days · daily intensity
          </span>
        </div>
        {heatmap?.days?.length > 0
          ? <SpendingHeatmap days={heatmap.days} maxDailyTotal={heatmap.max_daily_total} />
          : <p className="text-xs text-center text-ledger-light-tertiary dark:text-ledger-dark-tertiary py-8">No spending data yet.</p>
        }
      </Card>
    </div>
  )
}
