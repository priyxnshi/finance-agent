import React from 'react'
import { TrendingUp, Brain } from 'lucide-react'
import Card from './Card.jsx'

/*
 * Displays next-month spending predictions from both models.
 * `recommended` from the API tells us which model is more trustworthy
 * given the amount of history available — we highlight that one.
 */
const fmt = (n) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`

export default function SpendingForecastCard({ data }) {
  if (!data) return null

  const { linear_regression: lr, arima, recommended, data_points_used } = data
  const recommendedLabel = recommended === 'arima' ? 'ARIMA' : 'Linear Regression'

  return (
    <Card accent="blue">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={14} className="text-signal-blue" />
        <p className="text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          Spending Forecast
        </p>
        <span className="ml-auto text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          {data_points_used} month{data_points_used !== 1 ? 's' : ''} of history
        </span>
      </div>

      <div className="space-y-3">
        {/* Linear Regression */}
        <div className={`rounded-md border p-3 ${recommended === 'linear_regression'
          ? 'border-signal-blue/40 bg-signal-blue/[0.06]'
          : 'border-line-light dark:border-line'}`}>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
              <p className="text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary">
                Linear Regression
              </p>
              {recommended === 'linear_regression' && (
                <span className="text-2xs px-1.5 py-0.5 rounded-full bg-signal-blue/10 text-signal-blue font-medium">
                  Recommended
                </span>
              )}
            </div>
            {lr?.model_r2 !== null && lr?.model_r2 !== undefined && (
              <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                R² {lr.model_r2}
              </span>
            )}
          </div>
          <p className="ledger-num text-xl font-semibold">{fmt(lr?.next_month_prediction ?? 0)}</p>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
            Trend-based extrapolation
          </p>
        </div>

        {/* ARIMA */}
        {arima ? (
          <div className={`rounded-md border p-3 ${recommended === 'arima'
            ? 'border-signal-blue/40 bg-signal-blue/[0.06]'
            : 'border-line-light dark:border-line'}`}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <Brain size={12} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
                <p className="text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary">
                  ARIMA (2,1,1)
                </p>
                {recommended === 'arima' && (
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-signal-blue/10 text-signal-blue font-medium">
                    Recommended
                  </span>
                )}
              </div>
              {arima.model_aic && (
                <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                  AIC {Math.round(arima.model_aic)}
                </span>
              )}
            </div>
            <p className="ledger-num text-xl font-semibold">{fmt(arima.next_month_prediction)}</p>
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
              Captures autocorrelation & short-term patterns
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-line-light dark:border-line p-3">
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              ARIMA requires 6+ months of data. Add more expenses to unlock.
            </p>
          </div>
        )}
      </div>

      <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-3">
        Next month predicted spend — {recommendedLabel} is the recommended estimate.
      </p>
    </Card>
  )
}
