import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Categories ──
export const getCategories = () => api.get('/categories/').then(r => r.data)
export const createCategory = (data) => api.post('/categories/', data).then(r => r.data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// ── Log Entries ──
export const getLogEntries = (params) => {
  const query = typeof params === 'string' ? { date: params } : params
  return api.get('/log-entries/', { params: query }).then(r => r.data)
}
export const createLogEntry = (data) => api.post('/log-entries/', data).then(r => r.data)
export const updateLogEntry = (id, data) => api.put(`/log-entries/${id}`, data).then(r => r.data)
export const deleteLogEntry = (id) => api.delete(`/log-entries/${id}`)

// ── Planned Blocks ──
export const getPlannedBlocks = (params) => {
  const query = typeof params === 'string' ? { date: params } : params
  return api.get('/planned-blocks/', { params: query }).then(r => r.data)
}
export const createPlannedBlock = (data) => api.post('/planned-blocks/', data).then(r => r.data)
export const updatePlannedBlock = (id, data) => api.put(`/planned-blocks/${id}`, data).then(r => r.data)
export const deletePlannedBlock = (id) => api.delete(`/planned-blocks/${id}`)

// ── Goals ──
export const getGoals = () => api.get('/goals/').then(r => r.data)
export const createGoal = (data) => api.post('/goals/', data).then(r => r.data)
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data).then(r => r.data)
export const deleteGoal = (id) => api.delete(`/goals/${id}`)

// ── Reports ──
export const getDayReport = (date) => api.get('/reports/day', { params: { date } }).then(r => r.data)
export const getWeekReport = (start) => api.get('/reports/week', { params: { start } }).then(r => r.data)
export const getMonthReport = (year, month) => api.get('/reports/month', { params: { year, month } }).then(r => r.data)

export default api
