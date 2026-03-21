import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Loader2 } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ display_name: '', email: '', password: '', referral_code: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError(null)
    try {
      await register(form.email, form.password, form.display_name, form.referral_code || null)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xs font-bold text-navy-400 tracking-widest uppercase mb-1">ARIA</div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your own portfolio</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your name</label>
              <input
                type="text"
                autoComplete="name"
                value={form.display_name}
                onChange={e => set('display_name', e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                placeholder="Priya Sharma"
              />
            </div>
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
                autoComplete="new-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Advisor code <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.referral_code}
                onChange={e => set('referral_code', e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 uppercase tracking-widest"
                placeholder="e.g. RAHUL01"
                maxLength={20}
              />
              <p className="text-xs text-gray-400 mt-1">Enter the code your advisor gave you to link your account.</p>
            </div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1D6FDB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" />Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1D6FDB] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
