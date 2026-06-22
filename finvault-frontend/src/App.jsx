import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expenses from './pages/Expenses.jsx'
import Goals from './pages/Goals.jsx'
import Insights from './pages/Insights.jsx'
import FederatedLearning from './pages/FederatedLearning.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public marketing site */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Authenticated app shell — Sidebar + Topbar + theme toggle live here */}
      <Route path="/app" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="goals" element={<Goals />} />
        <Route path="insights" element={<Insights />} />
        <Route path="federated-learning" element={<FederatedLearning />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
