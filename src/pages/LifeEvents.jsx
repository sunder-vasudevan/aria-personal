import { useState, useEffect } from 'react'
import { getLifeEvents, createLifeEvent, updateLifeEvent, deleteLifeEvent } from '../api/personal'
import { CalendarHeart, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

const EVENT_TYPES = [
  { value: 'job_change', label: '💼 Job Change' },
  { value: 'marriage', label: '💍 Marriage' },
  { value: 'new_child', label: '👶 New Child' },
  { value: 'inheritance', label: '🏦 Inheritance' },
  { value: 'home_purchase', label: '🏠 Home Purchase' },
  { value: 'medical', label: '🏥 Medical Event' },
  { value: 'education', label: '🎓 Education' },
  { value: 'retirement', label: '🌅 Retirement' },
  { value: 'other', label: '📌 Other' },
]

const INPUT = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-300'

function EventForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(initial || { event_type: 'job_change', event_date: '', notes: '' })
  const set = (f, v) => setForm(s => ({ ...s, [f]: v }))
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Event Type *</label>
        <select value={form.event_type} onChange={e => set('event_type', e.target.value)} className={INPUT}>
          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
        <input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} className={INPUT} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Optional details…" className={`${INPUT} resize-none`} />
      </div>
      {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="button" disabled={saving} onClick={() => onSave(form)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-navy-950 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 disabled:opacity-60 transition-colors">
          {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : 'Save'}
        </button>
      </div>
    </div>
  )
}

function eventEmoji(type) {
  return EVENT_TYPES.find(t => t.value === type)?.label?.split(' ')[0] || '📌'
}
function eventLabel(type) {
  return EVENT_TYPES.find(t => t.value === type)?.label?.split(' ').slice(1).join(' ') || type.replace(/_/g, ' ')
}

export default function LifeEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const refresh = () => getLifeEvents().then(setEvents)
  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  const handleSaveNew = async (form) => {
    if (!form.event_date) { setFormError('Date is required.'); return }
    setSaving(true); setFormError(null)
    try { await createLifeEvent(form); setAdding(false); refresh() }
    catch { setFormError('Failed to save.') }
    finally { setSaving(false) }
  }

  const handleSaveEdit = async (form) => {
    if (!form.event_date) { setFormError('Date is required.'); return }
    setSaving(true); setFormError(null)
    try { await updateLifeEvent(editingId, form); setEditingId(null); refresh() }
    catch { setFormError('Failed to save.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await deleteLifeEvent(id); setPendingDeleteId(null); refresh()
  }

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-8 bg-gray-200 rounded-xl w-40" /><div className="h-24 bg-gray-200 rounded-2xl" /></div>

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Life Events</h1>
      </div>
      <p className="text-sm text-gray-500">Log major life events to help ARIA give you better context.</p>

      {events.length === 0 && !adding && (
        <div className="flex flex-col items-center py-16 text-center bg-white rounded-2xl border border-gray-200">
          <CalendarHeart size={32} className="text-gray-300 mb-3" />
          <div className="text-sm font-semibold text-gray-600 mb-1">No life events recorded</div>
          <p className="text-xs text-gray-400 mb-5">Log a job change, marriage, or other milestone.</p>
        </div>
      )}

      {events.map(e => (
        <div key={e.id} className="bg-white rounded-2xl border border-gray-200 shadow-card p-4">
          {editingId === e.id ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Edit Event</span>
                <button onClick={() => { setEditingId(null); setFormError(null) }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={13} /></button>
              </div>
              <EventForm initial={{ event_type: e.event_type, event_date: e.event_date, notes: e.notes || '' }} onSave={handleSaveEdit} onCancel={() => { setEditingId(null); setFormError(null) }} saving={saving} error={formError} />
            </>
          ) : (
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{eventEmoji(e.event_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{eventLabel(e.event_type)}</div>
                    <div className="text-xs text-gray-400">{new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    {e.notes && <div className="text-xs text-gray-600 mt-1">{e.notes}</div>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {pendingDeleteId === e.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-600">Delete?</span>
                        <button onClick={() => handleDelete(e.id)} className="text-red-600 font-medium hover:underline">Yes</button>
                        <button onClick={() => setPendingDeleteId(null)} className="text-gray-500 hover:underline">No</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(e.id); setFormError(null) }} className="p-1.5 text-gray-300 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"><Pencil size={12} /></button>
                        <button onClick={() => setPendingDeleteId(e.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={12} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding && (
        <div className="bg-white rounded-2xl border border-dashed border-navy-300 shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Log Event</span>
            <button onClick={() => { setAdding(false); setFormError(null) }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={13} /></button>
          </div>
          <EventForm initial={null} onSave={handleSaveNew} onCancel={() => { setAdding(false); setFormError(null) }} saving={saving} error={formError} />
        </div>
      )}

      {!adding && (
        <button onClick={() => { setAdding(true); setFormError(null) }}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-2xl text-sm font-medium text-gray-500 hover:border-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-all">
          <Plus size={14} /> Log Event
        </button>
      )}
    </div>
  )
}
