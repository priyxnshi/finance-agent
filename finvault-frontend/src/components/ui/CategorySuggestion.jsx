import React, { useState, useEffect, useRef } from 'react'
import { Brain, Check, Loader2 } from 'lucide-react'
import { predictCategory } from '../../services/api.js'

const CATEGORY_COLORS = {
  Food: 'text-signal-green bg-signal-green/10',
  Travel: 'text-vault bg-vault/10',
  Bills: 'text-signal-blue bg-signal-blue/10',
  Shopping: 'text-signal-amber bg-signal-amber/10',
  Entertainment: 'text-signal-red bg-signal-red/10',
}

/*
 * Sits beside a description input field.
 * Debounces the user's typing, fires the ML endpoint when the description
 * is long enough, and shows a suggestion they can click to apply.
 */
export default function CategorySuggestion({ description, onAccept }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setResult(null)
    setAccepted(false)
    if (!description || description.trim().length < 3) return

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await predictCategory(description.trim())
        setResult(data)
      } catch {
        setResult(null)
      } finally {
        setLoading(false)
      }
    }, 600)

    return () => clearTimeout(timerRef.current)
  }, [description])

  if (!description || description.trim().length < 3) return null

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        <Loader2 size={11} className="animate-spin text-ledger-light-tertiary dark:text-ledger-dark-tertiary" />
        <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">Categorising…</span>
      </div>
    )
  }

  if (!result) return null

  const colorCls = CATEGORY_COLORS[result.predicted_category] ?? 'text-ledger-light-secondary dark:text-ledger-dark-secondary bg-ink-950/[0.06] dark:bg-white/[0.06]'
  const confidence = Math.round(result.confidence * 100)

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <Brain size={11} className="text-vault shrink-0" />
      <span className="text-2xs text-ledger-light-secondary dark:text-ledger-dark-secondary">AI suggests:</span>
      {accepted ? (
        <span className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full ${colorCls}`}>
          <Check size={10} /> {result.predicted_category}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => { onAccept(result.predicted_category); setAccepted(true) }}
          className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full
            hover:opacity-80 transition cursor-pointer ${colorCls}`}
        >
          {result.predicted_category}
          <span className="opacity-60 font-normal">{confidence}%</span>
        </button>
      )}
      {!accepted && (
        <span className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">— click to apply</span>
      )}
    </div>
  )
}
