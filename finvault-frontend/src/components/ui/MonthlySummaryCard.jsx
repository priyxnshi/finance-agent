import React from 'react'
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from './Card.jsx'

function formatMonth(monthStr) {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const names = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${names[parseInt(month, 10) - 1]} ${year}`
}

export default function MonthlySummaryCard({ data }) {
  if (!data) return null

  const growth = data.change_vs_previous_month_percent
  const isUp = growth > 0
  const isDown = growth < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const trendColor = isUp ? 'text-signal-red' : isDown ? 'text-signal-green' : 'text-ledger-light-tertiary dark:text-ledger-dark-tertiary'

  return (
    <Card accent="blue">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} className="text-signal-blue" />
        <p className="text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          Monthly Summary
        </p>
        <span className="ml-auto text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          {formatMonth(data.month)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary">Total Spent</p>
          <p className="ledger-num font-semibold text-sm">{'\u20B9'}{data.total_spent.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary">Transactions</p>
          <p className="ledger-num font-semibold text-sm">{data.transaction_count}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary">Daily avg</p>
          <p className="ledger-num font-semibold text-sm">{'\u20B9'}{data.average_daily_spend.toLocaleString('en-IN')}</p>
        </div>
        {data.top_category && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary">Top category</p>
            <p className="text-xs font-medium">{data.top_category}</p>
          </div>
        )}
        {growth !== null && growth !== undefined && (
          <div className="pt-2 border-t border-line-light dark:border-line flex items-center gap-1.5">
            <TrendIcon size={13} className={trendColor} />
            <p className={`text-xs font-medium ${trendColor}`}>
              {Math.abs(growth).toFixed(1)}% {isUp ? 'more' : isDown ? 'less' : 'same'} than last month
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
