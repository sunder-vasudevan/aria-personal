import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList, LineChart, Line, CartesianGrid } from 'recharts'
import { useAuth } from '../auth/useAuth'
import { getPortfolio, getGoals, getMyTrades, approveTrade, rejectTrade, getClientNotifications, submitMyTrade, checkBalance, refreshMyPrices, getPortfolioHistory, fmt } from '../api/personal'
import { TrendingUp, Target, Plus, ChevronRight, ChevronDown, AlertCircle, Pencil, CheckCircle, X, ArrowUpDown, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import PortfolioEditor from '../components/PortfolioEditor'

const CATEGORY_COLORS = {
  'Large Cap': '#1e4fff', 'Flexi Cap': '#0c2db4', 'Mid Cap': '#4c7bff',
  'Small Cap': '#7fa5ff', 'Debt': '#10b981', 'Liquid': '#6ee7b7',
}
const DEFAULT_COLOR = '#e5e7eb'

function AllocationBar({ label, current, target, color }) {
  const drift = current - target
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 tabular-nums">{current.toFixed(0)}% <span className="text-gray-400">(target {target.toFixed(0)}%)</span></span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(current, 100)}%`, backgroundColor: color }} />
      </div>
      {Math.abs(drift) > 5 && (
        <div className={`text-xs ${drift > 0 ? 'text-amber-600' : 'text-blue-600'}`}>
          {drift > 0 ? `+${drift.toFixed(0)}% overweight` : `${drift.toFixed(0)}% underweight`}
        </div>
      )}
    </div>
  )
}

function ProbabilityPill({ pct }) {
  if (pct >= 80) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 tabular-nums">{pct.toFixed(0)}%</span>
  )
  if (pct >= 60) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 tabular-nums">{pct.toFixed(0)}%</span>
  )
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 tabular-nums">{pct.toFixed(0)}%</span>
  )
}


