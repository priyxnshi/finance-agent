import React, { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
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
  getExpenses,
  predictGoals,
  executeAgentLoop,
} from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

const DEFAULT_BUDGETS = {
  'Food & Dining': 1000,
  'Food': 1000,
  'Shopping': 2000,
  'Travel': 5000,
  'Subscriptions': 500,
  'Investment': 10000,
  'Housing': 3000,
  'Transport': 200,
}

export default function Insights() {
  const [trends, setTrends] = useState(null)
  const [categories, setCategories] = useState([])
  const [monthlySummary, setMonthlySummary] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [anomalies, setAnomalies] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('finvault_budgets')
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS
  })
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [budgetForm, setBudgetForm] = useState({})

  useEffect(() => {
    setBudgetForm(budgets)
  }, [budgets])

  function handleSaveBudgets() {
    setBudgets(budgetForm)
    localStorage.setItem('finvault_budgets', JSON.stringify(budgetForm))
    setShowBudgetModal(false)
    fetchAll()
  }

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

      // Invoke the AI agent loop to get dynamic recommendations
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      Promise.all([
        getExpenses({ category: 'Income', start_date: startOfMonth, end_date: endOfMonth }).catch(() => []),
        detectAnomalies(100).catch(() => ({ anomalies_found: 0 })),
        predictGoals().catch(() => ({ predictions: [] }))
      ]).then(([incomeRes, anomalyRes, goalPredRes]) => {
        const monthlyIncome = incomeRes.reduce((acc, tr) => acc + (tr.amount || 0), 0)
        const anomaliesCount = anomalyRes.anomalies_found || 0
        const predictionsList = goalPredRes.predictions ?? []
        const avgGoalProb = predictionsList.length > 0 
          ? (predictionsList.reduce((acc, p) => acc + p.achievement_probability, 0) / predictionsList.length)
          : 0.0

        const savedBudgets = localStorage.getItem('finvault_budgets')
        const categoryBudgets = savedBudgets ? JSON.parse(savedBudgets) : DEFAULT_BUDGETS

        const breakdownPayload = {}
        const cats = c?.categories || []
        cats.forEach((item) => {
          breakdownPayload[item.category] = {
            amount: item.total,
            budget: categoryBudgets[item.category] || 99999
          }
        })

        executeAgentLoop({
          monthly_spend: ms?.total_spent || 0,
          monthly_income: monthlyIncome,
          goal_probability: avgGoalProb,
          anomalies_count: anomaliesCount,
          category_breakdown: breakdownPayload
        }).then((agentRes) => {
          const activeRecs = agentRes.active_recommendations ?? []
          const mapped = activeRecs.map((rec) => ({
            id: rec.id,
            tone: rec.severity === 'critical' || rec.severity === 'warning' ? 'warning' : 'neutral',
            title: rec.title,
            body: rec.body
          }))
          setInsights(mapped)
        }).catch(() => {
          setInsights([])
        })
      }).catch(() => {
        setInsights([])
      })

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
        <div className="flex items-between justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-vault" />
            <h2 className="font-display font-semibold tracking-tight">Agent Summary</h2>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="text-2xs font-semibold px-2.5 py-1 rounded border border-vault/30 bg-vault/5 text-vault hover:bg-vault/10 transition"
          >
            Configure Budgets
          </button>
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
        <AIInsightsPanel insights={insights} title="ML Status Notes" />
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

      {/* Configure Budgets Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-paper dark:bg-ink-900 border border-line-light dark:border-white/10 rounded-card shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-line-light dark:border-white/10 flex justify-between items-center">
              <h3 className="font-display font-semibold text-sm tracking-tight text-ledger-light-primary dark:text-ledger-dark-primary">
                Configure Monthly Budgets (₹)
              </h3>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {Object.keys(DEFAULT_BUDGETS).map((cat) => (
                <div key={cat} className="flex items-center justify-between gap-4">
                  <label className="text-xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary">
                    {cat}
                  </label>
                  <input
                    type="number"
                    value={budgetForm[cat] ?? ''}
                    onChange={(e) => setBudgetForm({ ...budgetForm, [cat]: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 1000"
                    className="h-8 px-2 w-32 rounded border border-line-light dark:border-line bg-paper-raised dark:bg-ink-850 text-xs text-right text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="p-5 bg-ink-950/[0.02] dark:bg-white/[0.02] border-t border-line-light dark:border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="h-9 px-3 rounded-md text-xs font-medium border border-line-light dark:border-line text-ledger-light-secondary dark:text-ledger-dark-secondary hover:bg-ink-950/[0.02] dark:hover:bg-white/[0.02] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudgets}
                className="h-9 px-3 rounded-md text-xs font-medium bg-vault text-ink-950 hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
