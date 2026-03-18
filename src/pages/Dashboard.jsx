import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../auth/useAuth'
import { getPortfolio, getGoals, fmt } from '../api/personal'
import { TrendingUp, Target, Plus, ChevronRight, AlertCircle } from 'lucide-react'

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

export default function Dashboard() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPortfolio(), getGoals()])
      .then(([p, g]) => { setPortfolio(p); setGoals(g) })
      .finally(() => setLoading(false))
  }, [])

  const chartData = portfolio?.holdings?.map(h => ({
    name: h.fund_name,
    value: h.current_value,
    color: CATEGORY_COLORS[h.fund_category] || DEFAULT_COLOR,
  })) || []

  const urgentGoals = goals.filter(g => g.probability_pct < 70)

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-48" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-32 bg-gray-200 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.display_name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's how your finances look today.</p>
      </div>

      {/* Portfolio summary */}
      {portfolio ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Portfolio</div>
              <div className="text-3xl font-bold text-gray-900 tabular-nums mt-0.5">{fmt.inr(portfolio.total_value)}</div>
            </div>
            <Link to="/goals" className="flex items-center gap-1 text-xs font-medium text-navy-600 hover:underline">
              <TrendingUp size={13} /> View Goals
            </Link>
          </div>

          {/* Donut chart */}
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

          {/* Holdings list */}
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
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <div className="text-3xl mb-3">📊</div>
          <div className="text-sm font-semibold text-gray-600 mb-1">No portfolio yet</div>
          <p className="text-xs text-gray-400 mb-4">Add your mutual funds and investments to get started.</p>
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-950 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
          >
            <Plus size={14} /> Add Portfolio
          </Link>
        </div>
      )}

      {/* Urgent goals */}
      {urgentGoals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={15} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Goals needing attention</span>
          </div>
          <div className="space-y-2">
            {urgentGoals.map(g => (
              <Link key={g.id} to="/goals" className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-amber-100 hover:border-amber-300 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{g.goal_name}</div>
                  <div className="text-xs text-gray-500">{fmt.inr(g.target_amount)} · {new Date(g.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600 tabular-nums">{g.probability_pct.toFixed(0)}%</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Goals summary */}
      {goals.length > 0 && urgentGoals.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-navy-600" />
              <span className="text-sm font-semibold text-gray-900">Goals on track</span>
            </div>
            <Link to="/goals" className="text-xs text-navy-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-1.5">
            {goals.slice(0, 3).map(g => (
              <div key={g.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{g.goal_name}</span>
                <span className="font-bold text-emerald-600 tabular-nums">{g.probability_pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
