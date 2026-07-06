import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { AddExpenseForm } from '../../pages/Expenses.jsx'

const titles = {
  '/app': 'Dashboard',
  '/app/expenses': 'Expenses',
  '/app/goals': 'Goals',
  '/app/insights': 'Insights',
  '/app/federated-learning': 'Federated Learning',
  '/app/settings': 'Settings',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showGlobalAddModal, setShowGlobalAddModal] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Finvault'

  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onAddExpenseClick={() => setShowGlobalAddModal(true)}
          title={title}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Add Expense Modal */}
      {showGlobalAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-paper dark:bg-ink-900 border border-line-light dark:border-white/10 rounded-card shadow-2xl">
            <AddExpenseForm
              onCreated={(newExp) => {
                setShowGlobalAddModal(false)
                window.location.reload()
              }}
              onCancel={() => setShowGlobalAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
