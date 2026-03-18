import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'https://aria-advisor.onrender.com'

const api = axios.create({ baseURL: BASE })

// Inject JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('aria_personal_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/personal/auth/register', data).then(r => r.data)
export const login = (data) => api.post('/personal/auth/login', data).then(r => r.data)
export const getMe = () => api.get('/personal/auth/me').then(r => r.data)
export const updateProfile = (data) => api.put('/personal/auth/profile', data).then(r => r.data)

// ─── Portfolio ───────────────────────────────────────────────────────────────
export const getPortfolio = () => api.get('/personal/portfolio').then(r => r.data)
export const savePortfolio = (data) => api.post('/personal/portfolio', data).then(r => r.data)

// ─── Goals ───────────────────────────────────────────────────────────────────
export const getGoals = () => api.get('/personal/goals').then(r => r.data)
export const createGoal = (data) => api.post('/personal/goals', data).then(r => r.data)
export const updateGoal = (id, data) => api.put(`/personal/goals/${id}`, data).then(r => r.data)
export const deleteGoal = (id) => api.delete(`/personal/goals/${id}`)
export const getGoalProjection = (params) =>
  api.get('/personal/goals/projection', { params }).then(r => r.data)
export const simulateGoal = (data) => api.post('/personal/goals/simulate', data).then(r => r.data)

// ─── Life Events ─────────────────────────────────────────────────────────────
export const getLifeEvents = () => api.get('/personal/life-events').then(r => r.data)
export const createLifeEvent = (data) => api.post('/personal/life-events', data).then(r => r.data)
export const updateLifeEvent = (id, data) => api.put(`/personal/life-events/${id}`, data).then(r => r.data)
export const deleteLifeEvent = (id) => api.delete(`/personal/life-events/${id}`)

// ─── Copilot ─────────────────────────────────────────────────────────────────
export const sendMessage = (message, conversation_history = []) =>
  api.post('/personal/copilot', { message, conversation_history }).then(r => r.data)

// ─── Formatters ──────────────────────────────────────────────────────────────
export const fmt = {
  inr: (v) => {
    const n = Number(v)
    if (isNaN(n)) return '₹0'
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    return `₹${n.toLocaleString('en-IN')}`
  },
  pct: (v) => `${Number(v).toFixed(1)}%`,
}
