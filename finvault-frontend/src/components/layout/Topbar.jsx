import React from 'react'
import { Menu, Search, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Topbar({ onMenuClick, title }) {
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

        <div className="hidden md:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-light-tertiary dark:text-ledger-dark-tertiary"
            />
            <input
              type="text"
              placeholder="Search transactions, goals…"
              className="w-full h-9 pl-9 pr-3 rounded-md text-sm bg-paper dark:bg-ink-850 border border-line-light dark:border-line
                placeholder:text-ledger-light-tertiary dark:placeholder:text-ledger-dark-tertiary
                focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
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