export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [goals, setGoals] = useState([])
  const [trades, setTrades] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [approvingTradeId, setApprovingTradeId] = useState(null)
  const [tradeError, setTradeError] = useState('')
  const [showBalances, setShowBalances] = useState(false)
  const [holdingsOpen, setHoldingsOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [portfolioHistory, setPortfolioHistory] = useState(null)
  const [advisorBannerDismissed, setAdvisorBannerDismissed] = useState(() => {
    return localStorage.getItem('aria_advisor_banner_dismissed') === '1'
  })

  // New trade modal
  const [tradeModal, setTradeModal] = useState(false)
  const [tradeForm, setTradeForm] = useState({ asset_type: 'stock', action: 'buy', asset_code: '', quantity: '', estimated_value: '', client_note: '' })
  const [tradeSubmitting, setTradeSubmitting] = useState(false)
  const [tradeFormError, setTradeFormError] = useState('')
  const [tradeSuccess, setTradeSuccess] = useState('')

  // Balance check state (for approve)
  const [balanceCheck, setBalanceCheck] = useState(null)   // { sufficient, available, required, shortfall }
  const [checkingBalance, setCheckingBalance] = useState(null)  // trade id being checked

  function load() {
    getPortfolioHistory().then(h => setPortfolioHistory(h)).catch(() => {})
    // Fire price refresh in background (5-min cached — won't hammer the API)
    refreshMyPrices(user?.id).then(() => {
      return Promise.all([getPortfolio(), getGoals(), getMyTrades(), getClientNotifications()])
        .then(([p, g, t, n]) => { setPortfolio(p); setGoals(g); setTrades(t); setNotifications(n?.notifications || []) })
        .catch(err => { console.error(err); setTrades([]); setNotifications([]) })
        .finally(() => setLoading(false))
    }).catch(() => {
      // Refresh failed — still load with stale prices
      Promise.all([getPortfolio(), getGoals(), getMyTrades(), getClientNotifications()])
        .then(([p, g, t, n]) => { setPortfolio(p); setGoals(g); setTrades(t); setNotifications(n?.notifications || []) })
        .catch(err => { console.error(err); setTrades([]); setNotifications([]) })
        .finally(() => setLoading(false))
    })
  }

  useEffect(() => { load() }, [])

  const handleApproveTrade = async (trade) => {
    try {
      setApprovingTradeId(trade.id)
      const updated = await approveTrade(trade.id, {})
      setTrades(trades.map(t => t.id === trade.id ? updated : t))
    } catch (err) {
      setTradeError('Failed to approve trade')
      console.error(err)
    } finally {
      setApprovingTradeId(null)
    }
  }

  const handleRejectTrade = async (trade) => {
    try {
      setApprovingTradeId(trade.id)
      const updated = await rejectTrade(trade.id, {})
      setTrades(trades.map(t => t.id === trade.id ? updated : t))
    } catch (err) {
      setTradeError('Failed to reject trade')
      console.error(err)
    } finally {
      setApprovingTradeId(null)
    }
  }

  const handleCheckAndApprove = async (trade) => {
    try {
      setCheckingBalance(trade.id)
      setBalanceCheck(null)
      setTradeError('')
      const result = await checkBalance({
        action: trade.action,
        asset_code: trade.asset_code,
        quantity: trade.quantity,
        estimated_value: trade.estimated_value,
      })
      setBalanceCheck({ ...result, tradeId: trade.id })
      if (result.sufficient) {
        // Auto-proceed to approve
        setApprovingTradeId(trade.id)
        const updated = await approveTrade(trade.id, {})
        setTrades(trades.map(t => t.id === trade.id ? updated : t))
        setBalanceCheck(null)
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Balance check failed'
      setTradeError(msg)
    } finally {
      setCheckingBalance(null)
      setApprovingTradeId(null)
    }
  }

  const handleSubmitTrade = async () => {
    setTradeFormError('')
    if (!tradeForm.asset_code.trim()) return setTradeFormError('Asset code required')
    if (!tradeForm.quantity || Number(tradeForm.quantity) <= 0) return setTradeFormError('Quantity must be > 0')
    if (!tradeForm.estimated_value || Number(tradeForm.estimated_value) <= 0) return setTradeFormError('Value must be > 0')
    try {
      setTradeSubmitting(true)
      await submitMyTrade({
        ...tradeForm,
        quantity: Number(tradeForm.quantity),
        estimated_value: Number(tradeForm.estimated_value),
      })
      setTradeSuccess('Trade submitted and settled.')
      setTradeModal(false)
      setTradeForm({ asset_type: 'stock', action: 'buy', asset_code: '', quantity: '', estimated_value: '', client_note: '' })
      load()
    } catch (err) {
      setTradeFormError(err?.response?.data?.detail || 'Trade failed')
    } finally {
      setTradeSubmitting(false)
    }
  }

  const EQUITY_CATEGORIES = new Set(['Large Cap', 'Flexi Cap', 'Mid Cap', 'Small Cap', 'Multi Cap', 'Equity'])
  const equityValue = portfolio?.holdings
    ?.filter(h => EQUITY_CATEGORIES.has(h.fund_category))
    .reduce((sum, h) => sum + (h.current_value || 0), 0) ?? 0
  const cryptoValue = trades
    .filter(t => t.asset_type === 'crypto' && t.status === 'settled')
    .reduce((sum, t) => sum + (t.action === 'buy' ? (t.estimated_value || 0) : -(t.estimated_value || 0)), 0)
  const cashValue = portfolio?.cash_balance ?? 0

  const chartData = portfolio?.holdings?.map(h => ({
    name: h.fund_name,
    value: h.current_value,
    color: CATEGORY_COLORS[h.fund_category] || DEFAULT_COLOR,
  })) || []

  const urgentGoals = goals.filter(g => g.probability_pct < 70)
  const firstName = user?.display_name?.split(' ')[0] || 'there'

  if (editing) return (
    <PortfolioEditor
      portfolio={portfolio}
      onClose={() => setEditing(false)}
      onSaved={() => { setEditing(false); setLoading(true); load() }}
    />
  )

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-32 bg-gray-200 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6 pb-8">

      {/* ── Gradient hero ── */}
      <div className="bg-gradient-to-br from-[#1D6FDB] to-blue-700 rounded-2xl p-6 text-white">
        <div className="text-2xl font-bold">Hi, {firstName} 👋</div>
        <div className="text-blue-100 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        {urgentGoals.length > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
            <AlertCircle size={13} />
            <span className="text-sm font-medium">
              {urgentGoals.length} goal{urgentGoals.length !== 1 ? 's' : ''} need attention
            </span>
          </div>
        )}
        {urgentGoals.length === 0 && goals.length > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
            <Target size={13} />
            <span className="text-sm font-medium">All goals on track</span>
          </div>
        )}
      </div>

      {/* ── No Advisor Banner ── */}
      {!user?.advisor_id && !advisorBannerDismissed && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-semibold text-blue-900">You're managing your portfolio independently.</div>
            <div className="text-xs text-blue-700 mt-1">Want personalized guidance from an advisor?</div>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              onClick={() => navigate('/profile')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Find Advisor
            </button>
            <button
              onClick={() => {
                setAdvisorBannerDismissed(true)
                localStorage.setItem('aria_advisor_banner_dismissed', '1')
              }}
              className="text-blue-400 hover:text-blue-600 transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── KYC Rejection Banner ── */}
      {notifications.some(n => n.notification_type === 'kyc_doc_rejected' && !n.read) && (
        <div
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => navigate('/kyc')}
        >
          <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Action required — KYC document rejected</p>
            <p className="text-xs text-amber-700 mt-0.5">Your advisor has flagged a document for re-upload. Tap to review and re-upload.</p>
          </div>
          <ChevronRight size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        </div>
      )}

      {/* ── Holdings Summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Holdings</span>
            <button
              onClick={() => setShowBalances(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showBalances ? <EyeOff size={13} /> : <Eye size={13} />}
              {showBalances ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Cash', icon: '💵', value: cashValue, color: 'text-amber-600' },
              { label: 'Stocks', icon: '📈', value: equityValue, color: 'text-blue-600' },
              { label: 'Crypto', icon: '₿', value: cryptoValue, color: 'text-purple-600' },
            ].map(({ label, icon, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-xs text-gray-400 mb-1">{label}</div>
                <div className={`text-sm font-bold tabular-nums ${color}`}>
                  {showBalances ? (value === 0 ? '₹0' : fmt.inr(value)) : '••••••'}
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* ── Notifications Alert ── */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
          <div className="space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className="flex items-start gap-3 text-sm">
                <div className="text-base flex-shrink-0">
                  {notif.notification_type === 'trade_submitted' ? '📊' : '✅'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={notif.read ? 'text-gray-600' : 'font-semibold text-blue-900'}>
                    {notif.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Success banner ── */}
      {tradeSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-sm text-green-800 font-medium">✅ {tradeSuccess}</span>
          <button onClick={() => setTradeSuccess('')} className="text-green-400 hover:text-green-600"><X size={15} /></button>
        </div>
      )}

      {/* ── All Trades ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-900">
            📊 Trades · {trades.filter(t => t.status === 'pending_approval').length} pending, {trades.filter(t => t.status === 'settled').length} settled
          </div>
          <button
            onClick={() => { setTradeModal(true); setTradeFormError('') }}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-[#1D6FDB] px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={12} /> New Trade
          </button>
        </div>
        {trades.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">No trades yet. Use New Trade to get started.</div>
        ) : (
          <div className="space-y-2">
            {trades.map(trade => {
              const statusColor = {
                draft: 'bg-gray-50 border-gray-100 text-gray-900',
                pending_approval: 'bg-amber-50 border-amber-100 text-amber-900',
                approved: 'bg-green-50 border-green-100 text-green-900',
                settled: 'bg-blue-50 border-blue-100 text-blue-900',
                rejected: 'bg-red-50 border-red-100 text-red-900',
              }[trade.status] || 'bg-gray-50 border-gray-100 text-gray-900'
              const statusLabel = {
                draft: '📝 Draft', pending_approval: '⏳ Pending', approved: '✅ Approved',
                settled: '🔒 Settled', rejected: '❌ Rejected',
              }[trade.status] || trade.status
              return (
                <div key={trade.id} className={`border rounded-lg p-3 flex items-start justify-between ${statusColor}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mb-0.5">
                      {statusLabel} · {trade.action === 'buy' ? '🟢 Buy' : '🔴 Sell'} {trade.asset_code} ({trade.asset_type.replace(/_/g, ' ')})
                    </div>
                    <div className="text-xs opacity-75">{trade.quantity} units · {fmt.inr(trade.estimated_value)}</div>
                  </div>
                  {trade.status === 'pending_approval' && (
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCheckAndApprove(trade)}
                          disabled={approvingTradeId === trade.id || checkingBalance === trade.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle size={12} />
                          {checkingBalance === trade.id ? 'Checking…' : 'Check & Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectTrade(trade)}
                          disabled={approvingTradeId === trade.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-gray-400 rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-colors"
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                      {balanceCheck && balanceCheck.tradeId === trade.id && !balanceCheck.sufficient && (
                        <div className="text-xs text-red-600 font-medium text-right max-w-[180px]">
                          ⚠️ Insufficient {trade.action === 'buy' ? 'cash' : 'units'}.
                          {trade.action === 'buy'
                            ? ` Available ${fmt.inr(balanceCheck.available)}, need ${fmt.inr(balanceCheck.required)}.`
                            : ` Have ${balanceCheck.available} units, need ${balanceCheck.required}.`}
                          <button onClick={() => setBalanceCheck(null)} className="ml-1 underline text-red-500">Dismiss</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Portfolio summary ── */}
      {portfolio ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Portfolio</div>
              <div className="text-3xl font-bold text-gray-900 tabular-nums mt-0.5">{fmt.inr(portfolio.total_value)}</div>
              {portfolio.cash_balance != null && (
                <div className="text-xs text-gray-500 mt-0.5">💵 Cash available: <span className="font-semibold text-gray-700">{fmt.inr(portfolio.cash_balance)}</span></div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium text-[#1D6FDB] hover:underline">
                <Pencil size={12} /> Edit
              </button>
              <Link to="/goals" className="flex items-center gap-1 text-xs font-medium text-[#1D6FDB] hover:underline">
                <TrendingUp size={13} /> Goals
              </Link>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={2}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt.inr(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                <AllocationBar label="Equity" current={portfolio.equity_pct} target={portfolio.target_equity_pct} color="#1e4fff" />
                <AllocationBar label="Debt" current={portfolio.debt_pct} target={portfolio.target_debt_pct} color="#10b981" />
                <AllocationBar label="Cash" current={portfolio.cash_pct} target={portfolio.target_cash_pct} color="#f59e0b" />
              </div>
            </div>
          )}

          {portfolioHistory && portfolioHistory.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Portfolio Growth</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={portfolioHistory} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={v => v >= 1e7 ? `${(v/1e7).toFixed(1)}Cr` : v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : `${v}`}
                    tick={{ fontSize: 9, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    formatter={(v) => [fmt.inr(v), 'Value']}
                    labelStyle={{ fontSize: 10 }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 10 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#1D6FDB" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <button
            onClick={() => setHoldingsOpen(o => !o)}
            className="w-full flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>Holdings ({portfolio.holdings.length})</span>
            <ChevronDown size={14} className={`transition-transform ${holdingsOpen ? 'rotate-180' : ''}`} />
          </button>
          {holdingsOpen && (
            <div className="space-y-2 mt-1">
              {portfolio.holdings.map(h => (
                <div key={h.id} className="flex items-center justify-between py-2 border-t border-gray-50 first:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{h.fund_name}</div>
                    <div className="text-xs text-gray-400">{h.fund_house} · {h.fund_category}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-sm font-bold text-gray-900 tabular-nums">{fmt.inr(h.current_value)}</div>
                    {h.unrealised_pnl != null ? (
                      <div className={`text-xs font-semibold tabular-nums ${h.unrealised_pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {h.unrealised_pnl >= 0 ? '▲' : '▼'} {Math.abs(h.unrealised_pnl_pct || 0).toFixed(1)}%
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 tabular-nums">{h.current_pct.toFixed(1)}%</div>
                    )}
                  </div>
                </div>
              ))}
              {/* Category breakdown chart */}
              {(() => {
                const totalVal = portfolio.holdings.reduce((s, h) => s + h.current_value, 0)
                const byCategory = {}
                portfolio.holdings.forEach(h => {
                  const cat = h.fund_category || 'Other'
                  byCategory[cat] = (byCategory[cat] || 0) + h.current_value
                })
                const catData = Object.entries(byCategory)
                  .map(([cat, val]) => ({ cat, pct: totalVal > 0 ? (val / totalVal) * 100 : 0 }))
                  .sort((a, b) => b.pct - a.pct)
                const catColors = { 'Large Cap': '#1e4fff', 'Flexi Cap': '#7c3aed', 'Mid Cap': '#f97316', 'Small Cap': '#f43f5e', 'Debt': '#0d9488', 'Corporate Bond': '#0d9488', 'Liquid': '#9ca3af', 'ELSS': '#10b981' }
                return (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category Breakdown</div>
                    <ResponsiveContainer width="100%" height={catData.length * 26 + 8}>
                      <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="cat" width={88} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => [`${v.toFixed(1)}%`]} />
                        <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                          {catData.map(entry => (
                            <Cell key={entry.cat} fill={catColors[entry.cat] || '#9ca3af'} />
                          ))}
                          <LabelList dataKey="pct" position="right" formatter={(v) => `${v.toFixed(1)}%`} style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <div className="text-3xl mb-3">📊</div>
          <div className="text-sm font-semibold text-gray-600 mb-1">No portfolio yet</div>
          <p className="text-xs text-gray-400 mb-4">Add your mutual funds and investments to get started.</p>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D6FDB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add Portfolio
          </button>
        </div>
      )}

      {/* ── Goals section ── */}
      {goals.length > 0 && (
        <div>
          <button
            onClick={() => setGoalsOpen(o => !o)}
            className="w-full flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <Target size={15} className="text-[#1D6FDB]" />
              <span className="text-sm font-semibold text-gray-900">Your Goals ({goals.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/goals" onClick={e => e.stopPropagation()} className="text-xs text-[#1D6FDB] font-medium hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={13} />
              </Link>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${goalsOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {goalsOpen && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.slice(0, 4).map(g => (
              <Link
                key={g.id}
                to="/goals"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-900 leading-tight flex-1 mr-2">{g.goal_name}</div>
                  <ProbabilityPill pct={g.probability_pct} />
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      g.probability_pct >= 80 ? 'bg-teal-500' :
                      g.probability_pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(g.probability_pct, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {fmt.inr(g.target_amount)} · {new Date(g.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              </Link>
            ))}
          </div>}
        </div>
      )}

      {goals.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-sm font-semibold text-gray-600 mb-1">No goals yet</div>
          <p className="text-xs text-gray-400 mb-3">Set financial goals to track your progress.</p>
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1D6FDB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Add a Goal
          </Link>
        </div>
      )}

      {/* ── New Trade Modal ── */}
      {tradeModal && (
        <TradeModal
          portfolio={portfolio}
          onClose={() => { setTradeModal(false); setTradeFormError(''); setTradeSuccess('') }}
          onSubmit={handleSubmitTrade}
          tradeForm={tradeForm}
          setTradeForm={setTradeForm}
          tradeSubmitting={tradeSubmitting}
          tradeFormError={tradeFormError}
          advisorLinked={!!user?.advisor_id}
        />
      )}
    </div>
  )
}

// ── Instrument catalogue (from nifty_sample_dataset_with_isin.xlsx) ──────────
const INSTRUMENTS = [
  // Stocks — NIFTY 50
  { type: 'stock', category: 'NIFTY 50',         name: 'Reliance Industries Ltd',           nav: 1540,   isin: null,           code: 'RELIANCE' },
  { type: 'stock', category: 'NIFTY 50',         name: 'HDFC Bank Ltd',                     nav: 1420,   isin: null,           code: 'HDFCBANK' },
  { type: 'stock', category: 'NIFTY 50',         name: 'Infosys Ltd',                       nav: 1350,   isin: null,           code: 'INFY' },
  { type: 'stock', category: 'NIFTY 50',         name: 'TCS Ltd',                           nav: 3780,   isin: null,           code: 'TCS' },
  { type: 'stock', category: 'NIFTY 50',         name: 'ICICI Bank Ltd',                    nav: 1080,   isin: null,           code: 'ICICIBANK' },
  // Stocks — NIFTY Next 50
  { type: 'stock', category: 'NIFTY Next 50',    name: 'Zomato Ltd',                        nav: 182,    isin: null,           code: 'ZOMATO' },
  { type: 'stock', category: 'NIFTY Next 50',    name: 'DLF Ltd',                           nav: 780,    isin: null,           code: 'DLF' },
  { type: 'stock', category: 'NIFTY Next 50',    name: 'Trent Ltd',                         nav: 4100,   isin: null,           code: 'TRENT' },
  // Stocks — NIFTY 100
  { type: 'stock', category: 'NIFTY 100',        name: 'Tata Power Ltd',                    nav: 420,    isin: null,           code: 'TATAPOWER' },
  { type: 'stock', category: 'NIFTY 100',        name: 'Larsen & Toubro Ltd',               nav: 3650,   isin: null,           code: 'LT' },
  // Equity MF — Index
  { type: 'mutual_fund', category: 'NIFTY 50 Index',        name: 'HDFC Index Fund – NIFTY 50',          nav: 197.42, isin: 'INF179K01BB8', code: 'INF179K01BB8' },
  { type: 'mutual_fund', category: 'NIFTY 50 Index',        name: 'UTI Nifty 50 Index Fund',             nav: 182.15, isin: 'INF789F1AUV1', code: 'INF789F1AUV1' },
  { type: 'mutual_fund', category: 'NIFTY Next 50 Index',   name: 'ICICI Nifty Next 50 Index Fund',      nav: 36.18,  isin: 'INF109KC1KT4', code: 'INF109KC1KT4' },
  { type: 'mutual_fund', category: 'NIFTY Next 50 Index',   name: 'Nippon India Nifty Next 50',          nav: 42.77,  isin: 'INF204KB14I2', code: 'INF204KB14I2' },
  { type: 'mutual_fund', category: 'NIFTY Midcap 150 Index',name: 'Kotak Nifty Midcap 150 Index Fund',   nav: 21.77,  isin: 'INF174KA1P60', code: 'INF174KA1P60' },
  { type: 'mutual_fund', category: 'NIFTY Midcap 150 Index',name: 'Motilal Oswal Nifty Midcap 150',      nav: 28.12,  isin: 'INF247L01BP3', code: 'INF247L01BP3' },
  { type: 'mutual_fund', category: 'NIFTY Smallcap 250 Index',name:'Nippon India Nifty Smallcap 250',    nav: 18.92,  isin: 'INF204KB15I0', code: 'INF204KB15I0' },
  { type: 'mutual_fund', category: 'NIFTY Smallcap 250 Index',name:'Motilal Oswal Nifty Smallcap 250',   nav: 19.44,  isin: 'INF247L01BQ1', code: 'INF247L01BQ1' },
  { type: 'mutual_fund', category: 'NIFTY 100 Index',       name: 'ICICI Nifty 100 Index Fund',          nav: 32.55,  isin: 'INF109KC1KU2', code: 'INF109KC1KU2' },
  { type: 'mutual_fund', category: 'NIFTY 100 Index',       name: 'HDFC Nifty 100 Index Fund',           nav: 28.91,  isin: 'INF179KC1KZ6', code: 'INF179KC1KZ6' },
  // Debt MF
  { type: 'mutual_fund', category: 'Gilt',               name: 'ICICI Prudential Gilt Fund',             nav: 78.14,  isin: 'INF109K01AN8', code: 'INF109K01AN8' },
  { type: 'mutual_fund', category: 'Gilt',               name: 'HDFC Gilt Fund',                         nav: 62.77,  isin: 'INF179K01BP8', code: 'INF179K01BP8' },
  { type: 'mutual_fund', category: 'Banking & PSU',      name: 'SBI Banking & PSU Debt Fund',            nav: 29.47,  isin: 'INF200K01WZ9', code: 'INF200K01WZ9' },
  { type: 'mutual_fund', category: 'Banking & PSU',      name: 'Nippon India Banking & PSU',             nav: 32.11,  isin: 'INF204K01TN7', code: 'INF204K01TN7' },
  { type: 'mutual_fund', category: 'Corporate Bond',     name: 'HDFC Corporate Bond Fund',               nav: 24.12,  isin: 'INF179K01DW3', code: 'INF179K01DW3' },
  { type: 'mutual_fund', category: 'Corporate Bond',     name: 'ICICI Corporate Bond Fund',              nav: 32.88,  isin: 'INF109K01ZP4', code: 'INF109K01ZP4' },
  { type: 'mutual_fund', category: 'Short Duration',     name: 'ICICI Short Term Fund',                  nav: 46.83,  isin: 'INF109K01MM2', code: 'INF109K01MM2' },
  { type: 'mutual_fund', category: 'Short Duration',     name: 'HDFC Short Term Debt Fund',              nav: 41.55,  isin: 'INF179K01BQ6', code: 'INF179K01BQ6' },
  { type: 'mutual_fund', category: 'Money Market',       name: 'Aditya Birla Money Manager Fund',        nav: 311.25, isin: 'INF209K01VY3', code: 'INF209K01VY3' },
  { type: 'mutual_fund', category: 'Money Market',       name: 'Nippon India Money Market Fund',         nav: 4512.1, isin: 'INF204K01UQ4', code: 'INF204K01UQ4' },
]

const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'

function TradeModal({ portfolio, onClose, onSubmit, tradeForm, setTradeForm, tradeSubmitting, tradeFormError, advisorLinked }) {
  const [inputMode, setInputMode] = useState('amount') // 'amount' | 'units'
  const [search, setSearch] = useState('')

  const cashBalance = portfolio?.cash_balance ?? 0

  // Instruments available for sell = only those the user holds
  const heldCodes = new Set((portfolio?.holdings || []).map(h => (h.asset_code || '').toUpperCase()))

  const filteredInstruments = INSTRUMENTS.filter(ins => {
    if (tradeForm.action === 'sell' && !heldCodes.has(ins.code.toUpperCase())) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return ins.name.toLowerCase().includes(q) || ins.code.toLowerCase().includes(q) || ins.category.toLowerCase().includes(q)
  })

  // Selected instrument
  const selected = INSTRUMENTS.find(i => i.code === tradeForm.asset_code) || null
  const nav = selected?.nav ?? 0

  // Find holding for selected instrument (for sell)
  const holding = (portfolio?.holdings || []).find(h => (h.asset_code || '').toUpperCase() === tradeForm.asset_code.toUpperCase())
  const unitsHeld = holding?.units_held ?? 0
  const holdingValue = unitsHeld * nav

  // Derived quantity / value
  const quantity = Number(tradeForm.quantity) || 0
  const estimatedValue = Number(tradeForm.estimated_value) || 0

  // Minimum quantity by asset type
  const MIN_QTY = selected?.type === 'crypto' ? 0.0001 : selected?.type === 'stock' ? 1 : 0.0001
  const belowMinQty = quantity > 0 && quantity < MIN_QTY

  // Buy validations
  const buyInsufficient = tradeForm.action === 'buy' && estimatedValue > 0 && estimatedValue > cashBalance
  const buyShortfall = Math.max(0, estimatedValue - cashBalance)

  // Sell validations
  const sellExceedsHolding = tradeForm.action === 'sell' && quantity > 0 && quantity > unitsHeld
  const sellExceedsValue = tradeForm.action === 'sell' && estimatedValue > 0 && estimatedValue > holdingValue

  const canSubmit = selected && quantity > 0 && estimatedValue > 0 && !belowMinQty && !buyInsufficient && !sellExceedsHolding && !tradeSubmitting

  const handleSelectInstrument = (ins) => {
    setTradeForm(f => ({
      ...f,
      asset_code: ins.code,
      asset_type: ins.type,
      quantity: '',
      estimated_value: '',
    }))
    setSearch('')
  }

  const handleAmountChange = (val) => {
    const amt = parseFloat(val) || 0
    setTradeForm(f => ({
      ...f,
      estimated_value: val,
      quantity: nav > 0 && amt > 0 ? (amt / nav).toFixed(4) : '',
    }))
  }

  const handleUnitsChange = (val) => {
    const units = parseFloat(val) || 0
    setTradeForm(f => ({
      ...f,
      quantity: val,
      estimated_value: nav > 0 && units > 0 ? (units * nav).toFixed(2) : '',
    }))
  }

  const handleActionChange = (action) => {
    setTradeForm(f => ({ ...f, action, asset_code: '', quantity: '', estimated_value: '' }))
    setSearch('')
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-[#1D6FDB]" />
            <span className="text-base font-bold text-gray-900">New Trade</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {/* Buy / Sell toggle */}
          <div className="grid grid-cols-2 gap-2">
            {['buy', 'sell'].map(a => (
              <button
                key={a}
                onClick={() => handleActionChange(a)}
                className={`py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  tradeForm.action === a
                    ? a === 'buy' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {a === 'buy' ? '🟢 Buy' : '🔴 Sell'}
              </button>
            ))}
          </div>

          {/* Cash balance pill (buy only) */}
          {tradeForm.action === 'buy' && (
            <div className={`text-xs px-3 py-1.5 rounded-lg font-medium ${buyInsufficient ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              Available cash: {fmt.inr(cashBalance)}
              {buyInsufficient && estimatedValue > 0 && ` · Shortfall: ${fmt.inr(buyShortfall)}`}
            </div>
          )}

          {/* Instrument dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {tradeForm.action === 'sell' ? 'Select from your holdings' : 'Select instrument'}
            </label>

            {/* Search box */}
            <input
              type="text"
              placeholder={selected ? selected.name : 'Search by name, code or category…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => { if (selected) setSearch('') }}
              className={INPUT_CLS}
            />

            {/* Dropdown list */}
            {(search.trim() || !selected) && filteredInstruments.length > 0 && (
              <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-44 overflow-y-auto">
                {filteredInstruments.map(ins => (
                  <button
                    key={ins.code}
                    onClick={() => handleSelectInstrument(ins)}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 border-b border-gray-50 last:border-0 ${tradeForm.asset_code === ins.code ? 'bg-blue-50' : ''}`}
                  >
                    <div>
                      <span className="font-medium text-gray-900">{ins.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{ins.code}</span>
                      <div className="text-xs text-gray-400">{ins.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-gray-700">{fmt.inr(ins.nav)}</div>
                      <div className="text-[10px] text-gray-400">{ins.type === 'stock' ? 'per share' : 'NAV'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {tradeForm.action === 'sell' && filteredInstruments.length === 0 && !search && (
              <p className="text-xs text-gray-400 mt-1 px-1">No holdings found. Add holdings in your portfolio first.</p>
            )}
          </div>

          {/* Selected instrument summary */}
          {selected && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.category} · {selected.code}</p>
                {tradeForm.action === 'sell' && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    You hold: <span className="font-medium text-gray-700">{unitsHeld.toFixed(4)} units</span>
                    <span className="text-gray-400"> (≈ {fmt.inr(holdingValue)})</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{fmt.inr(selected.nav)}</p>
                <p className="text-xs text-gray-400">{selected.type === 'stock' ? 'per share' : 'NAV'}</p>
              </div>
            </div>
          )}

          {/* Input mode toggle + amount/units fields */}
          {selected && (
            <div>
              <div className="flex gap-2 mb-3">
                {['amount', 'units'].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setInputMode(m)
                      setTradeForm(f => ({ ...f, quantity: '', estimated_value: '' }))
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      inputMode === m ? 'border-[#1D6FDB] bg-blue-50 text-[#1D6FDB]' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {m === 'amount' ? 'By Amount (₹)' : 'By Units'}
                  </button>
                ))}
              </div>

              {inputMode === 'amount' ? (
                <div>
                  <input
                    type="number"
                    placeholder="Amount in ₹"
                    value={tradeForm.estimated_value}
                    onChange={e => handleAmountChange(e.target.value)}
                    className={INPUT_CLS}
                    min="0"
                  />
                  {quantity > 0 && (
                    <p className="text-xs text-gray-400 mt-1 px-1">≈ {Number(tradeForm.quantity).toFixed(4)} units @ {fmt.inr(nav)}</p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    placeholder={`Number of ${selected.type === 'stock' ? 'shares' : 'units'}`}
                    value={tradeForm.quantity}
                    onChange={e => handleUnitsChange(e.target.value)}
                    className={INPUT_CLS}
                    min="0"
                  />
                  {estimatedValue > 0 && (
                    <p className="text-xs text-gray-400 mt-1 px-1">≈ {fmt.inr(estimatedValue)} @ {fmt.inr(nav)}</p>
                  )}
                </div>
              )}

              {/* Sell over-holding warning */}
              {belowMinQty && (
                <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 mt-2">
                  ⚠ Minimum is {MIN_QTY} {selected?.type === 'stock' ? 'unit (whole shares only)' : 'units'} for {selected?.type}.
                </p>
              )}
              {tradeForm.action === 'sell' && sellExceedsHolding && (
                <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 mt-2">
                  ⚠ You only hold {unitsHeld.toFixed(4)} units. Reduce quantity.
                </p>
              )}
              {tradeForm.action === 'sell' && sellExceedsValue && !sellExceedsHolding && (
                <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 mt-2">
                  ⚠ Amount exceeds holding value of {fmt.inr(holdingValue)}.
                </p>
              )}

              {/* Buy cash warning */}
              {tradeForm.action === 'buy' && buyInsufficient && (
                <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 mt-2">
                  ⚠ Insufficient cash. Add {fmt.inr(buyShortfall)} to proceed.
                </p>
              )}
            </div>
          )}

          {/* Note */}
          <input
            type="text"
            placeholder="Note (optional)"
            value={tradeForm.client_note}
            onChange={e => setTradeForm(f => ({ ...f, client_note: e.target.value }))}
            className={INPUT_CLS}
          />

          {tradeFormError && (
            <div className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">⚠️ {tradeFormError}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 space-y-2">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="w-full py-2.5 bg-[#1D6FDB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {tradeSubmitting ? 'Submitting…' : `${tradeForm.action === 'buy' ? 'Buy' : 'Sell'} ${selected ? selected.name.split(' ')[0] : ''}`.trim() || 'Submit Trade'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            {advisorLinked ? 'Trade settles immediately. Your advisor is notified.' : 'Trade settles immediately.'}
          </p>
        </div>
      </div>
    </div>
  )
}
