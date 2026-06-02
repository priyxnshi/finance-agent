// Shared style tokens
export const S = {
  pageTitle: { fontSize: 24, fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1.2 },
  pageSub: { fontSize: 13, color: 'var(--text2)', marginTop: 3 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, marginBottom: 32 },
  sLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 },
}

export function SectionLabel({ children }) {
  return <div style={S.sLabel}>{children}</div>
}

export function MetricCard({ label, value, foot }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px 16px', transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 7, display: 'flex', alignItems: 'center', gap: 5 }}>{foot}</div>
    </div>
  )
}

export function Pill({ type = 'nt', children }) {
  const map = {
    up:   { background: 'var(--green-bg)', color: 'var(--green)' },
    dn:   { background: 'var(--red-bg)',   color: 'var(--red)'   },
    nt:   { background: 'var(--surface2)', color: 'var(--text2)' },
    warn: { background: 'var(--amber-bg)', color: 'var(--amber)' },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, ...map[type] }}>
      {children}
    </span>
  )
}

export function Card({ title, sub, children, style = {} }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, ...style }}>
      {title && <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: sub ? 1 : 16 }}>{title}</div>}
      {sub && <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 18 }}>{sub}</div>}
      {children}
    </div>
  )
}

export function InsightCard({ icon, type, text, meta }) {
  const iconStyle = {
    warn: { background: 'var(--amber-bg)', color: 'var(--amber)' },
    good: { background: 'var(--green-bg)', color: 'var(--green)' },
    info: { background: 'var(--blue-bg)',  color: 'var(--blue)'  },
    bad:  { background: 'var(--red-bg)',   color: 'var(--red)'   },
  }
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 15px', display: 'flex', gap: 11, alignItems: 'flex-start', transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, ...iconStyle[type] }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55 }}>{text}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{meta}</div>
      </div>
    </div>
  )
}

export function GoalCard({ name, sub, saved, target, monthly, prob, status, expanded }) {
  const pct = Math.round(saved / target * 100)
  const isRisk = status === 'risk'
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1, marginBottom: expanded ? 4 : 16 }}>{sub}</div>
        </div>
        <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: isRisk ? 'var(--amber-bg)' : 'var(--green-bg)', color: isRisk ? 'var(--amber)' : 'var(--green)' }}>
          {isRisk ? 'At risk' : 'On track'}
        </span>
      </div>
      {expanded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>{pct}% complete</span>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>₹{(target - saved).toLocaleString()} remaining</span>
        </div>
      )}
      <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--text)', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
        {[['Saved', `₹${saved.toLocaleString()}`], ['Monthly', `₹${monthly.toLocaleString()}`], ['Probability', `${prob}%`]].map(([l, v], i) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2, ...(i > 0 ? { borderLeft: '1px solid var(--border)', paddingLeft: 14 } : {}) }}>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text)' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
