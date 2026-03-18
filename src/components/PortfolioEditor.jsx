import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, ChevronDown } from 'lucide-react'
import { savePortfolio, fmt } from '../api/personal'

const FUND_CATEGORIES = [
  'Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'Large & Mid Cap',
  'ELSS', 'Index Fund', 'Sectoral', 'Thematic',
  'Short Duration', 'Corporate Bond', 'Gilt', 'Liquid', 'Debt',
  'Hybrid', 'Balanced Advantage', 'Other',
]

const FUND_HOUSES = [
  'HDFC MF', 'SBI MF', 'ICICI Prudential', 'Axis MF', 'Kotak MF',
  'Nippon India', 'Mirae Asset', 'Aditya Birla', 'DSP MF', 'UTI MF',
  'Franklin Templeton', 'Tata MF', 'Edelweiss', 'Motilal Oswal', 'Other',
]

const EMPTY_HOLDING = { fund_name: '', fund_category: 'Flexi Cap', fund_house: 'Other', current_value: '', target_pct: '' }

function totalValue(holdings) {
  return holdings.reduce((s, h) => s + (parseFloat(h.current_value) || 0), 0)
}

function deriveAllocations(holdings) {
  const total = totalValue(holdings)
  if (total === 0) return { equity_pct: 0, debt_pct: 0, cash_pct: 0 }
  const EQUITY_CATS = new Set(['Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'Large & Mid Cap', 'ELSS', 'Index Fund', 'Sectoral', 'Thematic', 'Hybrid'])
  const DEBT_CATS = new Set(['Short Duration', 'Corporate Bond', 'Gilt', 'Debt', 'Balanced Advantage'])
  const CASH_CATS = new Set(['Liquid'])
  let equity = 0, debt = 0, cash = 0
  holdings.forEach(h => {
    const v = parseFloat(h.current_value) || 0
    if (EQUITY_CATS.has(h.fund_category)) equity += v
    else if (DEBT_CATS.has(h.fund_category)) debt += v
    else if (CASH_CATS.has(h.fund_category)) cash += v
    else equity += v
  })
  return {
    equity_pct: (equity / total) * 100,
    debt_pct: (debt / total) * 100,
    cash_pct: (cash / total) * 100,
  }
}

export default function PortfolioEditor({ portfolio, onClose, onSaved }) {
  const [holdings, setHoldings] = useState(
    portfolio?.holdings?.length
      ? portfolio.holdings.map(h => ({
          fund_name: h.fund_name,
          fund_category: h.fund_category,
          fund_house: h.fund_house,
          current_value: String(h.current_value),
          target_pct: String(h.target_pct),
        }))
      : [{ ...EMPTY_HOLDING }]
  )
  const [targetEquity, setTargetEquity] = useState(String(portfolio?.target_equity_pct ?? 60))
  const [targetDebt, setTargetDebt] = useState(String(portfolio?.target_debt_pct ?? 30))
  const [targetCash, setTargetCash] = useState(String(portfolio?.target_cash_pct ?? 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const alloc = deriveAllocations(holdings)
  const total = totalValue(holdings)

  function updateHolding(i, field, value) {
    setHoldings(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: value } : h))
  }

  function addHolding() {
    setHoldings(prev => [...prev, { ...EMPTY_HOLDING }])
  }

  function removeHolding(i) {
    setHoldings(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setError('')
    const valid = holdings.filter(h => h.fund_name.trim() && parseFloat(h.current_value) > 0)
    if (valid.length === 0) { setError('Add at least one holding with a name and value.'); return }

    const tEq = parseFloat(targetEquity) || 0
    const tDt = parseFloat(targetDebt) || 0
    const tCa = parseFloat(targetCash) || 0
    if (Math.round(tEq + tDt + tCa) !== 100) { setError('Target allocations must add up to 100%.'); return }

    setSaving(true)
    try {
      const totalVal = totalValue(valid)
      const payload = {
        total_value: totalVal,
        equity_pct: parseFloat(alloc.equity_pct.toFixed(1)),
        debt_pct: parseFloat(alloc.debt_pct.toFixed(1)),
        cash_pct: parseFloat(alloc.cash_pct.toFixed(1)),
        target_equity_pct: tEq,
        target_debt_pct: tDt,
        target_cash_pct: tCa,
        holdings: valid.map(h => ({
          fund_name: h.fund_name.trim(),
          fund_category: h.fund_category,
          fund_house: h.fund_house,
          current_value: parseFloat(h.current_value),
          target_pct: parseFloat(h.target_pct) || parseFloat(((parseFloat(h.current_value) / totalVal) * 100).toFixed(1)),
          current_pct: parseFloat(((parseFloat(h.current_value) / totalVal) * 100).toFixed(1)),
        })),
      }
      await savePortfolio(payload)
      onSaved()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900">Edit Portfolio</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-32">
        {/* Portfolio total */}
        <div className="bg-navy-950 text-white rounded-2xl p-4">
          <div className="text-xs text-navy-300 uppercase tracking-wider mb-0.5">Total Portfolio Value</div>
          <div className="text-2xl font-bold tabular-nums">{fmt.inr(total)}</div>
          <div className="flex gap-4 mt-2 text-xs text-navy-300">
            <span>Equity {alloc.equity_pct.toFixed(0)}%</span>
            <span>Debt {alloc.debt_pct.toFixed(0)}%</span>
            <span>Cash {alloc.cash_pct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Holdings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Holdings</h3>
            <button
              onClick={addHolding}
              className="flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-900 transition-colors"
            >
              <Plus size={13} /> Add Fund
            </button>
          </div>

          <div className="space-y-3">
            {holdings.map((h, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fund {i + 1}</span>
                  {holdings.length > 1 && (
                    <button onClick={() => removeHolding(i)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fund Name</label>
                  <input
                    type="text"
                    value={h.fund_name}
                    onChange={e => updateHolding(i, 'fund_name', e.target.value)}
                    placeholder="e.g. HDFC Flexi Cap Fund"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <div className="relative">
                      <select
                        value={h.fund_category}
                        onChange={e => updateHolding(i, 'fund_category', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white appearance-none pr-7"
                      >
                        {FUND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fund House</label>
                    <div className="relative">
                      <select
                        value={h.fund_house}
                        onChange={e => updateHolding(i, 'fund_house', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white appearance-none pr-7"
                      >
                        {FUND_HOUSES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Value (₹)</label>
                    <input
                      type="number"
                      value={h.current_value}
                      onChange={e => updateHolding(i, 'current_value', e.target.value)}
                      placeholder="500000"
                      min="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Target % <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="number"
                      value={h.target_pct}
                      onChange={e => updateHolding(i, 'target_pct', e.target.value)}
                      placeholder="auto"
                      min="0"
                      max="100"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target allocations */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Target Allocation</h3>
          <p className="text-xs text-gray-400 mb-3">Must add up to 100%</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Equity %', value: targetEquity, set: setTargetEquity },
              { label: 'Debt %', value: targetDebt, set: setTargetDebt },
              { label: 'Cash %', value: targetCash, set: setTargetCash },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={e => set(e.target.value)}
                  min="0" max="100"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
                />
              </div>
            ))}
          </div>
          <div className={`mt-2 text-xs font-medium ${Math.round(parseFloat(targetEquity||0)+parseFloat(targetDebt||0)+parseFloat(targetCash||0)) === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
            Total: {(parseFloat(targetEquity||0)+parseFloat(targetDebt||0)+parseFloat(targetCash||0)).toFixed(0)}%
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">{error}</div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <span className="animate-spin">⟳</span> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Portfolio'}
        </button>
      </div>
    </div>
  )
}
