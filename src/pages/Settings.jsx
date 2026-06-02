import { S, SectionLabel, Card } from '../components/layout/UIKit'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function Toggle({ label, on }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text)' }}>{label}</span>
      <div style={{ width: 30, height: 17, borderRadius: 9, background: on ? 'var(--green)' : 'var(--surface3)', cursor: 'pointer', position: 'relative', transition: '.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, [on ? 'right' : 'left']: 2, width: 13, height: 13, borderRadius: '50%', background: 'white', transition: '.2s' }} />
      </div>
    </div>
  )
}

export default function Settings() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={S.pageTitle}>Settings</div>
        <div style={S.pageSub}>Manage your account, privacy, and preferences</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, marginBottom: 40 }}>
        {/* Profile */}
        <Card title="Profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'AK'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{user?.name || 'Arjun Kumar'}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{user?.email || 'arjun@example.com'}</div>
            </div>
          </div>
          <Row label="Monthly budget" value="₹43,000" />
          <Row label="Currency" value="INR" />
          <Row label="Timezone" value="Asia/Kolkata" />
          <Row label="Member since" value="Jan 2024" />
          <button
            onClick={handleLogout}
            style={{ marginTop: 16, width: '100%', padding: '9px', border: '1px solid var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--red)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign out
          </button>
        </Card>

        {/* Federated learning */}
        <Card title="Federated learning">
          <Toggle label="Participate in federated learning" on={true} />
          <Toggle label="Share model updates" on={true} />
          <Toggle label="Differential privacy" on={true} />
          <Row label="Local training rounds" value="5 per session" />
          <Row label="Last sync" value="Today, 6:42 AM" />
        </Card>

        {/* Budget limits */}
        <Card title="Budget limits">
          {[
            ['Food & dining', '₹12,000'],
            ['Transport', '₹8,000'],
            ['Shopping', '₹10,000'],
            ['Entertainment', '₹5,000'],
            ['Utilities', '₹6,000'],
          ].map(([l, v]) => <Row key={l} label={l} value={v} />)}
        </Card>

        {/* Notifications */}
        <Card title="Notifications">
          <Toggle label="Overspending alerts" on={true} />
          <Toggle label="Weekly summary" on={true} />
          <Toggle label="Goal milestones" on={true} />
          <Toggle label="FL training complete" on={false} />
          <Toggle label="Unusual transactions" on={true} />
        </Card>
      </div>
    </div>
  )
}
