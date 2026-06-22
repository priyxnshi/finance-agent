import React, { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, Download, ArrowUpRight, ArrowDownRight, Upload, X } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import CategoryBarChart from '../components/ui/CategoryBarChart.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import { getExpenses, getAnalyticsSummary, getAnalyticsCategories, uploadCSV } from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

const categoryTone = {
  Housing: 'blue', 'Food & Dining': 'green', Transport: 'vault',
  Subscriptions: 'amber', Shopping: 'red', Travel: 'blue',
  Investment: 'vault', Income: 'green', Other: 'neutral',
}
const statusTone = { Cleared: 'green', Pending: 'amber' }

function fmt(n) { return `\u20B9${Math.abs(Math.round(n)).toLocaleString('en-IN')}` }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [exps, sum, cats] = await Promise.all([
        getExpenses({ limit: 100 }),
        getAnalyticsSummary(),
        getAnalyticsCategories(),
      ])
      setExpenses(exps)
      setSummary(sum)
      setCategories(withCategoryColors(cats.categories))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    try {
      const result = await uploadCSV(file)
      setUploadResult(result)
      fetchAll()
    } catch (err) {
      setUploadResult({ error: err.message })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const filtered = expenses.filter((t) =>
    t.description?.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {loading && <LoadingState label="Loading expenses…" />}
      {!loading && error && <ErrorState message={error} onRetry={fetchAll} />}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard label="Total Spending" value={summary ? fmt(summary.total_spending) : '—'}
              delta={`${expenses.length} transactions`} deltaTone="neutral" accent="red" />
            <MetricCard label="This Month" value={summary ? fmt(summary.monthly_spending) : '—'}
              delta="Month-to-date" deltaTone="neutral" accent="vault" />
            <MetricCard label="Top Category" value={summary?.top_category ?? '—'}
              delta={summary?.top_category ? fmt(summary.top_category_amount) : 'No data'} deltaTone="neutral" accent="blue" />
          </div>

          {/* Category bar chart */}
          {categories.length > 0 && (
            <Card accent="blue">
              <h3 className="font-display font-semibold text-sm tracking-tight mb-4">Spending by Category</h3>
              <CategoryBarChart data={categories} />
            </Card>
          )}

          {/* CSV upload result */}
          {uploadResult && (
            <div className={`rounded-card border px-4 py-3 text-sm flex items-start justify-between gap-4 ${
              uploadResult.error
                ? 'border-signal-red/30 bg-signal-red/[0.06] text-signal-red'
                : 'border-signal-green/30 bg-signal-green/[0.06] text-signal-green'
            }`}>
              <span>
                {uploadResult.error
                  ? `Upload failed: ${uploadResult.error}`
                  : `Imported ${uploadResult.imported_count} rows${uploadResult.failed_count > 0 ? `, ${uploadResult.failed_count} skipped` : ''}.`
                }
              </span>
              <button onClick={() => setUploadResult(null)}><X size={14} /></button>
            </div>
          )}

          {/* Transaction table */}
          <Card padded={false}>
            <div className="p-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-semibold text-sm tracking-tight">Transactions</h3>
                <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
                  Live from your local database
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="h-9 pl-8 pr-3 rounded-md text-sm bg-paper dark:bg-ink-850 border border-line-light dark:border-line w-36
                      focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition"
                  />
                </div>
                <label className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium cursor-pointer
                  border border-line-light dark:border-line bg-transparent
                  text-ledger-light-primary dark:text-ledger-dark-primary hover:bg-ink-950/[0.04] dark:hover:bg-white/[0.05] transition
                  ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <Upload size={14} /> {uploading ? 'Uploading…' : 'Import CSV'}
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-line-light dark:border-line text-2xs uppercase tracking-wider text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                    <th className="text-left font-medium px-5 py-2.5">Description</th>
                    <th className="text-left font-medium px-5 py-2.5">Category</th>
                    <th className="text-left font-medium px-5 py-2.5">Date</th>
                    <th className="text-right font-medium px-5 py-2.5">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-line-light dark:border-line last:border-0 hover:bg-ink-950/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-md bg-ink-950/[0.04] dark:bg-white/[0.06] grid place-items-center shrink-0">
                            <ArrowDownRight size={13} className="text-signal-red" />
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[160px]">{t.description || '—'}</p>
                            <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">ID {t.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={categoryTone[t.category] ?? 'neutral'}>{t.category}</Badge>
                      </td>
                      <td className="px-5 py-3 text-ledger-light-secondary dark:text-ledger-dark-secondary">{t.date}</td>
                      <td className="px-5 py-3 text-right ledger-num font-medium text-signal-red">
                        -{fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                        {expenses.length === 0 ? 'No expenses yet — add one or import a CSV.' : `No results for "${query}".`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
              Showing {filtered.length} of {expenses.length} transactions
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
