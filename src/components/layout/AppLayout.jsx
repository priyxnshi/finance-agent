import { useThemeStore } from '../../store/themeStore'
import Navbar from './Navbar'

export default function AppLayout({ children }) {
  const dark = useThemeStore(s => s.dark)

  return (
    <div
      className={dark ? 'dark-mode' : ''}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <Navbar />
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 28px' }}>
        {children}
      </main>
    </div>
  )
}
