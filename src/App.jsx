import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Expenses   from './pages/Expenses'
import Analytics  from './pages/Analytics'
import Goals      from './pages/Goals'
import Insights   from './pages/Insights'
import Settings   from './pages/Settings'

export default function App() {
  const dark = useThemeStore(s => s.dark)

  return (
    <div className={dark ? 'dark-mode' : ''} style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/expenses"  element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/goals"     element={<ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>} />
          <Route path="/insights"  element={<ProtectedRoute><AppLayout><Insights /></AppLayout></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
