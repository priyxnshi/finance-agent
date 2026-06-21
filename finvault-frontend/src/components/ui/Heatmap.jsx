import React from 'react'

const levelColors = [
  'bg-ink-950/[0.04] dark:bg-white/[0.05]',
  'bg-vault/20',
  'bg-vault/45',
  'bg-vault/70',
  'bg-vault',
]

export default function Heatmap({ data }) {
  // group into weeks (columns) of 7 days
  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date} · intensity ${day.intensity}`}
                className={`h-[11px] w-[11px] rounded-[2px] ${levelColors[day.intensity]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
        <span>Less</span>
        {levelColors.map((c, i) => (
          <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
