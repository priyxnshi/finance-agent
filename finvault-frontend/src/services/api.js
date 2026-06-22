import axios from 'axios'
import { API_BASE_URL } from '../config.js'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Normalizes FastAPI's error shape ({"detail": "..."} or validation arrays)
// into a single readable message, so every page can just do `catch (err) {
// setError(err.message) }` without re-parsing axios errors everywhere.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail
    let message = 'Something went wrong talking to the server.'

    if (typeof detail === 'string') {
      message = detail
    } else if (Array.isArray(detail)) {
      message = detail.map((d) => d.msg || JSON.stringify(d)).join('; ')
    } else if (error.code === 'ECONNABORTED') {
      message = 'The request timed out — is the backend running on ' + API_BASE_URL + '?'
    } else if (error.message === 'Network Error') {
      message = `Couldn't reach the backend at ${API_BASE_URL}. Is it running?`
    }

    return Promise.reject(new Error(message))
  }
)

// --- Expenses --------------------------------------------------------

export function getExpenses(params = {}) {
  return client.get('/expenses', { params }).then((res) => res.data)
}

export function createExpense(payload) {
  return client.post('/expense', payload).then((res) => res.data)
}

export function updateExpense(id, payload) {
  return client.put(`/expense/${id}`, payload).then((res) => res.data)
}

export function deleteExpense(id) {
  return client.delete(`/expense/${id}`).then((res) => res.data)
}

export function uploadCSV(file) {
  const formData = new FormData()
  formData.append('file', file)
  return client
    .post('/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data)
}

// --- Analytics ---------------------------------------------------------

export function getAnalyticsSummary() {
  return client.get('/analytics/summary').then((res) => res.data)
}

export function getAnalyticsTrends(months = 6) {
  return client.get('/analytics/trends', { params: { months } }).then((res) => res.data)
}

export function getAnalyticsCategories() {
  return client.get('/analytics/categories').then((res) => res.data)
}

export function getAnalyticsHeatmap(days = 365) {
  return client.get('/analytics/heatmap', { params: { days } }).then((res) => res.data)
}

export function getAnalyticsHealthScore() {
  return client.get('/analytics/health-score').then((res) => res.data)
}

export function getAnalyticsMonthlySummary() {
  return client.get('/analytics/monthly-summary').then((res) => res.data)
}

// --- Goals ---------------------------------------------------------------

export function getGoals() {
  return client.get('/goals').then((res) => res.data)
}

export function createGoal(payload) {
  return client.post('/goal', payload).then((res) => res.data)
}

export function updateGoal(id, payload) {
  return client.put(`/goal/${id}`, payload).then((res) => res.data)
}

export function deleteGoal(id) {
  return client.delete(`/goal/${id}`).then((res) => res.data)
}

export default client

// --- Machine Learning Phase 4 --------------------------------------------

/**
 * Requests a category prediction for a transaction string using local TF-IDF + Logistic Regression.
 * @param {string} description - The merchant or transaction narrative string.
 * @returns {Promise<{category: string}>}
 */
export function predictCategory(description) {
  return client.post('/ml/predict-category', { description }).then((res) => res.data)
}

/**
 * Generates a 30-day time-series cash burn projection runway using a local ARIMA profile.
 * @param {number[]} historicalDailySpend - Numeric array containing historical daily cash spend values.
 * @param {number} [forecastDays=30] - Number of future sequence indices to compute.
 * @returns {Promise<{predicted_next_month_total: number, daily_forecast_trendline: number[], spending_trend_status: string}>}
 */
export function getSpendingForecast(historicalDailySpend, forecastDays = 30) {
  return client.post('/ml/predict-spending', {
    historical_daily_spend: historicalDailySpend,
    forecast_days: forecastDays
  }).then((res) => res.data)
}

/**
 * Computes anomaly tracking vectors against past behaviors using an Isolation Forest.
 * @param {Array<{id: number, description: string, amount: number, date: string}>} transactionsList - Core array log.
 * @returns {Promise<{anomalies_found_count: number, anomalies: Array}>}
 */
export function getDetectedAnomalies(transactionsList) {
  return client.post('/ml/detect-anomalies', { transactions: transactionsList }).then((res) => res.data)
}

/**
 * Evaluates savings target success vectors with a local Monte Carlo simulation.
 * @param {Object} payload 
 * @param {number} payload.current_savings
 * @param {number} payload.target_savings
 * @param {number} payload.days_remaining
 * @param {number[]} payload.historical_daily_spend
 * @returns {Promise<{probability: number, status: string, projected_shortfall: number}>}
 */
export function predictGoalFeasibility(payload) {
  return client.post('/ml/predict-goal-feasibility', {
    current_savings: payload.current_savings,
    target_savings: payload.target_savings,
    days_remaining: payload.days_remaining,
    historical_daily_spend: payload.historical_daily_spend
  }).then((res) => res.data)
}

/**
 * Dispatches historical categorical pairs off-thread to retrain active weights.
 * @param {Array<{description: string, category: string}>} dataset 
 * @returns {Promise<{status: string}>}
 */
export function triggerCategorizerRetraining(dataset) {
  return client.post('/ml/retrain-categorizer', { dataset }).then((res) => res.data)
}

// --- AI Agent Core Loop Phase 5 ------------------------------------------

export function processAgentLoop(payload) {
  return client.post('/agent/process-loop', payload).then((res) => res.data)
}

export function sendAgentFeedback(payload) {
  return client.post('/agent/feedback', payload).then((res) => res.data)
}