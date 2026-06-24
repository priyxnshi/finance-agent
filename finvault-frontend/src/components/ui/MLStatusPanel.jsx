import React, { useState } from 'react'
import { CheckCircle2, XCircle, RefreshCw, Brain, Loader2 } from 'lucide-react'
import Card from './Card.jsx'
import { retrainModels } from '../../services/api.js'

const MODEL_LABELS = {
  categorizer: { name: 'Expense Categorizer', sub: 'TF-IDF + Logistic Regression' },
  spending_lr:  { name: 'Spending Predictor (LR)', sub: 'Linear Regression' },
  spending_arima: { name: 'Spending Predictor (ARIMA)', sub: 'ARIMA(2,1,1)' },
  anomaly_detector: { name: 'Anomaly Detector', sub: 'Isolation Forest' },
  goal_predictor: { name: 'Goal Predictor', sub: 'Logistic Regression' },
}

// Maps model name → retrain key the backend expects
const RETRAIN_KEY = {
  categorizer: 'categorizer',
  spending_lr: 'spending',
  spending_arima: 'spending',
  anomaly_detector: 'anomaly',
  goal_predictor: 'goal',
}

function formatDate(iso) {
  if (!iso) return null
  try {
    return new Date(iso + 'Z').toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function MLStatusPanel({ models = {}, onRefresh }) {
  const [retraining, setRetraining] = useState({})
  const [results, setResults] = useState({})

  async function handleRetrain(key) {
    setRetraining((p) => ({ ...p, [key]: true }))
    setResults((p) => ({ ...p, [key]: null }))
    try {
      const res = await retrainModels([key])
      const modelResult = res.retrain_results?.[key]
      setResults((p) => ({ ...p, [key]: modelResult?.error ? `Error: ${modelResult.error}` : 'Retrained successfully' }))
      if (onRefresh) onRefresh()
    } catch (err) {
      setResults((p) => ({ ...p, [key]: `Failed: ${err.message}` }))
    } finally {
      setRetraining((p) => ({ ...p, [key]: false }))
    }
  }

  async function handleRetrainAll() {
    setRetraining({ all: true })
    try {
      await retrainModels(['all'])
      if (onRefresh) onRefresh()
      setResults({ all: 'All models retrained' })
    } catch (err) {
      setResults({ all: `Failed: ${err.message}` })
    } finally {
      setRetraining({})
    }
  }

  return (
    <Card accent="vault">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-vault" />
          <h3 className="font-display font-semibold text-sm tracking-tight">ML Model Status</h3>
        </div>
        <button
          onClick={handleRetrainAll}
          disabled={retraining.all}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md
            bg-vault text-ink-950 hover:bg-vault-light transition disabled:opacity-60"
        >
          {retraining.all
            ? <><Loader2 size={12} className="animate-spin" /> Retraining…</>
            : <><RefreshCw size={12} /> Retrain All</>
          }
        </button>
      </div>

      {results.all && (
        <p className="text-xs text-signal-green mb-3">{results.all}</p>
      )}

      <div className="space-y-3">
        {Object.entries(MODEL_LABELS).map(([key, { name, sub }]) => {
          const info = models[key] ?? {}
          const isTrained = info.trained
          const trainedAt = formatDate(info.trained_at)
          const retrainKey = RETRAIN_KEY[key]
          const isRetraining = retraining[retrainKey]
          const result = results[retrainKey]

          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-md border border-line-light dark:border-line bg-paper dark:bg-ink-850 px-3.5 py-3"
            >
              <div className="shrink-0">
                {isTrained
                  ? <CheckCircle2 size={16} className="text-signal-green" />
                  : <XCircle size={16} className="text-signal-red" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary">{sub}</p>
                {trainedAt && (
                  <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-0.5">
                    Last trained: {trainedAt}
                  </p>
                )}
                {result && (
                  <p className={`text-2xs mt-0.5 ${result.startsWith('Error') || result.startsWith('Failed') ? 'text-signal-red' : 'text-signal-green'}`}>
                    {result}
                  </p>
                )}
                {/* Show key metrics */}
                {isTrained && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {info.accuracy && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-ink-950/[0.04] dark:bg-white/[0.06] text-ledger-light-secondary dark:text-ledger-dark-secondary">
                        acc {(info.accuracy * 100).toFixed(1)}%
                      </span>
                    )}
                    {info.macro_f1 && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-ink-950/[0.04] dark:bg-white/[0.06] text-ledger-light-secondary dark:text-ledger-dark-secondary">
                        F1 {(info.macro_f1 * 100).toFixed(1)}%
                      </span>
                    )}
                    {info.roc_auc && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-ink-950/[0.04] dark:bg-white/[0.06] text-ledger-light-secondary dark:text-ledger-dark-secondary">
                        AUC {(info.roc_auc * 100).toFixed(1)}%
                      </span>
                    )}
                    {info.training_samples && (
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-ink-950/[0.04] dark:bg-white/[0.06] text-ledger-light-secondary dark:text-ledger-dark-secondary">
                        {info.training_samples} samples
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRetrain(retrainKey)}
                disabled={!!retraining[retrainKey]}
                title={`Retrain ${name}`}
                className="shrink-0 h-7 w-7 rounded-md border border-line-light dark:border-line
                  text-ledger-light-secondary dark:text-ledger-dark-secondary
                  hover:text-vault hover:border-vault/40 transition disabled:opacity-40
                  grid place-items-center"
              >
                {isRetraining
                  ? <Loader2 size={13} className="animate-spin" />
                  : <RefreshCw size={13} />
                }
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-2xs text-ledger-light-tertiary dark:text-ledger-dark-tertiary mt-4 leading-relaxed">
        Train models from the command line: <span className="ledger-num bg-ink-950/[0.06] dark:bg-white/[0.06] px-1.5 py-0.5 rounded">python scripts/train_models.py</span>
      </p>
    </Card>
  )
}
