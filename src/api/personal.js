import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'https://aria-advisor.onrender.com'

const api = axios.create({ baseURL: BASE })

// Inject JWT on every request + extract user ID for trade operations
api.interceptors.request.use(config => {
  const token = localStorage.getItem('aria_personal_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Extract user ID from JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.user_id) config.headers['X-Personal-User-Id'] = payload.user_id
    } catch {}
  }
  return config
})

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/personal/auth/register', data).then(r => r.data)
export const login = (data) => api.post('/personal/auth/login', data).then(r => r.data)
export const getMe = () => api.get('/personal/auth/me').then(r => r.data)
export const updateProfile = (data) => api.put('/personal/auth/profile', data).then(r => r.data)
export const linkAdvisor = (referral_code) => api.post('/personal/auth/link-advisor', { referral_code }).then(r => r.data)
export const delinkAdvisor = () => api.post('/personal/auth/delink-advisor').then(r => r.data)

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

// ─── Trades (Phase 1A + Client-Initiated) ────────────────────────────────────
export const getMyTrades = () => api.get('/trades/personal/clients/me/trades').then(r => r.data)
export const approveTrade = (tradeId, data) => api.put(`/trades/${tradeId}/approve`, data).then(r => r.data)
export const rejectTrade = (tradeId, data) => api.put(`/trades/${tradeId}/reject`, data).then(r => r.data)
export const updateCryptoTxHash = (tradeId, data) => api.put(`/trades/${tradeId}/tx-hash`, data).then(r => r.data)
export const submitMyTrade = (data) => api.post('/trades/personal/me/trades', data).then(r => r.data)
export const checkBalance = (params) => api.get('/trades/personal/me/balance-check', { params }).then(r => r.data)

// ─── Notifications (FEAT-1004) ────────────────────────────────────────────────
export const getClientNotifications = (limit = 20) =>
  api.get(`/notifications/personal/me?limit=${limit}`).then(r => r.data)

export const markNotificationRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`).then(r => r.data)

export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`).then(r => r.data)

// ─── Formatters ──────────────────────────────────────────────────────────────
// Price refresh — fires after portfolio load to update NAVs
export const refreshMyPrices = () => {
  const uid = localStorage.getItem('aria_personal_user_id')
  if (!uid) return Promise.resolve()
  return api.post(`/prices/refresh/personal/${uid}`).then(r => r.data).catch(() => null)
}

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
