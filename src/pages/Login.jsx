import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xs font-bold text-navy-400 tracking-widest uppercase mb-1">ARIA</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Your personal finance dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-navy-950 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" />Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          New here?{' '}
          <Link to="/register" className="text-navy-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demo Accounts</div>
          {[
            { name: 'Joshua Pearce', email: 'joshua2@aria.demo', label: '🟢 On track' },
            { name: 'Rubén Cervantes', email: 'ruben@aria.demo', label: '🔴 Needs attention' },
            { name: 'Kate McKenna', email: 'kate@aria.demo', label: '🔴 Goals at risk' },
          ].map(u => (
            <button
              key={u.email}
              onClick={() => setForm({ email: u.email, password: 'demo1234' })}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors mb-1 last:mb-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email} · demo1234</div>
                </div>
                <span className="text-xs">{u.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
