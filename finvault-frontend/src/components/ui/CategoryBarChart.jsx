import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-line-light dark:border-line bg-paper-raised dark:bg-ink-850 px-3 py-2 shadow-popover text-xs">
      <p className="font-medium">{d.category}</p>
      <p className="ledger-num text-ledger-light-secondary dark:text-ledger-dark-secondary">
        ₹{d.total.toLocaleString('en-IN')} · {d.percentage}%
      </p>
    </div>
  )
}

export default function CategoryBarChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-center px-6">
        <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          No categorized spending yet — add or import some expenses to see a breakdown.
        </p>
      </div>
    )
  }

  // Horizontal bars read better than vertical once there are more than ~4
  // categories with long names ("Food & Dining" etc.) — labels stay legible
  // at any width instead of rotating or truncating.
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-ink-950/5 dark:text-white/5"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#8B92A5' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: 12, fill: '#8B92A5' }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,146,165,0.08)' }} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
