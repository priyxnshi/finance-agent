import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Expenses from './pages/Expenses.jsx'
import Goals from './pages/Goals.jsx'
import Insights from './pages/Insights.jsx'
import FederatedLearning from './pages/FederatedLearning.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/federated-learning" element={<FederatedLearning />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
