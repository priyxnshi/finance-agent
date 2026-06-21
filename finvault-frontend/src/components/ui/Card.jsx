import React from 'react'

const accentMap = {
  green: 'bg-signal-green',
  red: 'bg-signal-red',
  blue: 'bg-signal-blue',
  amber: 'bg-signal-amber',
  vault: 'bg-vault',
  none: 'bg-transparent',
}

export default function Card({ children, className = '', accent = 'none', padded = true }) {
  return (
    <div
      className={`relative rounded-card border border-line-light dark:border-line bg-paper-raised dark:bg-ink-900
        shadow-card dark:shadow-card-dark overflow-hidden ${padded ? 'p-5' : ''} ${className}`}
    >
      {accent !== 'none' && (
        <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentMap[accent]}`} />
      )}
      {children}
    </div>
  )
}
