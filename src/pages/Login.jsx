import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    if (tab === 'signin') {
      if (email && password) {
        login({ name: 'Arjun Kumar', email })
        navigate('/dashboard')
      } else {
        setError('Please enter your email and password.')
      }
    } else {
      if (name && email && password) {
        login({ name, email })
        navigate('/dashboard')
      } else {
        setError('Please fill in all fields.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={styles.root}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <div style={styles.logoBox}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                stroke="#FAFAF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,11 4,7 7,9 13,2" />
              </svg>
            </div>
            <span style={styles.logoName}>Finvault</span>
          </div>

          <div style={styles.leftContent}>
            <div style={styles.tagline}>Your finances,<br />understood deeply.</div>
            <div style={styles.tagSub}>
              AI-powered spending analysis, federated learning privacy,
              and goal tracking — built for people who take money seriously.
            </div>

            <div style={styles.features}>
              {[
                { icon: '◈', text: 'Federated learning — your data never leaves your device' },
                { icon: '◉', text: 'AI agent that learns your spending habits over time' },
                { icon: '◎', text: 'Goal-based planning with probability forecasting' },
              ].map((f, i) => (
                <div key={i} style={styles.featureRow}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.leftFooter}>
            <span style={styles.footerText}>Trusted by 12,000+ users · SOC 2 compliant · DPDP ready</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formWrap}>
          {/* Tab switcher */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tabBtn, ...(tab === 'signin' ? styles.tabActive : {}) }}
              onClick={() => { setTab('signin'); setError('') }}
            >
              Sign in
            </button>
            <button
              style={{ ...styles.tabBtn, ...(tab === 'signup' ? styles.tabActive : {}) }}
              onClick={() => { setTab('signup'); setError('') }}
            >
              Create account
            </button>
          </div>

          <div style={styles.formTitle}>
            {tab === 'signin' ? 'Welcome back' : 'Get started'}
          </div>
          <div style={styles.formSub}>
            {tab === 'signin'
              ? 'Sign in to your Finvault account'
              : 'Create your account in seconds'}
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {tab === 'signup' && (
              <div style={styles.field}>
                <label style={styles.label}>Full name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Arjun Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#1A1917'}
                  onBlur={e => e.target.style.borderColor = '#E8E6E1'}
                />
              </div>
            )}
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="arjun@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#1A1917'}
                onBlur={e => e.target.style.borderColor = '#E8E6E1'}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder={tab === 'signup' ? 'Min. 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#1A1917'}
                onBlur={e => e.target.style.borderColor = '#E8E6E1'}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {tab === 'signin' && (
              <div style={{ textAlign: 'right', marginBottom: 4 }}>
                <span style={styles.link}>Forgot password?</span>
              </div>
            )}

            <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? 'Please wait…'
                : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.divLine} />
            <span style={styles.divText}>or continue with</span>
            <div style={styles.divLine} />
          </div>

          <div style={styles.oauthRow}>
            {['Google', 'Apple'].map(p => (
              <button key={p} style={styles.oauthBtn}>
                {p === 'Google'
                  ? <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                }
                {p}
              </button>
            ))}
          </div>

          <div style={styles.terms}>
            By continuing, you agree to Finvault's{' '}
            <span style={styles.link}>Terms of Service</span>{' '}
            and{' '}
            <span style={styles.link}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  left: {
    width: '44%', background: '#1A1917',
    display: 'flex', flexDirection: 'column',
    padding: '40px',
  },
  leftInner: { display: 'flex', flexDirection: 'column', height: '100%' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 28, height: 28, background: '#FAFAF8',
    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoName: { fontSize: 15, fontWeight: 600, color: '#F0EDE8', letterSpacing: '-0.02em' },
  leftContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 360 },
  tagline: {
    fontSize: 36, fontWeight: 600, color: '#F0EDE8',
    letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 18,
  },
  tagSub: { fontSize: 14, color: '#9B9890', lineHeight: 1.65, marginBottom: 40 },
  features: { display: 'flex', flexDirection: 'column', gap: 16 },
  featureRow: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  featureIcon: { fontSize: 14, color: '#F0EDE8', marginTop: 1, flexShrink: 0 },
  featureText: { fontSize: 13, color: '#9B9890', lineHeight: 1.5 },
  leftFooter: { paddingTop: 24, borderTop: '1px solid #2E2D29' },
  footerText: { fontSize: 11, color: '#55534C' },
  right: {
    flex: 1, background: '#FAFAF8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  formWrap: { width: '100%', maxWidth: 380 },
  tabs: {
    display: 'flex', gap: 2, background: '#EEECEA',
    borderRadius: 8, padding: 3, marginBottom: 28,
  },
  tabBtn: {
    flex: 1, padding: '7px 12px', borderRadius: 6,
    border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#6B6860',
    fontFamily: "'Inter', sans-serif", transition: 'all .15s',
  },
  tabActive: { background: '#FFFFFF', color: '#1A1917', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: 22, fontWeight: 600, letterSpacing: '-0.04em', color: '#1A1917', marginBottom: 4 },
  formSub: { fontSize: 13, color: '#6B6860', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: '#1A1917' },
  input: {
    padding: '10px 12px', border: '1px solid #E8E6E1',
    borderRadius: 8, fontSize: 13, color: '#1A1917',
    background: '#FFFFFF', outline: 'none', transition: 'border-color .15s',
    fontFamily: "'Inter', sans-serif",
  },
  error: {
    fontSize: 12, color: '#991B1B', background: '#FEF2F2',
    border: '1px solid #FECACA', borderRadius: 6, padding: '8px 12px',
  },
  link: { fontSize: 12, color: '#1A1917', textDecoration: 'underline', cursor: 'pointer' },
  submitBtn: {
    width: '100%', padding: '11px', background: '#1A1917',
    color: '#FAFAF8', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em',
    transition: 'opacity .15s', marginTop: 4,
  },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' },
  divLine: { flex: 1, height: 1, background: '#E8E6E1' },
  divText: { fontSize: 11, color: '#A8A69F', whiteSpace: 'nowrap' },
  oauthRow: { display: 'flex', gap: 8, marginBottom: 20 },
  oauthBtn: {
    flex: 1, padding: '9px 12px', border: '1px solid #E8E6E1',
    borderRadius: 8, background: '#FFFFFF', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, color: '#1A1917',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, fontFamily: "'Inter', sans-serif", transition: 'border-color .15s',
  },
  terms: { fontSize: 11, color: '#A8A69F', textAlign: 'center', lineHeight: 1.6 },
}
