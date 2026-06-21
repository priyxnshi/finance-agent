import React from 'react'
import { Sparkles } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import AIInsightsPanel from '../components/ui/AIInsightsPanel.jsx'
import TrendChart from '../components/ui/TrendChart.jsx'
import ChartPlaceholder from '../components/ui/ChartPlaceholder.jsx'
import { balanceTrend, aiInsights } from '../data/mockData.js'

export default function Insights() {
  return (
    <div className="space-y-6">
      <Card accent="vault" className="bg-gradient-to-br from-vault/[0.06] to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-vault" />
          <h2 className="font-display font-semibold tracking-tight">Agent Summary</h2>
        </div>
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed max-w-2xl">
          Overall, your finances trended positively this quarter. Spend dropped in two of your three largest
          categories, and your savings rate is now ahead of your annual target. The sections below break this down
          further — once the categorization model from Phase 4 is live, these will update from real transaction data.
        </p>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="blue">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Projected Balance</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-2">
            Linear regression forecast · arrives in Phase 3
          </p>
          <TrendChart data={balanceTrend} />
        </Card>
        <AIInsightsPanel insights={aiInsights} title="Agent Notes" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card accent="green">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Anomaly Detection</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
            Flags unusual transactions against your spending baseline.
          </p>
          <ChartPlaceholder label="Anomaly scoring connects once the ML categorizer ships in Phase 4" />
        </Card>
        <Card accent="amber">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Cash Flow Forecast</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
            30-day projected inflow vs outflow.
          </p>
          <ChartPlaceholder label="Forecasting model connects in Phase 3" />
        </Card>
      </div>
    </div>
  )
}
