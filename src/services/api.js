import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Expenses ──────────────────────────────────────────────────────────────────

export const expenseApi = {
  list: (params = {}) =>
    api.get('/expenses', { params }).then(r => r.data),

  get: (id) =>
    api.get(`/expenses/${id}`).then(r => r.data),

  create: (data) =>
    api.post('/expenses', data).then(r => r.data),

  update: (id, data) =>
    api.patch(`/expenses/${id}`, data).then(r => r.data),

  delete: (id) =>
    api.delete(`/expenses/${id}`),

  uploadCSV: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/expenses/upload/csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export const analysisApi = {
  summary:    () => api.get('/analysis/summary').then(r => r.data),
  insights:   () => api.get('/analysis/insights').then(r => r.data),
  categories: () => api.get('/analysis/categories').then(r => r.data),
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export const goalApi = {
  list:   ()         => api.get('/goals').then(r => r.data),
  get:    (id)       => api.get(`/goals/${id}`).then(r => r.data),
  create: (data)     => api.post('/goals', data).then(r => r.data),
  update: (id, data) => api.patch(`/goals/${id}`, data).then(r => r.data),
  delete: (id)       => api.delete(`/goals/${id}`),
}

export default api
