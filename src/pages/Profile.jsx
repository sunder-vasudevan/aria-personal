import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { updateProfile, linkAdvisor } from '../api/personal'
import { User, MapPin, Shield, Link2, CheckCircle, Phone, Mail, Star } from 'lucide-react'

const RISK_LABELS = {
  1: 'Very Conservative', 2: 'Very Conservative',
  3: 'Conservative',      4: 'Conservative',
  5: 'Moderate',          6: 'Moderate',
  7: 'Moderately Aggressive', 8: 'Moderately Aggressive',
  9: 'Aggressive',        10: 'Aggressive',
}

function AdvisorCard({ advisor }) {
  const initials = advisor?.display_name
    ? advisor.display_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A'
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1D6FDB] to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{advisor?.display_name || 'Your Advisor'}</div>
          {(advisor?.city || advisor?.region) && (
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} />
              {[advisor.city, advisor.region].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold flex-shrink-0">
          <CheckCircle size={11} /> Connected
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
        {advisor?.referral_code && (
          <div>
            <div className="text-xs text-gray-400">Advisor Code</div>
            <div className="text-xs font-semibold text-gray-700 tracking-widest mt-0.5">{advisor.referral_code}</div>
          </div>
        )}
        {advisor?.avg_rating != null && (
          <div>
            <div className="text-xs text-gray-400">Rating</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">
              ★ {advisor.avg_rating.toFixed(1)} <span className="text-gray-400 font-normal">({advisor.rating_count})</span>
            </div>
          </div>
        )}
      </div>
      <div className="text-xs text-teal-600 flex items-center gap-1">
        <CheckCircle size={11} /> Your advisor can see your portfolio and goals.
      </div>
    </div>
  )
}

function LinkAdvisorForm({ onLinked }) {
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleLink = async () => {
    if (!code.trim()) return
    setSaving(true); setError(null)
    try {
      const r = await linkAdvisor(code.trim())
      setResult(r)
      onLinked()
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code. Please check with your advisor.')
    } finally {
      setSaving(false)
    }
  }

  if (result) return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <CheckCircle size={16} className="text-teal-600" />
        <span className="text-sm font-semibold text-teal-800">
          Linked to {result.advisor_name}{result.advisor_city ? ` · ${result.advisor_city}` : ''}
        </span>
      </div>
      {result.client_linked && (
        <div className="text-xs text-teal-600 mt-1.5">Your advisor can now see your portfolio.</div>
      )}
    </div>
  )

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Link2 size={15} className="text-[#1D6FDB]" />
        <span className="text-sm font-semibold text-gray-800">Connect to your advisor</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Ask your advisor for their referral code to link your account and unlock shared portfolio visibility.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. RAHUL01"
          maxLength={20}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={handleLink}
          disabled={saving || !code.trim()}
          className="px-4 py-2 bg-[#1D6FDB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '…' : 'Link'}
        </button>
      </div>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  )
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.display_name || '')
  const [riskScore, setRiskScore] = useState(user?.risk_score || 5)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ display_name: name, risk_score: riskScore })
      await refreshUser()
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-5 pb-8 max-w-lg">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1D6FDB] to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {(user.display_name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">{user.display_name}</div>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      </div>

      {/* Personal details card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User size={15} className="text-[#1D6FDB]" />
            <span className="text-sm font-semibold text-gray-800">Personal Details</span>
          </div>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setName(user.display_name); setRiskScore(user.risk_score || 5) }}
              className="text-xs text-[#1D6FDB] font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Display name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Risk appetite — {RISK_LABELS[riskScore] || 'Moderate'} ({riskScore}/10)
              </label>
              <input
                type="range" min={1} max={10} value={riskScore}
                onChange={e => setRiskScore(Number(e.target.value))}
                className="w-full accent-[#1D6FDB]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Conservative</span><span>Aggressive</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#1D6FDB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Risk: {user.risk_category || 'Not set'}{user.risk_score ? ` (${user.risk_score}/10)` : ''}
              </span>
            </div>
            {saved && (
              <div className="text-xs text-teal-600 flex items-center gap-1">
                <CheckCircle size={12} /> Saved
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advisor section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={15} className="text-[#1D6FDB]" />
          <span className="text-sm font-semibold text-gray-800">Your Advisor</span>
        </div>
        {user.advisor_id
          ? <AdvisorCard advisor={user.advisor} />
          : <LinkAdvisorForm onLinked={refreshUser} />
        }
      </div>

    </div>
  )
}
