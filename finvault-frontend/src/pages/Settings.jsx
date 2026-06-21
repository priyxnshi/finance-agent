import React from 'react'
import { Sun, Moon, Bell, Shield, Database } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-vault' : 'bg-ink-950/15 dark:bg-white/15'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function Row({ icon: Icon, title, description, control }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-8 w-8 rounded-md bg-ink-950/[0.04] dark:bg-white/[0.06] grid place-items-center shrink-0">
          <Icon size={15} className="text-ledger-light-secondary dark:text-ledger-dark-secondary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">{description}</p>
        </div>
      </div>
      {control}
    </div>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = React.useState(true)
  const [weeklyDigest, setWeeklyDigest] = React.useState(false)
  const [shareForFL, setShareForFL] = React.useState(true)

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <div className="flex items-center gap-4 mb-1">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-vault to-vault-dim grid place-items-center text-ink-950 font-display font-semibold text-lg">
            PR
          </div>
          <div>
            <h3 className="font-display font-semibold tracking-tight">Pri</h3>
            <p className="text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">Owner · Lucknow, IN</p>
          </div>
          <Button variant="secondary" className="ml-auto">Edit Profile</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Appearance</h3>
        <div className="divide-y divide-line-light dark:divide-line">
          <Row
            icon={theme === 'dark' ? Moon : Sun}
            title="Theme"
            description="Switch between light and dark mode"
            control={
              <div className="flex items-center gap-2 text-xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
              </div>
            }
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Notifications</h3>
        <div className="divide-y divide-line-light dark:divide-line">
          <Row
            icon={Bell}
            title="Push notifications"
            description="Get notified about unusual spending and goal milestones"
            control={<Toggle checked={notifications} onChange={() => setNotifications((v) => !v)} />}
          />
          <Row
            icon={Bell}
            title="Weekly digest"
            description="A Sunday summary of spending, savings and goal progress"
            control={<Toggle checked={weeklyDigest} onChange={() => setWeeklyDigest((v) => !v)} />}
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Privacy &amp; Data</h3>
        <div className="divide-y divide-line-light dark:divide-line">
          <Row
            icon={Shield}
            title="Local-first storage"
            description="Your data stays on this device unless federated learning is enabled"
            control={
              <span className="text-2xs px-2 py-0.5 rounded-full bg-signal-green/10 text-signal-green font-medium">
                Active
              </span>
            }
          />
          <Row
            icon={Database}
            title="Contribute to federated learning"
            description="Share model updates (not raw data) to improve the shared categorizer"
            control={<Toggle checked={shareForFL} onChange={() => setShareForFL((v) => !v)} />}
          />
        </div>
      </Card>

      <Card accent="red" className="border-line-light dark:border-line">
        <h3 className="font-display font-semibold text-sm tracking-tight mb-1">Danger Zone</h3>
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-ledger-light-secondary dark:text-ledger-dark-secondary max-w-sm">
            Permanently delete your account and all locally stored financial data.
          </p>
          <Button variant="secondary" className="border-signal-red/40 text-signal-red hover:bg-signal-red/10 shrink-0">
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  )
}
