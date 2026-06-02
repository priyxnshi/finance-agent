import { useState, useEffect } from 'react'
import { goalApi } from '../services/api'
import { S, MetricCard, SectionLabel, Pill, GoalCard, Card } from '../components/layout/UIKit'

function GoalForm({ onCreated }) {
  const today = new Date().toISOString().split('T')[0]
  const sixMonths = new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0]
  const [form, setForm] = useState({ name: '', target_amount: '', saved_amount: '', target_date: sixMonths })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const inp = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 13, color: 'var(--text)', background: 'var(--surface)',
    outline: 'none', fontFamily: 'inherit', width: '100%', transition: 'border-color .15s',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.target_amount || !form.target_date) {
      setError('Name, target amount and date are required.')
      return
    }
    setLoading(true)
    try {
      await goalApi.create({
        name:          form.name,
        target_amount: parseFloat(form.target_amount),
        saved_amount:  parseFloat(form.saved_amount || 0),
        target_date:   form.target_date,
      })
      setForm({ name: '', target_amount: '', saved_amount: '', target_date: sixMonths })
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create goal.')
    }
    setLoading(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 8,
      background: 'var(--surface)', color: 'var(--text)', fontSize: 13,
      fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14,
    }}>
      + Add new goal
    </button>
  )

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>New goal</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { label: 'Goal name', field: 'name', type: 'text', placeholder: 'Emergency fund' },
            { label: 'Target (₹)', field: 'target_amount', type: 'number', placeholder: '100000' },
            { label: 'Already saved (₹)', field: 'saved_amount', type: 'number', placeholder: '0' },
            { label: 'Target date', field: 'target_date', type: 'date', placeholder: '' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>{label}</div>
              <input style={inp} type={type} placeholder={placeholder}
                value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>
        {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{
            padding: '9px 20px', background: 'var(--text)', color: 'var(--bg)',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {loading ? 'Creating…' : 'Create goal'}
          </button>
          <button type="button" onClick={() => setOpen(false)} style={{
            padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 8,
            background: 'transparent', color: 'var(--text2)', fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Goals() {
  const [goals,   setGoals]   = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setGoals(await goalApi.list())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this goal?')) return
    await goalApi.delete(id)
    load()
  }

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const totalSaved  = goals.reduce((s, g) => s + g.saved_amount,  0)
  const onTrack     = goals.filter(g => g.status === 'active' && (g.progress_pct ?? 0) >= 30).length
  const monthly     = goals.reduce((s, g) => s + (g.monthly_target || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={S.pageTitle}>Goals</div>
        <div style={S.pageSub}>Track your savings targets and financial milestones</div>
      </div>

      <div style={S.metricsGrid}>
        <MetricCard label="Active goals"       value={goals.length} foot={<><Pill type="nt">total</Pill></>} />
        <MetricCard label="Total target"       value={`₹${totalTarget.toLocaleString()}`} foot={<><Pill type="nt">across all goals</Pill></>} />
        <MetricCard label="Total saved"        value={`₹${totalSaved.toLocaleString()}`}  foot={<><Pill type="up">{totalTarget > 0 ? Math.round(totalSaved/totalTarget*100) : 0}%</Pill> progress</>} />
        <MetricCard label="Monthly allocation" value={`₹${monthly.toLocaleString()}`}      foot={<><Pill type="nt">combined target</Pill></>} />
      </div>

      <SectionLabel>Your goals</SectionLabel>
      <GoalForm onCreated={load} />

      {loading ? (
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading…</div>
      ) : goals.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
            No goals yet. Create your first one above.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {goals.map(g => (
            <div key={g.id} style={{ position: 'relative' }}>
              <GoalCard {...g} expanded />
              <button onClick={() => handleDelete(g.id)} style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', fontSize: 16, padding: '2px 6px', borderRadius: 4,
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
