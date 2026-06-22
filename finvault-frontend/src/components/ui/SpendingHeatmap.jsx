import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

/*
 * Converts the backend's max_daily_total into 5 intensity buckets (0-4).
 * 0 = no spend, 1-4 = increasing intensity quartiles of max_daily_total.
 * The CSS classes map these to the vault gold scale defined below.
 */
function getIntensity(total, maxTotal) {
  if (!total || total === 0) return 0
  if (maxTotal === 0) return 1
  const ratio = total / maxTotal
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 0.75) return 3
  return 4
}

function buildValues(days, maxTotal) {
  return days.map((d) => ({
    date: d.date,
    count: getIntensity(d.total, maxTotal),
    total: d.total,
    transaction_count: d.transaction_count,
  }))
}

function getEndDate() {
  return new Date()
}

function getStartDate(days = 365) {
  const d = new Date()
  d.setDate(d.getDate() - days + 1)
  return d
}

export default function SpendingHeatmap({ days = [], maxDailyTotal = 0 }) {
  const values = buildValues(days, maxDailyTotal)
  const startDate = getStartDate(365)
  const endDate = getEndDate()

  return (
    <div className="spending-heatmap">
      <style>{`
        .spending-heatmap .react-calendar-heatmap text {
          fill: #5C6378;
          font-size: 9px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .spending-heatmap .react-calendar-heatmap rect {
          rx: 2px;
        }
        /* intensity 0 - no spend */
        .spending-heatmap .color-empty,
        .spending-heatmap .color-scale-0 {
          fill: rgba(255,255,255,0.04);
        }
        /* light mode overrides */
        @media (prefers-color-scheme: light) {
          .spending-heatmap .color-empty,
          .spending-heatmap .color-scale-0 { fill: rgba(0,0,0,0.05); }
        }
        .dark .spending-heatmap .color-empty,
        .dark .spending-heatmap .color-scale-0 { fill: rgba(255,255,255,0.04); }
        html:not(.dark) .spending-heatmap .color-empty,
        html:not(.dark) .spending-heatmap .color-scale-0 { fill: rgba(0,0,0,0.07); }

        .spending-heatmap .color-scale-1 { fill: rgba(201,162,39,0.25); }
        .spending-heatmap .color-scale-2 { fill: rgba(201,162,39,0.50); }
        .spending-heatmap .color-scale-3 { fill: rgba(201,162,39,0.75); }
        .spending-heatmap .color-scale-4 { fill: #C9A227; }
      `}</style>

      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(value) => {
          if (!value || value.count === 0) return 'color-empty'
          return `color-scale-${value.count}`
        }}
        titleForValue={(value) => {
          if (!value || !value.date) return 'No data'
          const rupee = '\u20B9'
          if (!value.total) return `${value.date}: no spend`
          return `${value.date}: ${rupee}${value.total.toLocaleString('en-IN')} across ${value.transaction_count} txn(s)`
        }}
        showWeekdayLabels
        gutterSize={3}
      />

      <div className="flex items-center gap-2 mt-3 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
        <span>Less</span>
        {['rgba(255,255,255,0.04)', 'rgba(201,162,39,0.25)', 'rgba(201,162,39,0.50)', 'rgba(201,162,39,0.75)', '#C9A227'].map((color, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-[2px] inline-block" style={{ backgroundColor: color, border: '1px solid rgba(255,255,255,0.08)' }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
