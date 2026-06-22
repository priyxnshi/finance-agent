import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line-light dark:border-line bg-paper-raised dark:bg-ink-850 px-3 py-2 shadow-popover text-xs">
      <p className="font-medium mb-0.5">{label}</p>
      <p className="ledger-num text-ledger-light-secondary dark:text-ledger-dark-secondary">
        {'\u20B9'}{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

function formatMonthLabel(monthStr) {
  const [, month] = monthStr.split('-')
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return names[parseInt(month, 10) - 1] ?? monthStr
}

export default function MonthlyTrendChart({ data }) {
  const chartData = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-950/5 dark:text-white/5" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8B92A5' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#8B92A5' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `\u20B9${Math.round(v / 1000)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#C9A227"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#C9A227', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
