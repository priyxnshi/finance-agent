import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Receipt,
  Target,
  Sparkles,
  Network,
  Settings as SettingsIcon,
  Vault,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/insights', label: 'Insights', icon: Sparkles },
  { to: '/federated-learning', label: 'Federated Learning', icon: Network },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 border-r border-line-light dark:border-line
        bg-paper-raised dark:bg-ink-900 flex flex-col transition-transform duration-200 ease-out
        lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-line-light dark:border-line">
          <div className="h-8 w-8 rounded-md bg-ink-950 dark:bg-vault flex items-center justify-center shrink-0">
            <Vault size={17} className="text-vault dark:text-ink-950" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-[15px] tracking-tight text-ledger-light-primary dark:text-ledger-dark-primary">
              Finvault
            </p>
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              Personal Finance Agent
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            Workspace
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-ink-950/5 dark:bg-white/5 text-ledger-light-primary dark:text-ledger-dark-primary'
                    : 'text-ledger-light-secondary dark:text-ledger-dark-secondary hover:bg-ink-950/[0.035] dark:hover:bg-white/[0.035] hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full transition-colors ${
                      isActive ? 'bg-vault' : 'bg-transparent'
                    }`}
                  />
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line-light dark:border-line">
          <div className="rounded-card border border-line-light dark:border-line p-3 bg-paper dark:bg-ink-850">
            <p className="text-2xs font-semibold uppercase tracking-wider text-vault mb-1">
              Build status
            </p>
            <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed">
              Phase 1 — UI shell complete. Live data connects in Phase 2.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
