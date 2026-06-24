import React from 'react'
import { Smartphone, Laptop, Tablet, ArrowDown, ShieldCheck, Globe2, Ban } from 'lucide-react'

const devices = [
  { icon: Smartphone, label: 'Device A' },
  { icon: Laptop, label: 'Device B' },
  { icon: Tablet, label: 'Device C' },
]

export default function Privacy() {
  return (
    <section id="privacy" className="border-t border-line-light dark:border-white/[0.06] py-24 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center text-ledger-light-primary dark:text-ledger-dark-primary">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-vault mb-3">Privacy</p>
          <h2 className="font-display font-semibold text-3xl sm:text-[2.25rem] tracking-tight leading-tight">
            Your financial data stays yours.
          </h2>
          <p className="mt-4 text-ledger-light-secondary dark:text-ledger-dark-secondary leading-relaxed max-w-md">
            Finvault uses Federated Learning to improve its AI models. Instead of sending your
            transactions to a central server, the model trains locally on your device. Only the
            resulting model update — a set of math, not your data — is shared and merged into the
            shared global model.
          </p>

          <ul className="mt-6 space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
              <ShieldCheck size={16} className="text-signal-green mt-0.5 shrink-0" />
              Raw transactions never leave your device.
            </li>
            <li className="flex items-start gap-2.5 text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
              <ShieldCheck size={16} className="text-signal-green mt-0.5 shrink-0" />
              The global model gets smarter from everyone, privately.
            </li>
            <li className="flex items-start gap-2.5 text-sm text-ledger-light-secondary dark:text-ledger-dark-secondary">
              <ShieldCheck size={16} className="text-signal-green mt-0.5 shrink-0" />
              You can opt out of sharing model updates at any time.
            </li>
          </ul>
        </div>

        <div className="rounded-card border border-line-light dark:border-white/10 bg-paper-raised dark:bg-ink-900 shadow-panel p-8 transition-colors duration-150">
          <div className="grid grid-cols-3 gap-4">
            {devices.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-md border border-line-light dark:border-white/10 bg-paper dark:bg-ink-850 grid place-items-center transition-colors duration-150">
                  <Icon size={20} className="text-signal-blue" />
                </div>
                <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5 my-5">
            <ArrowDown size={16} className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
            <span className="text-2xs text-vault font-medium">Model updates only</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 rounded-full bg-vault/10 border border-vault/30 grid place-items-center">
              <Globe2 size={22} className="text-vault" />
            </div>
            <p className="text-sm font-medium">Global Model</p>
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary text-center max-w-[220px]">
              Trained on patterns from many devices — never on raw financial data from any one of
              them.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-line-light dark:border-white/[0.06] flex items-center justify-center gap-2">
            <Ban size={13} className="text-signal-red" />
            <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">Never transfer raw financial data</span>
          </div>
        </div>
      </div>
    </section>
  )
}
