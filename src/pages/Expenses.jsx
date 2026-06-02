import { useState, useEffect, useRef } from 'react'
import { expenseApi, analysisApi } from '../services/api'
import { S, MetricCard, SectionLabel, Pill } from '../components/layout/UIKit'

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Utilities',
  'Entertainment', 'Health', 'Education', 'Groceries', 'Other',
]

function ExpenseForm({ onCreated }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ amount: '', description: '', date: today, category: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.amount || !form.description || !form.date) {
      setError('Amount, description and date are required.')
      return
    }
    setLoading(true)
    try {
      await expenseApi.create({
        amount:      parseFloat(form.amount),
        description: form.description,
        date:        form.date,
        category:    form.category || undefined,
      })
      setForm({ amount: '', description: '', date: today, category: '' })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add expense.')
    }
    setLoading(false)
  }

  const inp = {
    padding: '9px 12px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 13, color: 'var(--text)',
    background: 'var(--surface)', outline: 'none',
    fontFamily: 'inherit', width: '100%', transition: 'border-color .15s',
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>Add expense</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>Amount (₹)</div>
            <input style={inp} type="number" placeholder="0.00" min="0" step="0.01"
              value={form.amount} onChange={e => set('amount', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>Description</div>
            <input style={inp} type="text" placeholder="e.g. Zomato dinner"
              value={form.description} onChange={e => set('description', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>Date</div>
            <input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--text)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>Category (optional)</div>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Auto-detect</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 6, padding: '8px 12px', marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          padding: '9px 20px', background: 'var(--text)', color: 'var(--bg)',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          fontFamily: 'inherit', transition: 'opacity .15s',
        }}>
          {loading ? 'Adding…' : 'Add expense'}
        </button>
      </form>
    </div>
  )
}

function CSVUpload({ onUploaded }) {
  const ref = useRef()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const res = await expenseApi.uploadCSV(file)
      setResult({ success: true, ...res })
      onUploaded()
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.detail || 'Upload failed.' })
    }
    setLoading(false)
    e.target.value = ''
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Import CSV</div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14 }}>
        Required columns: <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4 }}>date</code>{' '}
        <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4 }}>amount</code>{' '}
        <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4 }}>description</code>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => ref.current.click()} disabled={loading} style={{
          padding: '8px 16px', border: '1px solid var(--border)',
          borderRadius: 8, background: 'var(--surface2)', color: 'var(--text)',
          fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {loading ? 'Uploading…' : '↑ Choose CSV file'}
        </button>
        <input ref={ref} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />

        {result && (
          <div style={{ fontSize: 12, color: result.success ? 'var(--green)' : 'var(--red)' }}>
            {result.success ? `✓ Imported ${result.created} expenses` : `✗ ${result.message}`}
            {result.success && result.errors?.length > 0 && ` (${result.errors.length} rows skipped)`}
          </div>
        )}
      </div>
    </div>
  )
}

function ExpenseRow({ expense, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Delete this expense?')) return
    setDeleting(true)
    try {
      await expenseApi.delete(expense.id)
      onDelete(expense.id)
    } catch {
      setDeleting(false)
    }
  }

  const CAT_COLORS = {
    Food: '#92400E', Transport: '#1E40AF', Shopping: '#6B21A8',
    Utilities: '#065F46', Entertainment: '#9D174D', Health: '#14532D',
    Education: '#1E3A5F', Groceries: '#713F12', Other: '#374151',
  }
  const bg = CAT_COLORS[expense.category] || '#374151'

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{expense.description}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{expense.date}</div>
      </div>
      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: bg + '22', color: bg, border: `1px solid ${bg}44` }}>
        {expense.category}
      </span>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 80, textAlign: 'right' }}>
        ₹{expense.amount.toLocaleString()}
      </div>
      <button onClick={handleDelete} disabled={deleting} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text3)', fontSize: 16, padding: '2px 6px',
        borderRadius: 4, transition: 'color .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
      >
        ×
      </button>
    </div>
  )
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary]   = useState(null)
  const [loading, setLoading]   = useState(true)

  async function loadData() {
    try {
      const [exps, sum] = await Promise.all([
        expenseApi.list({ limit: 100 }),
        analysisApi.summary(),
      ])
      setExpenses(exps)
      setSummary(sum)
    } catch (err) {
      console.error('Failed to load expenses:', err)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function handleDelete(id) {
    setExpenses(prev => prev.filter(e => e.id !== id))
    loadData()
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={S.pageTitle}>Expenses</div>
        <div style={S.pageSub}>Track and manage your spending</div>
      </div>

      {/* Summary cards */}
      <div style={S.metricsGrid}>
        <MetricCard
          label="This month"
          value={summary ? `₹${summary.total_this_month.toLocaleString()}` : '—'}
          foot={summary ? <><Pill type={summary.change_pct >= 0 ? 'dn' : 'up'}>{summary.change_pct >= 0 ? '↑' : '↓'} {Math.abs(summary.change_pct)}%</Pill> vs last month</> : '—'}
        />
        <MetricCard
          label="Last month"
          value={summary ? `₹${summary.total_last_month.toLocaleString()}` : '—'}
          foot={<><Pill type="nt">previous</Pill></>}
        />
        <MetricCard
          label="Avg daily"
          value={summary ? `₹${summary.avg_daily.toLocaleString()}` : '—'}
          foot={<><Pill type="nt">this month</Pill></>}
        />
        <MetricCard
          label="Transactions"
          value={summary ? summary.transaction_count : '—'}
          foot={<><Pill type="nt">this month</Pill></>}
        />
      </div>

      {/* Add form */}
      <SectionLabel>Add expense</SectionLabel>
      <ExpenseForm onCreated={loadData} />

      {/* CSV upload */}
      <SectionLabel>Import from bank CSV</SectionLabel>
      <CSVUpload onUploaded={loadData} />

      {/* Expense list */}
      <SectionLabel>Recent expenses</SectionLabel>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0 22px' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Loading…</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No expenses yet. Add one above or import a CSV.
          </div>
        ) : (
          expenses.map(e => (
            <ExpenseRow key={e.id} expense={e} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  )
}
