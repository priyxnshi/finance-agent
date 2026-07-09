import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-md border border-line-light dark:border-line bg-paper-raised dark:bg-ink-850 px-3 py-2 shadow-popover text-xs">
      <p className="font-medium">{d.name}</p>
      <p className="ledger-num text-ledger-light-secondary dark:text-ledger-dark-secondary">
        ₹{d.value.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

export default function CategoryDonut({ data, label = 'total' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-center px-6">
        <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          No categorized spending yet — add or import some expenses to see a breakdown.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center -mt-2">
          <p className="ledger-num text-xl font-semibold">₹{Math.round(total / 1000)}k</p>
          <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">{label}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-ledger-light-secondary dark:text-ledger-dark-secondary truncate">
              {d.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
