import React from 'react'
import { Menu, Sun, Moon, Bell, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function Topbar({ onMenuClick, onAddExpenseClick, title }) {
  const { theme, toggleTheme } = useTheme()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [notificationsList, setNotificationsList] = React.useState([])
  const dropdownRef = React.useRef(null)

  React.useEffect(() => {
    import('../../services/api.js').then(({ getAgentRecommendations }) => {
      getAgentRecommendations()
        .then((data) => {
          if (data && data.recommendations) {
            setNotificationsList(data.recommendations)
          }
        })
        .catch((err) => console.error('Error fetching notifications:', err))
    })
  }, [])
  
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-9 w-9 grid place-items-center rounded-md border border-line-light dark:border-line relative
                text-ledger-light-secondary dark:text-ledger-dark-secondary hover:text-vault hover:border-vault/40 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {notificationsList.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal-red" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-md border border-line-light dark:border-line bg-paper-raised dark:bg-ink-850 shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="px-3.5 py-2.5 border-b border-line-light dark:border-line flex items-center justify-between">
                  <span className="text-xs font-semibold">Active Recommendations</span>
                  <span className="text-3xs px-2 py-0.5 rounded-full bg-vault/10 text-vault">
                    {notificationsList.length} total
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-line-light dark:divide-line">
                  {notificationsList.length > 0 ? (
                    notificationsList.map((rec) => (
                      <div key={rec.id} className="p-3 text-2xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <p className="font-semibold text-ledger-light-primary dark:text-ledger-dark-primary flex items-center gap-1.5">
                          {rec.severity === 'critical' ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-signal-red shrink-0" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-signal-amber shrink-0" />
                          )}
                          {rec.title}
                        </p>
                        <p className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-1 leading-normal">
                          {rec.body}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-3xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                      No active alerts. All cash flows normal!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
