import React, { useState } from 'react'
import { Search, SlidersHorizontal, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import { transactions, categoryBreakdown } from '../data/mockData.js'

const categoryTone = {
  Housing: 'blue',
  'Food & Dining': 'green',
  Transport: 'vault',
  Subscriptions: 'amber',
  Shopping: 'red',
  Travel: 'blue',
  Investment: 'vault',
  Income: 'green',
  Other: 'neutral',
}

const statusTone = {
  Cleared: 'green',
  Pending: 'amber',
}

function formatAmount(amount) {
  const formatted = `₹${Math.abs(amount).toLocaleString('en-IN')}`
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

export default function Expenses() {
  const [query, setQuery] = useState('')

  const filtered = transactions.filter((t) =>
    t.merchant.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Total Outflow" value="₹50,100" delta="34 transactions" deltaTone="neutral" accent="red" />
        <MetricCard label="Total Inflow" value="₹1,42,000" delta="1 transaction" deltaTone="neutral" accent="green" />
        <MetricCard label="Top Category" value="Housing" delta="₹18,400 this month" deltaTone="neutral" accent="blue" />
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-sm tracking-tight">Recent Transactions</h3>
            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
              Sample data shown — real transactions sync once your accounts are connected.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-9 pl-8 pr-3 rounded-md text-sm bg-paper dark:bg-ink-850 border border-line-light dark:border-line w-40
                  focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition"
              />
            </div>
            <Button variant="secondary">
              <SlidersHorizontal size={14} /> Filter
            </Button>
            <Button variant="secondary">
              <Download size={14} /> Export
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-line-light dark:border-line text-2xs uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                <th className="text-left font-medium px-5 py-2.5">Merchant</th>
                <th className="text-left font-medium px-5 py-2.5">Category</th>
                <th className="text-left font-medium px-5 py-2.5">Date</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
                <th className="text-right font-medium px-5 py-2.5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-line-light dark:border-line last:border-0 hover:bg-ink-950/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-ink-950/[0.04] dark:bg-white/[0.06] grid place-items-center shrink-0">
                        {t.amount > 0 ? (
                          <ArrowUpRight size={13} className="text-signal-green" />
                        ) : (
                          <ArrowDownRight size={13} className="text-signal-red" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{t.merchant}</p>
                        <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">{t.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={categoryTone[t.category] ?? 'neutral'}>{t.category}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ledger-light-secondary dark:text-ledger-dark-secondary">
                    {t.date}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[t.status] ?? 'neutral'}>{t.status}</Badge>
                  </td>
                  <td
                    className={`px-5 py-3 text-right ledger-num font-medium ${
                      t.amount > 0 ? 'text-signal-green' : 'text-ledger-light-primary dark:text-ledger-dark-primary'
                    }`}
                  >
                    {formatAmount(t.amount)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                    No transactions match "{query}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 flex items-center justify-between text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
          <span>Showing {filtered.length} of {transactions.length} transactions</span>
          <span>{categoryBreakdown.length} categories tracked</span>
        </div>
      </Card>
    </div>
  )
}
