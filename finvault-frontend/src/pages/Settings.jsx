import React from 'react'
import { Sun, Moon, Bell, Shield, Database, Send, MessageSquare } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { getTelegramSettings, updateTelegramSettings, testTelegramMessage } from '../services/api.js'

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

  const [botToken, setBotToken] = React.useState('')
  const [chatId, setChatId] = React.useState('')
  const [savingTelegram, setSavingTelegram] = React.useState(false)
  const [testingTelegram, setTestingTelegram] = React.useState(false)
  const [telegramStatus, setTelegramStatus] = React.useState('')

  React.useEffect(() => {
    getTelegramSettings()
      .then((data) => {
        if (data) {
          setBotToken(data.telegram_bot_token || '')
          setChatId(data.telegram_chat_id || '')
        }
      })
      .catch((err) => {
        console.error('Failed to load Telegram settings:', err)
      })
  }, [])

  async function handleSaveTelegramSettings() {
    setSavingTelegram(true)
    setTelegramStatus('')
    try {
      await updateTelegramSettings({
        telegram_bot_token: botToken,
        telegram_chat_id: chatId,
      })
      setTelegramStatus('Settings saved successfully! Backend service is reloading.')
    } catch (err) {
      setTelegramStatus(`Failed to save settings: ${err.message}`)
    } finally {
      setSavingTelegram(false)
    }
  }

  async function handleSendTestNotification() {
    setTestingTelegram(true)
    setTelegramStatus('')
    try {
      await testTelegramMessage()
      setTelegramStatus('Test notification sent successfully!')
    } catch (err) {
      setTelegramStatus(`Failed to send test: ${err.message}`)
    } finally {
      setTestingTelegram(false)
    }
  }

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
        <h3 className="font-display font-semibold text-sm tracking-tight mb-1 flex items-center gap-1.5">
          <MessageSquare size={16} className="text-vault" /> Telegram Bot Integration
        </h3>
        <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mb-3">
          Configure credentials to log expenses and receive alerts directly via Telegram.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Bot Token
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 123456:ABC-DEF..."
                className="w-full h-8 rounded-md border border-line-light dark:border-white/10 bg-paper dark:bg-ink-950 px-2.5 text-2xs focus:border-vault focus:ring-1 focus:ring-vault outline-none transition"
              />
            </div>
            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Chat ID
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. 987654321"
                className="w-full h-8 rounded-md border border-line-light dark:border-white/10 bg-paper dark:bg-ink-950 px-2.5 text-2xs focus:border-vault focus:ring-1 focus:ring-vault outline-none transition"
              />
            </div>
          </div>
          
          {telegramStatus && (
            <p className={`text-2xs font-medium ${telegramStatus.includes('Failed') ? 'text-signal-red' : 'text-signal-green'}`}>
              {telegramStatus}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              onClick={handleSaveTelegramSettings}
              disabled={savingTelegram}
              className="text-2xs py-1 px-2.5"
            >
              {savingTelegram ? 'Saving...' : 'Save Config'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSendTestNotification}
              disabled={testingTelegram}
              className="text-2xs py-1 px-2.5 border-vault/30 text-vault hover:bg-vault/5"
            >
              {testingTelegram ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
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
