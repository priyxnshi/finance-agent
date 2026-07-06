import React from 'react'
import { Menu, Sun, Moon, Bell, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Topbar({ onMenuClick, onAddExpenseClick, title }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 shrink-0 border-b border-line-light dark:border-line bg-paper-raised/80 dark:bg-ink-900/80 backdrop-blur-md sticky top-0 z-20">
      <div className="h-full flex items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 grid place-items-center rounded-md border border-line-light dark:border-line text-ledger-light-secondary dark:text-ledger-dark-secondary"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <h1 className="font-display font-semibold text-lg tracking-tight truncate">
            {title}
          </h1>
        </div>



        <div className="flex items-center gap-2">
          <button
            onClick={onAddExpenseClick}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold
              bg-vault text-ink-950 hover:opacity-90 shadow-md transition"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Add Expense</span>
          </button>

          <button
            onClick={toggleTheme}
            className="h-9 w-9 grid place-items-center rounded-md border border-line-light dark:border-line
              text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-vault hover:border-vault/40 transition-colors"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="h-9 w-9 grid place-items-center rounded-md border border-line-light dark:border-line relative
              text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-vault hover:border-vault/40 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal-red" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-line-light dark:border-line">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-vault to-vault-dim grid place-items-center text-ink-950 text-xs font-semibold font-display">
              PR
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-medium">Pri</p>
              <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                Owner
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
