// Deterministic heatmap cells (no randomness on re-render)
function genCells() {
  return Array.from({ length: 364 }, (_, i) => {
    const x = Math.sin(i * 9301 + 49297) * 233280
    const r = x - Math.floor(x)
    return r < 0.38 ? 0 : r < 0.62 ? 1 : r < 0.78 ? 2 : r < 0.90 ? 3 : 4
  })
}
const CELLS = genCells()

const HMAP_L = ['#EEECEA','#D0CEC8','#9B9890','#55534C','#1A1917']
const HMAP_D = ['#2E2D29','#383630','#55534C','#9B9890','#C4C0B4']
const MONTH_NAMES = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const DAY_AVG = [980,1050,920,1100,1580,2200,1900]
const DOW_MAX = Math.max(...DAY_AVG)

// ── Bar chart — accepts real monthly_trend array from API ────────────────────
export function BarChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>
        No data yet — add expenses to see your trend.
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.total), 1)

  return (
    <div>
      <div style={{ height: 130, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, height: '100%', justifyContent: 'flex-end' }}>
            <div
              title={`₹${d.total.toLocaleString()}`}
              style={{
                width: '70%', borderRadius: '2px 2px 0 0',
                height: `${Math.max(Math.round(d.total / max * 100), 2)}%`,
                background: 'var(--text)', transition: 'opacity .15s', cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.6'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>
            {d.month?.slice(5) ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Category chart — accepts real category_breakdown array from API ──────────
export function CategoryChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div style={{ color: 'var(--text3)', fontSize: 12, padding: '24px 0', textAlign: 'center' }}>
        No expenses this month yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {data.map(c => (
        <div key={c.category} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{c.category}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>₹{c.total.toLocaleString()}</span>
          </div>
          <div style={{ height: 2, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${c.pct}%`, background: 'var(--text)', borderRadius: 2 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Heatmap — deterministic, no real data needed yet (Phase 3 upgrade) ───────
export function HeatmapChart() {
  const ints = HMAP_L  // dark mode toggle handled by CSS vars in parent

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {MONTH_NAMES.map(m => (
            <div key={m} style={{ flex: 1, minWidth: 28, fontSize: 9, color: 'var(--text3)' }}>{m}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>
          <span>Less</span>
          {ints.map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: 1, background: c }} />)}
          <span>More</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, minmax(0,1fr))', gap: 2 }}>
        {CELLS.map((v, i) => (
          <div key={i} style={{
            aspectRatio: '1', borderRadius: 1, background: ints[v],
            cursor: 'default', transition: 'opacity .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.55'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          />
        ))}
      </div>
    </div>
  )
}

// ── Day-of-week chart ─────────────────────────────────────────────────────────
export function DowChart() {
  return (
    <div>
      <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 16 }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            flex: 1, borderRadius: '2px 2px 0 0',
            height: `${Math.round(DAY_AVG[i] / DOW_MAX * 100)}%`,
            background: i >= 4 ? 'var(--text)' : 'var(--border2)',
            transition: 'opacity .15s', cursor: 'default',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.6'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ flex: 1, fontSize: 9, color: 'var(--text3)', textAlign: 'center' }}>{d}</div>
        ))}
      </div>
    </div>
  )
}
