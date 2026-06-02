import { useNavigate, useLocation } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'

const NAV_TABS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Expenses',  path: '/expenses'  },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Goals',     path: '/goals'     },
  { label: 'Insights',  path: '/insights'  },
  { label: 'Settings',  path: '/settings'  },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { dark, toggle } = useThemeStore()
  const user = useAuthStore(s => s.user)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'AK'

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      height: 54,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 36, cursor: 'pointer' }}
      >
        <div style={{
          width: 26, height: 26, background: 'var(--text)',
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
            stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1,11 4,7 7,9 12,2" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Finvault
        </span>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: 1, flex: 1 }}>
        {NAV_TABS.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                padding: '6px 13px',
                borderRadius: 6,
                border: 'none',
                background: active ? 'var(--surface2)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text2)',
                fontWeight: active ? 500 : 400,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all .15s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface2)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent' } }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            width: 30, height: 30, borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text2)', fontSize: 14, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          {dark ? '☀' : '◑'}
        </button>

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          style={{
            width: 30, height: 30, borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text2)', fontSize: 14, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          🔔
        </button>

        {/* Avatar */}
        <div
          onClick={() => navigate('/settings')}
          style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--surface3)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer',
          }}
        >
          {initials}
        </div>
      </div>
    </nav>
  )
}
