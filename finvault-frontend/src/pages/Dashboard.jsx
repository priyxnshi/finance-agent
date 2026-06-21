import React from 'react'
import { Wallet, TrendingDown, PiggyBank, Target } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import TrendChart from '../components/ui/TrendChart.jsx'
import CategoryDonut from '../components/ui/CategoryDonut.jsx'
import Heatmap from '../components/ui/Heatmap.jsx'
import AIInsightsPanel from '../components/ui/AIInsightsPanel.jsx'
import { balanceTrend, categoryBreakdown, heatmapData, aiInsights } from '../data/mockData.js'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
          Good evening, Pri — here's where things stand.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Balance"
          value="₹5,81,300"
          delta="+4.1% vs last month"
          deltaTone="green"
          icon={Wallet}
          accent="vault"
        />
        <MetricCard
          label="Monthly Spend"
          value="₹50,100"
          delta="-7.8% vs last month"
          deltaTone="green"
          icon={TrendingDown}
          accent="red"
        />
        <MetricCard
          label="Savings Rate"
          value="36%"
          delta="+12 pts vs Q1"
          deltaTone="green"
          icon={PiggyBank}
          accent="green"
        />
        <MetricCard
          label="Active Goals"
          value="4"
          delta="1 nearing completion"
          deltaTone="neutral"
          icon={Target}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="vault">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-sm tracking-tight">Balance Trend</h3>
            <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              Last 12 months · sample data
            </span>
          </div>
          <TrendChart data={balanceTrend} />
        </Card>

        <Card accent="blue">
          <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Spend by Category</h3>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-2">
            June 2026 · sample data
          </p>
          <CategoryDonut data={categoryBreakdown} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" accent="green">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm tracking-tight">Spending Activity</h3>
            <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              2026 · daily intensity
            </span>
          </div>
          <Heatmap data={heatmapData} />
        </Card>

        <AIInsightsPanel insights={aiInsights} />
      </div>
    </div>
  )
}
