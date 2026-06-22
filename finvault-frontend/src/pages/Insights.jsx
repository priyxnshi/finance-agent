import React, { useEffect, useState } from 'react'
import { Sparkles, Check, X, ShieldAlert, HeartPulse, RefreshCw } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import MonthlyTrendChart from '../components/ui/MonthlyTrendChart.jsx'
import CategoryBarChart from '../components/ui/CategoryBarChart.jsx'
import MonthlySummaryCard from '../components/ui/MonthlySummaryCard.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'

// API Hook Frameworks
import { 
  getAnalyticsTrends, getAnalyticsCategories, getAnalyticsMonthlySummary,
  processAgentLoop, sendAgentFeedback 
} from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

export default function Insights() {
  const [trends, setTrends] = useState(null)
  const [categories, setCategories] = useState([])
  const [monthlySummary, setMonthlySummary] = useState(null)
  
  // === PHASE 5 AGENT STATE ARRAYS ===
  const [agentMetrics, setAgentMetrics] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function syncAgentLoop() {
    try {
      const [t, c, ms] = await Promise.all([
        getAnalyticsTrends(6),
        getAnalyticsCategories(),
        getAnalyticsMonthlySummary(),
      ])
      
      setTrends(t)
      setCategories(withCategoryColors(c.categories))
      setMonthlySummary(ms)

      // Transform raw parameters into Observation Vectors for the loop execution payload
      const totalSpendThisMonth = ms?.total_expenses || 1200
      const averageIncomeBaseline = 4500
      
      // Dynamic mock parsing from previous ML evaluation states
      const mockCategoryBreakdown = {
        "Food": { "amount": 680, "budget": 450 },
        "Shopping": { "amount": 510, "budget": 300 }
      }

      const loopResponse = await processAgentLoop({
        monthly_spend: totalSpendThisMonth,
        monthly_income: averageIncomeBaseline,
        goal_probability: 0.78, // Pulled from your Phase 4 model
        anomalies_count: 1,
        category_breakdown: mockCategoryBreakdown
      })

      setAgentMetrics(loopResponse.agent_score_metrics)
      setRecommendations(loopResponse.active_recommendations)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { syncAgentLoop() }, [])

  const handleAction = async (recId, category, strategy, actionType) => {
    try {
      // Optimistically clean up UI display list state array elements
      setRecommendations(prev => prev.filter(r => r.id !== recId))
      
      // Post telemetry variables out to register feedback matrices locally
      await sendAgentFeedback({
        recommendation_id: recId,
        category: category,
        strategy_type: strategy,
        action_taken: actionType
      })
    } catch (err) {
      console.error("Failed to register feedback transaction action:", err)
    }
  }

  if (loading) return <LoadingState label="Orchestrating agent autonomous lifecycle loops..." />
  if (error) return <ErrorState message={error} onRetry={syncAgentLoop} />

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      
      {/* Dynamic Agent Core Banner Block */}
      <Card accent="vault" className="bg-gradient-to-br from-vault/[0.08] to-transparent p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-vault animate-pulse" />
              <h2 className="font-display font-semibold text-lg tracking-tight">FinVault AI Agent Dashboard</h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl">
              Active Strategy Engine: Adaptive Rules and Memory tracking are operational on localhost.
            </p>
          </div>
          
          {/* Health Index Metric Display */}
          {agentMetrics && (
            <div className="border border-zinc-800 bg-black/60 rounded-xl px-5 py-3 flex items-center gap-4">
              <HeartPulse size={28} className="text-emerald-400" />
              <div>
                <p className="text-2xs text-zinc-500 font-mono tracking-wider uppercase">Health Index</p>
                <h1 className="text-3xl font-light tracking-tight text-emerald-400 font-mono">{agentMetrics.health_score}</h1>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Analytics Data Tracks */}
        <div className="lg:col-span-2 space-y-6">
          <Card accent="blue" className="p-4">
            <h3 className="font-display font-semibold text-sm tracking-tight mb-2">Monthly Spend History</h3>
            <MonthlyTrendChart data={trends?.monthly_trend || []} />
          </Card>

          <Card accent="amber" className="p-4">
            <h3 className="font-display font-semibold text-sm tracking-tight mb-4">Functional Resource Composition</h3>
            <CategoryBarChart data={categories} />
          </Card>
        </div>

        {/* Right Column: AI Insights & Recommendation Processing Panels */}
        <div className="space-y-6">
          <div className="border border-zinc-800 bg-zinc-950/50 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">Proactive Action Feed</h4>
              <button onClick={syncAgentLoop} className="text-zinc-500 hover:text-white transition">
                <RefreshCw size={12} />
              </button>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-8 font-mono">
                No new interventions computed by current strategy loop.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="border border-zinc-800 bg-black/40 rounded-lg p-4 space-y-3 transition hover:border-zinc-700">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          rec.strategy_type === 'supportive' ? 'bg-indigo-950/50 border-indigo-900 text-indigo-400' : 'bg-amber-950/50 border-amber-900 text-amber-400'
                        }`}>
                          {rec.strategy_type} Strategy
                        </span>
                        {rec.severity === 'critical' && <ShieldAlert size={14} className="text-rose-500" />}
                      </div>
                      <h5 className="text-xs font-semibold mt-2 text-zinc-200">{rec.title}</h5>
                      <p className="text-2xs text-zinc-400 mt-1 leading-normal">{rec.body}</p>
                    </div>

                    {/* Interactive Action Interface Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                      <button 
                        onClick={() => handleAction(rec.id, rec.category, rec.strategy_type, 'ACCEPTED')}
                        className="flex-1 flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] py-1.5 rounded font-medium border border-zinc-800 transition"
                      >
                        <Check size={12} className="text-emerald-400" /> Accept
                      </button>
                      <button 
                        onClick={() => handleAction(rec.id, rec.category, rec.strategy_type, 'IGNORED')}
                        className="px-3 flex items-center justify-center py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded transition text-zinc-500 hover:text-rose-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {monthlySummary && <MonthlySummaryCard data={monthlySummary} />}
        </div>

      </div>
    </div>
  )
}