import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Upload, X, Plus, Loader2, Mic, MicOff, Sparkles, FileText, Users, Check, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import MetricCard from '../components/ui/MetricCard.jsx'
import CategoryBarChart from '../components/ui/CategoryBarChart.jsx'
import CategorySuggestion from '../components/ui/CategorySuggestion.jsx'
import { LoadingState, ErrorState } from '../components/ui/LoadingError.jsx'
import {
  getExpenses,
  getAnalyticsSummary,
  getAnalyticsCategories,
  uploadCSV,
  createExpense,
  parseNaturalLanguageExpense,
} from '../services/api.js'
import { withCategoryColors } from '../utils/categoryColors.js'

const categoryTone = {
  Food: 'green', Travel: 'vault', Bills: 'blue',
  Shopping: 'amber', Entertainment: 'red',
  Housing: 'blue', Transport: 'vault',
  Subscriptions: 'amber', Income: 'green', Other: 'neutral',
}

const fmt = (n) => `\u20B9${Math.abs(Math.round(n)).toLocaleString('en-IN')}`

function AddExpenseForm({ onCreated, onCancel }) {
  const [activeTab, setActiveTab] = useState('traditional') // traditional, ai_parse, voice, splitwise

  // Core Form State
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // AI Parse Tab State
  const [aiText, setAiText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsedPreview, setParsedPreview] = useState(null)

  // Voice Tab State
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const recognitionRef = useRef(null)

  // Splitwise Tab State
  const [splitTotal, setSplitTotal] = useState('')
  const [splitDescription, setSplitDescription] = useState('')
  const [splitCategory, setSplitCategory] = useState('Food')
  const [splitDate, setSplitDate] = useState(new Date().toISOString().split('T')[0])
  const [splitFriends, setSplitFriends] = useState([
    { id: 1, name: 'Alice', selected: true },
    { id: 2, name: 'Bob', selected: true },
    { id: 3, name: 'Charlie', selected: false },
  ])

  const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Entertainment"]

  // Initializing Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
        setVoiceText('')
        setParsedPreview(null)
      }
      rec.onresult = async (event) => {
        const transcript = event.results[0][0].transcript
        setVoiceText(transcript)
        await handleAutoParse(transcript)
      }
      rec.onerror = (e) => {
        console.error(e)
        setIsListening(false)
      }
      rec.onend = () => {
        setIsListening(false)
      }
      recognitionRef.current = rec
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error(err)
      }
    } else {
      alert('Speech Recognition is not supported in this browser. Try Chrome/Edge.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  async function handleAutoParse(text) {
    if (!text.trim()) return
    setParsing(true)
    setErrors({})
    try {
      const res = await parseNaturalLanguageExpense(text)
      setParsedPreview(res)
    } catch (err) {
      setErrors({ parse: err.message })
    } finally {
      setParsing(false)
    }
  }

  function validate() {
    const e = {}
    if (!description.trim()) e.description = 'Required'
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) e.amount = 'Enter a positive amount'
    if (!category.trim()) e.category = 'Required — or click the AI suggestion'
    if (!date) e.date = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      const created = await createExpense({
        description: description.trim(),
        amount: parseFloat(amount),
        category: category.trim(),
        date,
      })
      onCreated(created)
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmParsed() {
    if (!parsedPreview || submitting) return
    setSubmitting(true)
    try {
      const created = await createExpense({
        description: parsedPreview.description,
        amount: parsedPreview.amount,
        category: parsedPreview.category,
        date: parsedPreview.date,
      })
      onCreated(created)
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSplitwiseSubmit(e) {
    e.preventDefault()
    const parsedTotal = parseFloat(splitTotal)
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setErrors({ split: 'Enter a valid total bill amount' })
      return
    }
    if (!splitDescription.trim()) {
      setErrors({ split: 'Enter a bill description' })
      return
    }

    const selectedFriends = splitFriends.filter(f => f.selected)
    const divisor = selectedFriends.length + 1 // friends + user
    const calculatedShare = Number((parsedTotal / divisor).toFixed(2))

    setSubmitting(true)
    try {
      const created = await createExpense({
        description: `${splitDescription.trim()} (Split Share via Splitwise)`,
        amount: calculatedShare,
        category: splitCategory,
        date: splitDate,
      })
      onCreated(created)
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFriend = (id) => {
    setSplitFriends(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f))
  }

  return (
    <div className="rounded-card border border-vault/30 bg-vault/[0.03] dark:bg-vault/[0.05] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-vault flex items-center gap-1.5">
          <Plus size={16} /> Add Expense
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary hover:text-ledger-light-primary dark:hover:text-ledger-dark-primary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line-light dark:border-line mb-2 overflow-x-auto">
        {[
          { id: 'traditional', label: 'Traditional', icon: FileText },
          { id: 'ai_parse', label: 'AI Parse', icon: Sparkles },
          { id: 'voice', label: 'Voice Input', icon: Mic },
          { id: 'splitwise', label: 'Splitwise Sim', icon: Users }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setErrors({})
              }}
              className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                active
                  ? 'border-vault text-vault'
                  : 'border-transparent text-ledger-light-tertiary dark:text-ledger-dark-tertiary hover:text-ledger-light-secondary dark:hover:text-ledger-dark-secondary'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {errors.server && (
        <p className="text-xs text-signal-red">{errors.server}</p>
      )}

      {/* Tab 1: Traditional */}
      {activeTab === 'traditional' && (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Swiggy dinner"
                className={fieldCls(errors.description)}
              />
              <CategorySuggestion
                description={description}
                onAccept={(cat) => setCategory(cat)}
              />
              {errors.description && <p className="text-2xs text-signal-red mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Amount (₹)
              </label>
              <input
                type="number" min="0.01" step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 480"
                className={fieldCls(errors.amount)}
              />
              {errors.amount && <p className="text-2xs text-signal-red mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={fieldCls(errors.category)}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-2xs text-signal-red mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldCls(errors.date)}
              />
              {errors.date && <p className="text-2xs text-signal-red mt-1">{errors.date}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-vault text-ink-950 px-4 py-2
                text-sm font-semibold hover:bg-vault-light transition disabled:opacity-60"
            >
              {submitting ? <><Loader2 size={13} className="animate-spin" /> Adding…</> : 'Add Expense'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: AI Parse */}
      {activeTab === 'ai_parse' && (
        <div className="space-y-3">
          <p className="text-2xs text-ledger-light-secondary dark:text-ledger-dark-secondary">
            Type your expense details naturally. (e.g. <i>"Spent ₹250 on lunch at Burger King yesterday"</i> or <i>"paid 1200 for rent today"</i>)
          </p>
          <div className="relative">
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="E.g., Spent 500 for dinner yesterday"
              className="w-full min-h-[70px] p-3 text-sm rounded-md border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-2 focus:ring-signal-blue/40"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => handleAutoParse(aiText)}
              disabled={parsing || !aiText.trim()}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-md bg-vault text-ink-950 font-semibold text-xs transition disabled:opacity-50"
            >
              {parsing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Parse Text
            </button>
          </div>
          {errors.parse && <p className="text-xs text-signal-red mt-1">{errors.parse}</p>}

          {/* Parsed Preview Card */}
          {parsedPreview && (
            <div className="mt-3 p-3 rounded-md bg-paper dark:bg-ink-900 border border-line-light dark:border-white/5 space-y-2 animate-fadeIn">
              <p className="text-2xs font-semibold text-ledger-light-secondary dark:text-ledger-dark-secondary uppercase tracking-wider">Parsed Result Preview (Click to Edit)</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Description</label>
                  <input
                    type="text"
                    value={parsedPreview.description}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, description: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  />
                </div>
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Amount (₹)</label>
                  <input
                    type="number"
                    value={parsedPreview.amount}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, amount: parseFloat(e.target.value) || '' })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  />
                </div>
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Category</label>
                  <select
                    value={parsedPreview.category}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, category: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Date</label>
                  <input
                    type="date"
                    value={parsedPreview.date}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, date: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmParsed}
                disabled={submitting || !parsedPreview.description || !parsedPreview.amount}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-signal-green text-ink-950 font-semibold text-xs hover:bg-signal-green/90 transition"
              >
                <Check size={12} /> Confirm & Save Expense
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Voice Input */}
      {activeTab === 'voice' && (
        <div className="space-y-4 py-2 flex flex-col items-center">
          <p className="text-2xs text-ledger-light-secondary dark:text-ledger-dark-secondary text-center max-w-[280px]">
            Click the microphone and speak naturally (e.g. <i>"Paid five hundred rupees for electric bill today"</i>)
          </p>

          <div className="relative flex items-center justify-center">
            {isListening && (
              <span className="absolute h-16 w-16 rounded-full bg-signal-red/20 animate-ping" />
            )}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-signal-red text-white'
                  : 'bg-vault text-ink-950 hover:bg-vault-light'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          <span className="text-xs font-medium text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
            {isListening ? "Listening... Speak now" : "Tap Mic to Start"}
          </span>

          {voiceText && (
            <div className="w-full text-center">
              <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary uppercase">Speech Transcript</p>
              <p className="text-sm italic font-medium text-ledger-light-primary dark:text-ledger-dark-primary mt-1 px-4">
                "{voiceText}"
              </p>
            </div>
          )}

          {errors.parse && <p className="text-xs text-signal-red mt-1">{errors.parse}</p>}

          {/* Parsed Preview Card */}
          {parsedPreview && (
            <div className="w-full p-3 rounded-md bg-paper dark:bg-ink-900 border border-line-light dark:border-white/5 space-y-2 text-left animate-fadeIn">
              <p className="text-2xs font-semibold text-ledger-light-secondary dark:text-ledger-dark-secondary uppercase tracking-wider">Parsed Result Preview (Click to Edit)</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Description</label>
                  <input
                    type="text"
                    value={parsedPreview.description}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, description: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  />
                </div>
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Amount (₹)</label>
                  <input
                    type="number"
                    value={parsedPreview.amount}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, amount: parseFloat(e.target.value) || '' })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  />
                </div>
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Category</label>
                  <select
                    value={parsedPreview.category}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, category: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-ledger-light-tertiary dark:text-ledger-dark-tertiary block mb-0.5 text-2xs">Date</label>
                  <input
                    type="date"
                    value={parsedPreview.date}
                    onChange={(e) => setParsedPreview({ ...parsedPreview, date: e.target.value })}
                    className="w-full h-8 px-2 rounded border border-line-light dark:border-line bg-paper dark:bg-ink-850 text-xs text-ledger-light-primary dark:text-ledger-dark-primary focus:outline-none focus:ring-1 focus:ring-signal-blue"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmParsed}
                disabled={submitting || !parsedPreview.description || !parsedPreview.amount}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-signal-green text-ink-950 font-semibold text-xs hover:bg-signal-green/90 transition"
              >
                <Check size={12} /> Confirm & Save Expense
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Splitwise Simulator */}
      {activeTab === 'splitwise' && (
        <form onSubmit={handleSplitwiseSubmit} className="space-y-3">
          <p className="text-2xs text-ledger-light-secondary dark:text-ledger-dark-secondary">
            Specify a group bill. We'll split it equally and add your personal share.
          </p>

          {errors.split && <p className="text-xs text-signal-red">{errors.split}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Total Bill Amount (₹)
              </label>
              <input
                type="number"
                value={splitTotal}
                onChange={(e) => setSplitTotal(e.target.value)}
                placeholder="e.g. 1500"
                className={fieldCls(null)}
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Bill Description
              </label>
              <input
                type="text"
                value={splitDescription}
                onChange={(e) => setSplitDescription(e.target.value)}
                placeholder="e.g. Team lunch"
                className={fieldCls(null)}
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Category
              </label>
              <select
                value={splitCategory}
                onChange={(e) => setSplitCategory(e.target.value)}
                className={fieldCls(null)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={splitDate}
                onChange={(e) => setSplitDate(e.target.value)}
                className={fieldCls(null)}
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-medium text-ledger-light-secondary dark:text-ledger-dark-secondary mb-1.5">
              Split with (Group Members)
            </label>
            <div className="flex gap-3 flex-wrap">
              {splitFriends.map(friend => (
                <label key={friend.id} className="flex items-center gap-1.5 text-xs text-ledger-light-primary dark:text-ledger-dark-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={friend.selected}
                    onChange={() => toggleFriend(friend.id)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-ink-850 accent-vault"
                  />
                  {friend.name}
                </label>
              ))}
            </div>
          </div>

          {splitTotal && parseFloat(splitTotal) > 0 && (
            <div className="p-3 rounded-md bg-vault/5 border border-vault/20 text-xs flex justify-between items-center animate-fadeIn">
              <span>
                Total shares: <strong>{splitFriends.filter(f => f.selected).length + 1} people</strong> (You + {splitFriends.filter(f => f.selected).map(f => f.name).join(', ') || 'No one'})
              </span>
              <span className="text-vault font-semibold">
                Your Share: ₹{(parseFloat(splitTotal) / (splitFriends.filter(f => f.selected).length + 1)).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting || !splitTotal || !splitDescription}
              className="inline-flex items-center gap-1.5 rounded-md bg-vault text-ink-950 px-4 py-2
                text-sm font-semibold hover:bg-vault-light transition disabled:opacity-60"
            >
              {submitting ? <><Loader2 size={13} className="animate-spin" /> Logging…</> : 'Log Split Expense'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function fieldCls(error) {
  return `w-full h-10 px-3 rounded-md text-sm border ${
    error ? 'border-signal-red/60' : 'border-line-light dark:border-line'
  } bg-paper dark:bg-ink-850 text-ledger-light-primary dark:text-ledger-dark-primary
  placeholder:text-ledger-light-tertiary dark:placeholder:text-ledger-dark-tertiary
  focus:outline-none focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition`
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

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

  function handleCreated(expense) {
    setExpenses((prev) => [expense, ...prev])
    setShowAddForm(false)
    // Refresh summary totals in background
    getAnalyticsSummary().then(setSummary).catch(() => {})
  }

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
    (t.description?.toLowerCase() ?? '').includes(query.toLowerCase()) ||
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
              delta={summary?.top_category ? fmt(summary.top_category_amount) : 'No data'}
              deltaTone="neutral" accent="blue" />
          </div>

          {/* Category bar chart */}
          {categories.length > 0 && (
            <Card accent="blue">
              <h3 className="font-display font-semibold text-sm tracking-tight mb-4">Spending by Category</h3>
              <CategoryBarChart data={categories} />
            </Card>
          )}

          {/* Add form */}
          {showAddForm && (
            <AddExpenseForm
              onCreated={handleCreated}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Upload result banner */}
          {uploadResult && (
            <div className={`rounded-card border px-4 py-3 text-sm flex items-start justify-between gap-4 ${
              uploadResult.error
                ? 'border-signal-red/30 bg-signal-red/[0.06] text-signal-red'
                : 'border-signal-green/30 bg-signal-green/[0.06] text-signal-green'
            }`}>
              <span>
                {uploadResult.error
                  ? `Upload failed: ${uploadResult.error}`
                  : `Imported ${uploadResult.imported_count} rows${
                      uploadResult.auto_categorized > 0
                        ? ` · ${uploadResult.auto_categorized} auto-categorized by AI`
                        : ''
                    }${uploadResult.failed_count > 0 ? ` · ${uploadResult.failed_count} skipped` : ''}.`
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
                  AI auto-categorizes new entries as you type
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="h-9 pl-8 pr-3 rounded-md text-sm bg-paper dark:bg-ink-850 border
                      border-line-light dark:border-line w-36 focus:outline-none
                      focus:ring-2 focus:ring-signal-blue/40 focus:border-signal-blue/60 transition"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm((v) => !v)}
                  className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium
                    bg-ink-950 dark:bg-vault text-paper-raised dark:text-ink-950
                    hover:opacity-90 transition"
                >
                  <Plus size={14} /> Add
                </button>
                <label className={`h-9 px-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium
                  cursor-pointer border border-line-light dark:border-line
                  text-ledger-light-primary dark:text-ledger-dark-primary
                  hover:bg-ink-950/[0.04] dark:hover:bg-white/[0.05] transition
                  ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <Upload size={14} /> {uploading ? 'Uploading…' : 'CSV'}
                  <input type="file" accept=".csv" className="hidden"
                    onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-line-light dark:border-line text-2xs uppercase tracking-wider
                    text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                    <th className="text-left font-medium px-5 py-2.5">Description</th>
                    <th className="text-left font-medium px-5 py-2.5">Category</th>
                    <th className="text-left font-medium px-5 py-2.5">Date</th>
                    <th className="text-right font-medium px-5 py-2.5">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}
                      className="border-b border-line-light dark:border-line last:border-0
                        hover:bg-ink-950/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium truncate max-w-[200px]">{t.description || '—'}</p>
                        <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">ID {t.id}</p>
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
                      <td colSpan={4} className="px-5 py-10 text-center
                        text-ledger-light-tertiary dark:text-ledger-dark-tertiary">
                        {expenses.length === 0
                          ? 'No expenses yet — add one or import a CSV.'
                          : `No results for "${query}".`}
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
