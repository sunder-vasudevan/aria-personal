import { useState, useEffect, useCallback, useRef } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal, getGoalProjection, simulateGoal, fmt } from '../api/personal'
import { Target, AlertCircle, TrendingUp, TrendingDown, SlidersHorizontal, Plus, Pencil, Trash2, X, Loader2, Info } from 'lucide-react'

function ProbabilityRing({ pct }) {
  const r = 22, circ = 2 * Math.PI * r, filled = (pct / 100) * circ
  const color = pct >= 80 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444'
  const textColor = pct >= 80 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4" />
          <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${textColor}`}>{pct.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-1 leading-tight">chance of<br/>reaching goal</p>
    </div>
  )
}

function SliderControl({ label, min, max, step, value, onChange, displayValue, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-700">{label}</div>
          {hint && <div className="text-xs text-gray-400">{hint}</div>}
        </div>
        <span className="text-sm font-bold text-navy-950 tabular-nums">{displayValue}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-navy-950 h-1.5" />
    </div>
  )
}

const INPUT = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-300'

function GoalForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial || { goal_name: '', target_amount: '', target_date: '', monthly_sip: '' })
  const [sim, setSim] = useState(null)
  const [simLoading, setSimLoading] = useState(false)
  const simDebounce = useRef(null)

  const set = (f, v) => setForm(s => ({ ...s, [f]: v }))

  const runSim = useCallback((f) => {
    const amount = parseFloat(f.target_amount)
    const sip = parseFloat(f.monthly_sip) || 0
    if (!amount || amount <= 0 || !f.target_date) { setSim(null); return }
    clearTimeout(simDebounce.current)
    simDebounce.current = setTimeout(async () => {
      setSimLoading(true)
      try {
        const result = await simulateGoal({ target_amount: amount, target_date: f.target_date, monthly_sip: sip })
        setSim(result)
      } catch { setSim(null) } finally { setSimLoading(false) }
    }, 600)
  }, [])

  const handleChange = (f, v) => {
    const next = { ...form, [f]: v }
    setForm(next)
    runSim(next)
  }

  const pct = sim?.probability_pct ?? null
  const color = pct == null ? '#9ca3af' : pct >= 80 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444'
  const textColor = pct == null ? 'text-gray-400' : pct >= 80 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'
  const r = 22, circ = 2 * Math.PI * r, filled = pct != null ? (pct / 100) * circ : 0

  return (
    <div className="border-t border-gray-100 mt-3 pt-3 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Goal Name *</label>
        <input type="text" value={form.goal_name} onChange={e => set('goal_name', e.target.value)} placeholder="e.g. Retirement" className={INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Target Amount (₹) *</label>
          <input type="number" min="0" value={form.target_amount} onChange={e => handleChange('target_amount', e.target.value)} placeholder="e.g. 2000000" className={INPUT} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Target Date *</label>
          <input type="date" value={form.target_date} onChange={e => handleChange('target_date', e.target.value)} className={INPUT} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Monthly SIP (₹)</label>
        <input type="number" min="0" value={form.monthly_sip} onChange={e => handleChange('monthly_sip', e.target.value)} placeholder="e.g. 10000" className={INPUT} />
      </div>

      {/* Live what-if preview */}
      {(sim || simLoading) && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-600">Live Preview</span>
            {simLoading && <Loader2 size={12} className="text-navy-500 animate-spin" />}
          </div>
          {sim && (
            <div className="px-3 py-3 bg-white flex items-center gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4" />
                    <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
                      strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${textColor}`}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-1 leading-tight">success<br/>chance</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Inflation-adj. target</span>
                <span className="tabular-nums text-right font-semibold text-navy-700">{fmt.inr(sim.real_target)}</span>
                <span className="text-gray-500">Required SIP</span>
                <span className={`tabular-nums text-right font-bold ${sim.required_sip > (parseFloat(form.monthly_sip) || 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {fmt.inr(sim.required_sip)}/mo
                </span>
                {sim.required_sip > (parseFloat(form.monthly_sip) || 0) && (
                  <>
                    <span className="text-gray-500">Gap</span>
                    <span className="tabular-nums text-right font-semibold text-red-600">
                      +{fmt.inr(sim.required_sip - (parseFloat(form.monthly_sip) || 0))}/mo
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="button" disabled={saving} onClick={() => onSave(form)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-navy-950 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 transition-colors">
          {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : 'Save Goal'}
        </button>
      </div>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('mode1')
  const [sipDelta, setSipDelta] = useState(0)
  const [returnRate, setReturnRate] = useState(12)
  const [yearsDelta, setYearsDelta] = useState(0)
  const [inflationRate, setInflationRate] = useState(6)
  const [projections, setProjections] = useState([])
  const [projLoading, setProjLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => { getGoals().then(setGoals).finally(() => setLoading(false)) }, [])

  const projMap = Object.fromEntries(projections.map(p => [p.goal_id, p]))

  const runProjection = useCallback(async (params) => {
    if (!goals.length) return
    setProjLoading(true)
    try {
      const data = await getGoalProjection(params)
      setProjections(data)
    } catch { /* silent */ } finally { setProjLoading(false) }
  }, [goals])

  useEffect(() => {
    if (scenarioOpen && goals.length) runProjection({ sip_delta: sipDelta, return_rate: returnRate / 100, years_delta: yearsDelta, inflation_rate: inflationRate / 100 })
  }, [scenarioOpen])

  const scheduleRun = (overrides = {}) => {
    if (!scenarioOpen) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runProjection({
        sip_delta: overrides.sipDelta ?? sipDelta,
        return_rate: (overrides.returnRate ?? returnRate) / 100,
        years_delta: overrides.yearsDelta ?? yearsDelta,
        inflation_rate: (overrides.inflationRate ?? inflationRate) / 100,
      })
    }, 500)
  }

  const handleSlider = (setter, key, val) => { setter(val); scheduleRun({ [key]: val }) }

  const refresh = () => getGoals().then(setGoals)

  const handleSaveNew = async (form) => {
    if (!form.goal_name?.trim() || !form.target_amount || !form.target_date) { setFormError('Name, amount, and date required.'); return }
    setFormSaving(true); setFormError(null)
    try { await createGoal({ goal_name: form.goal_name.trim(), target_amount: Number(form.target_amount), target_date: form.target_date, monthly_sip: Number(form.monthly_sip) || 0 }); setAdding(false); refresh() }
    catch { setFormError('Failed to save goal.') }
    finally { setFormSaving(false) }
  }

  const handleSaveEdit = async (form) => {
    if (!form.goal_name?.trim() || !form.target_amount || !form.target_date) { setFormError('Name, amount, and date required.'); return }
    setFormSaving(true); setFormError(null)
    try { await updateGoal(editingId, { goal_name: form.goal_name.trim(), target_amount: Number(form.target_amount), target_date: form.target_date, monthly_sip: Number(form.monthly_sip) || 0 }); setEditingId(null); refresh() }
    catch { setFormError('Failed to save goal.') }
    finally { setFormSaving(false) }
  }

  const handleDelete = async (id) => {
    await deleteGoal(id); setPendingDeleteId(null); refresh()
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-2xl" /><div className="h-32 bg-gray-200 rounded-2xl" /></div>

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Goals</h1>
      </div>

      {/* What-if panel */}
      {goals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
          <button onClick={() => setScenarioOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-navy-600" />
              <span className="text-sm font-semibold text-gray-900">What-if Scenario</span>
              {projLoading && <Loader2 size={13} className="text-navy-500 animate-spin" />}
            </div>
            <span className="text-xs text-gray-400">{scenarioOpen ? 'Collapse ↑' : 'Expand ↓'}</span>
          </button>
          {scenarioOpen && (
            <div className="px-5 pb-5 border-t border-gray-100">
              <div className="flex gap-1 pt-4 pb-3">
                {['mode1', 'mode2'].map(m => (
                  <button key={m} onClick={() => setActiveTab(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === m ? 'bg-navy-950 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {m === 'mode1' ? 'Will I achieve it?' : 'What SIP do I need?'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {activeTab === 'mode1' && (
                  <SliderControl label="SIP delta" min={-50000} max={50000} step={5000} value={sipDelta}
                    onChange={v => handleSlider(setSipDelta, 'sipDelta', v)}
                    displayValue={`${sipDelta > 0 ? '+' : ''}${fmt.inr(sipDelta)}`} hint="±₹50k/month" />
                )}
                <SliderControl label="Return rate" min={6} max={18} step={1} value={returnRate}
                  onChange={v => handleSlider(setReturnRate, 'returnRate', v)}
                  displayValue={`${returnRate}%`} hint="6–18% annual" />
                {activeTab === 'mode1' && (
                  <SliderControl label="Timeline shift" min={-2} max={5} step={1} value={yearsDelta}
                    onChange={v => handleSlider(setYearsDelta, 'yearsDelta', v)}
                    displayValue={`${yearsDelta > 0 ? '+' : ''}${yearsDelta}y`} hint="-2 to +5 years" />
                )}
                <SliderControl label="Inflation" min={3} max={10} step={1} value={inflationRate}
                  onChange={v => handleSlider(setInflationRate, 'inflationRate', v)}
                  displayValue={`${inflationRate}%`} hint="3–10% annual" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && !adding && (
        <div className="flex flex-col items-center py-16 text-center bg-white rounded-2xl border border-gray-200">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-sm font-semibold text-gray-600 mb-1">No goals yet</div>
          <p className="text-xs text-gray-400 mb-5">Add a goal to track your savings and get a probability estimate.</p>
        </div>
      )}

      {/* Goal cards */}
      {goals.map(g => {
        const urgent = g.probability_pct < 70
        const proj = projMap[g.id]
        const delta = proj ? proj.projected_probability_pct - proj.base_probability_pct : null
        const isEditing = editingId === g.id
        const isPendingDelete = pendingDeleteId === g.id
        return (
          <div key={g.id} className={`bg-white rounded-2xl border shadow-card overflow-hidden ${urgent ? 'border-red-200' : 'border-gray-200'}`}>
            <div className={`h-1 ${urgent ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-navy-500'}`} />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <ProbabilityRing pct={g.probability_pct} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {urgent ? <AlertCircle size={13} className="text-red-500" /> : <Target size={13} className="text-navy-500" />}
                        <span className="text-sm font-bold text-gray-900">{g.goal_name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {fmt.inr(g.target_amount)} · {new Date(g.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        {isPendingDelete ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-red-600">Delete?</span>
                            <button onClick={() => handleDelete(g.id)} className="text-red-600 font-medium hover:underline">Yes</button>
                            <button onClick={() => setPendingDeleteId(null)} className="text-gray-500 hover:underline">No</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(g.id); setFormError(null) }} className="p-1.5 text-gray-300 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors" aria-label="Edit goal"><Pencil size={12} /></button>
                            <button onClick={() => setPendingDeleteId(g.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete goal"><Trash2 size={12} /></button>
                          </>
                        )}
                      </div>
                    )}
                    {isEditing && (
                      <button onClick={() => { setEditingId(null); setFormError(null) }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg" aria-label="Cancel edit"><X size={12} /></button>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="text-xs text-gray-500 mt-2">
                      SIP: <span className="font-semibold text-gray-800">{fmt.inr(g.monthly_sip)}/mo</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && <GoalForm initial={{ goal_name: g.goal_name, target_amount: g.target_amount, target_date: g.target_date, monthly_sip: g.monthly_sip }} onSave={handleSaveEdit} onCancel={() => { setEditingId(null); setFormError(null) }} saving={formSaving} error={formError} />}

              {/* Mode 1 result */}
              {!isEditing && proj && activeTab === 'mode1' && scenarioOpen && (
                <div className={`mt-3 rounded-xl border overflow-hidden ${delta >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
                  <div className={`px-3 py-2 flex items-center justify-between ${delta >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-1.5">{delta >= 0 ? <TrendingUp size={13} className="text-emerald-600" /> : <TrendingDown size={13} className="text-red-500" />}<span className="text-xs font-semibold text-gray-700">Scenario</span></div>
                    <span className={`font-bold text-sm ${delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{proj.projected_probability_pct.toFixed(1)}% <span className="text-xs font-medium">({delta >= 0 ? '+' : ''}{delta.toFixed(1)}pts)</span></span>
                  </div>
                  <div className="px-3 py-2 bg-white grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-500">Target today</span><span className="tabular-nums text-right font-semibold">{fmt.inr(proj.target_amount)}</span>
                    <span className="text-gray-500">Inflation-adj. target</span><span className="tabular-nums text-right font-semibold text-navy-700">{fmt.inr(proj.real_target)}</span>
                    <span className="text-gray-500">Projected corpus</span><span className="tabular-nums text-right font-semibold">{fmt.inr(proj.median_corpus)}</span>
                    <span className="text-gray-500">In today's ₹</span><span className="tabular-nums text-right font-semibold">{fmt.inr(proj.median_corpus_real)}</span>
                  </div>
                </div>
              )}

              {/* Mode 2 result */}
              {!isEditing && proj && activeTab === 'mode2' && scenarioOpen && (
                <div className="mt-3 rounded-xl border border-navy-200 overflow-hidden">
                  <div className="px-3 py-2 bg-navy-50 flex items-center gap-1.5"><Info size={13} className="text-navy-600" /><span className="text-xs font-semibold text-navy-900">SIP for 80% success</span></div>
                  <div className="px-3 py-2 bg-white grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-500">Your current SIP</span><span className="tabular-nums text-right font-semibold">{fmt.inr(g.monthly_sip)}/mo</span>
                    <span className="text-gray-500">Required SIP</span><span className="tabular-nums text-right font-bold text-navy-700">{fmt.inr(proj.required_sip ?? 0)}/mo</span>
                    {proj.required_sip != null && (<>
                      <span className="text-gray-500">Gap</span>
                      <span className={`tabular-nums text-right font-semibold ${proj.required_sip > g.monthly_sip ? 'text-red-600' : 'text-emerald-600'}`}>
                        {proj.required_sip > g.monthly_sip ? `+${fmt.inr(proj.required_sip - g.monthly_sip)}/mo needed` : `${fmt.inr(g.monthly_sip - proj.required_sip)}/mo surplus`}
                      </span>
                    </>)}
                    <span className="text-gray-500">Inflation-adj. target</span><span className="tabular-nums text-right font-semibold text-navy-700">{fmt.inr(proj.real_target)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Add Goal form */}
      {adding && (
        <div className="bg-white rounded-2xl border border-dashed border-navy-300 shadow-card p-4">
          <div className="text-sm font-semibold text-gray-700 mb-1">New Goal</div>
          <GoalForm initial={null} onSave={handleSaveNew} onCancel={() => { setAdding(false); setFormError(null) }} saving={formSaving} error={formError} />
        </div>
      )}

      {!adding && (
        <button onClick={() => { setAdding(true); setFormError(null) }}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-2xl text-sm font-medium text-gray-500 hover:border-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-all">
          <Plus size={14} /> Add Goal
        </button>
      )}
    </div>
  )
}
