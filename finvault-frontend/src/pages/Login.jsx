import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Vault, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'

/**
 * Login page. There is no auth backend yet — submitting validates the form
 * client-side, simulates a short request, then drops the person into /app.
 * Swap the setTimeout in handleSubmit for a real POST /auth/login call once
 * authentication exists on the backend.
 */
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address'
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    setTimeout(() => {
      navigate('/app')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-grid bg-radial-glow flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-vault grid place-items-center">
            <Vault size={16} className="text-ink-950" strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight text-ledger-dark-primary">
            Finvault
          </span>
        </Link>

        <div className="rounded-card border border-white/10 bg-ink-900 shadow-panel p-7">
          <h1 className="font-display font-semibold text-xl tracking-tight text-ledger-dark-primary text-center">
            Welcome back
          </h1>
          <p className="text-sm text-ledger-dark-secondary text-center mt-1.5">
            Log in to your finance agent.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ledger-dark-secondary mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-dark-tertiary" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full h-10 pl-9 pr-3 rounded-md text-sm bg-ink-850 border ${
                    errors.email ? 'border-signal-red/60' : 'border-white/10'
                  } text-ledger-dark-primary placeholder:text-ledger-dark-tertiary focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition`}
                />
              </div>
              {errors.email && <p className="text-2xs text-signal-red mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ledger-dark-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-dark-tertiary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-10 pl-9 pr-9 rounded-md text-sm bg-ink-850 border ${
                    errors.password ? 'border-signal-red/60' : 'border-white/10'
                  } text-ledger-dark-primary placeholder:text-ledger-dark-tertiary focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ledger-dark-tertiary hover:text-ledger-dark-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-2xs text-signal-red mt-1.5">{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 text-xs text-ledger-dark-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-white/20 bg-ink-850 accent-vault"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold
                bg-vault text-ink-950 hover:bg-vault-light transition-all duration-150
                disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Signing in…
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <p className="text-2xs text-ledger-dark-tertiary text-center mt-5 leading-relaxed">
            Authentication isn't wired to a backend yet — any valid email and a 6+ character
            password will sign you into the demo dashboard.
          </p>
        </div>

        <div className="flex items-center justify-between mt-6 text-xs">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-ledger-dark-tertiary hover:text-ledger-dark-secondary transition-colors"
          >
            <ArrowLeft size={13} /> Back to home
          </Link>
          <Link to="/app" className="text-vault hover:text-vault-light transition-colors font-medium">
            Continue without an account →
          </Link>
        </div>
      </div>
    </div>
  )
}
