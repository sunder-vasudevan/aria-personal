import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../auth/useAuth'
import { getPortfolio, getGoals, getMyTrades, approveTrade, rejectTrade, fmt } from '../api/personal'
import { TrendingUp, Target, Plus, ChevronRight, AlertCircle, Pencil, CheckCircle, X } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [approvingTradeId, setApprovingTradeId] = useState(null)
  const [tradeError, setTradeError] = useState('')
  const [advisorBannerDismissed, setAdvisorBannerDismissed] = useState(() => {
    return localStorage.getItem('aria_advisor_banner_dismissed') === '1'
  })

  function load() {
    return Promise.all([getPortfolio(), getGoals(), getMyTrades()])
      .then(([p, g, t]) => { setPortfolio(p); setGoals(g); setTrades(t) })
      .catch(err => { console.error(err); setTrades([]) })
      .finally(() => setLoading(false))
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

      {/* ── Pending Trades ── */}
      {trades.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-900 mb-3">
            📊 You have {trades.filter(t => t.status === 'pending_approval').length} pending trade{trades.filter(t => t.status === 'pending_approval').length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-2">
            {trades.filter(t => t.status === 'pending_approval').map(trade => (
              <div key={trade.id} className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-amber-900 mb-0.5">
                    {trade.action === 'buy' ? '🟢 Buy' : '🔴 Sell'} {trade.asset_code} ({trade.asset_type.replace(/_/g, ' ')})
                  </div>
                  <div className="text-xs text-amber-700">
                    {trade.quantity} units · {fmt.inr(trade.estimated_value)}
                  </div>
                  {trade.asset_type === 'crypto' && (
                    <div className="text-xs text-amber-600 mt-1">
                      ⚠️ After approval, execute on your exchange (Coinbase/Kraken/MetaMask)
                    </div>
                  )}
                  {trade.asset_type === 'mutual_fund' && (
                    <div className="text-xs text-amber-600 mt-1">
                      ⏳ Your advisor will process this in 1-2 business days
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0 ml-3">
                  <button
                    onClick={() => handleApproveTrade(trade)}
                    disabled={approvingTradeId === trade.id}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={12} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectTrade(trade)}
                    disabled={approvingTradeId === trade.id}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-gray-400 rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-colors"
                  >
                    <X size={12} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Portfolio summary ── */}
      {portfolio ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Portfolio</div>
              <div className="text-3xl font-bold text-gray-900 tabular-nums mt-0.5">{fmt.inr(portfolio.total_value)}</div>
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

          <div className="space-y-2">
            {portfolio.holdings.map(h => (
              <div key={h.id} className="flex items-center justify-between py-2 border-t border-gray-50 first:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{h.fund_name}</div>
                  <div className="text-xs text-gray-400">{h.fund_house} · {h.fund_category}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="text-sm font-bold text-gray-900 tabular-nums">{fmt.inr(h.current_value)}</div>
                  <div className="text-xs text-gray-400 tabular-nums">{h.current_pct.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-[#1D6FDB]" />
              <span className="text-sm font-semibold text-gray-900">Your Goals</span>
            </div>
            <Link to="/goals" className="text-xs text-[#1D6FDB] font-medium hover:underline flex items-center gap-0.5">
              View all <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>
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
    </div>
  )
}
