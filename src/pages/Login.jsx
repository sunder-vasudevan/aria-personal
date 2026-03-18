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
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-14"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2044 60%, #1a3a6e 100%)' }}>
        <div>
          <div className="text-white font-bold text-3xl tracking-tight">ARIA</div>
          <div className="text-blue-300 text-4xl font-bold mt-1 leading-tight">Your Money Intelligence!</div>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-6">
            Your money,<br />
            <span className="text-blue-300">working smarter.</span>
          </h1>
          <p className="text-navy-300 text-base leading-relaxed max-w-sm">
            Track your portfolio, set goals with real probability scores, and get AI-powered answers — all in one place.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Goal Tracking', value: 'Live', sub: 'probability scores' },
              { label: 'Inflation Adjusted', value: '100%', sub: 'real targets' },
              { label: 'AI Copilot', value: '24/7', sub: 'instant answers' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-white text-2xl font-bold">{s.value}</div>
                <div className="text-blue-300 text-xs font-semibold mt-0.5">{s.label}</div>
                <div className="text-navy-400 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-navy-400 text-xs">ARIA Personal v0.1 · Made with ❤️ in Hyderabad</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-10">
          <div className="text-navy-950 font-bold text-3xl tracking-tight">ARIA</div>
          <div className="text-navy-700 text-2xl font-bold mt-1">Your Money Intelligence!</div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 bg-white"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy-950 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" />Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            New here?{' '}
            <Link to="/register" className="text-navy-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-white border border-gray-100 rounded-xl">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Demo Accounts</div>
            {[
              { name: 'Joshua Pearce', email: 'joshua2@aria.demo' },
              { name: 'Rubén Cervantes', email: 'ruben@aria.demo' },
              { name: 'Kate McKenna', email: 'kate@aria.demo' },
            ].map(u => (
              <button
                key={u.email}
                onClick={() => setForm({ email: u.email, password: 'demo1234' })}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors mb-1 last:mb-0"
              >
                <div className="text-sm font-semibold text-gray-800">{u.name}</div>
                <div className="text-xs text-gray-400">{u.email} · demo1234</div>
              </button>
            ))}
          </div>

          <div className="lg:hidden text-center mt-8 text-gray-300 text-xs">
            ARIA Personal v0.1 · Made with ❤️ in Hyderabad
          </div>
        </div>
      </div>
    </div>
  )
}
