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
