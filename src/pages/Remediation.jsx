import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ASSESSMENT_CATEGORIES, SEVERITY_ORDER } from '../lib/constants'
import Navbar from '../components/Navbar'
import { SeverityBadge } from '../components/Badge'
import Spinner from '../components/Spinner'

const STATUS_CYCLE = { open: 'in_progress', in_progress: 'resolved', resolved: 'open' }
const STATUS_ICONS = {
  open: <Circle size={18} className="text-red-400" />,
  in_progress: <Clock size={18} className="text-amber-500" />,
  resolved: <CheckCircle2 size={18} className="text-green-500" />,
}
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }

export default function Remediation() {
  const { org } = useAuth()
  const [gaps, setGaps] = useState([])
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [saving, setSaving] = useState({})

  useEffect(() => {
    if (org) fetchData()
  }, [org])

  async function fetchData() {
    setLoading(true)
    const { data: a } = await supabase
      .from('assessments')
      .select('*')
      .eq('org_id', org.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setAssessment(a)

    if (a) {
      const { data: g } = await supabase
        .from('gaps')
        .select('*')
        .eq('assessment_id', a.id)
        .order('created_at', { ascending: true })
      setGaps(g || [])
    }
    setLoading(false)
  }

  async function cycleStatus(gap) {
    const next = STATUS_CYCLE[gap.status] || 'open'
    setSaving(s => ({ ...s, [gap.id]: true }))

    const { error } = await supabase
      .from('gaps')
      .update({ status: next })
      .eq('id', gap.id)

    if (error) {
      toast.error('Failed to update status.')
      setSaving(s => ({ ...s, [gap.id]: false }))
      return
    }

    setGaps(prev => prev.map(g => g.id === gap.id ? { ...g, status: next } : g))
    setSaving(s => ({ ...s, [gap.id]: false }))

    if (next === 'resolved') toast.success('Gap marked as resolved!')
  }

  async function saveNotes(gapId, notes) {
    const { error } = await supabase
      .from('gaps')
      .update({ notes })
      .eq('id', gapId)

    if (error) toast.error('Failed to save notes.')
    else toast.success('Notes saved.')
  }

  const sortedGaps = [...gaps].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  )

  const resolved = gaps.filter(g => g.status === 'resolved').length
  const inProgress = gaps.filter(g => g.status === 'in_progress').length
  const open = gaps.filter(g => g.status === 'open').length
  const progressPct = gaps.length ? Math.round((resolved / gaps.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-indigo-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-700">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Remediation Tracker</h1>
            <p className="text-slate-500 text-sm mt-0.5">{gaps.length} gaps · {resolved} resolved</p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Overall Remediation Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progressPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-red-600">
              <Circle size={14} /> <span>{open} open</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <Clock size={14} /> <span>{inProgress} in progress</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 size={14} /> <span>{resolved} resolved</span>
            </div>
          </div>
        </div>

        {/* Gap cards */}
        {sortedGaps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
            No gaps found. Run an assessment first.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedGaps.map(gap => (
              <GapCard
                key={gap.id}
                gap={gap}
                expanded={expanded[gap.id]}
                onToggle={() => setExpanded(e => ({ ...e, [gap.id]: !e[gap.id] }))}
                onCycleStatus={() => cycleStatus(gap)}
                onSaveNotes={(notes) => saveNotes(gap.id, notes)}
                saving={saving[gap.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GapCard({ gap, expanded, onToggle, onCycleStatus, onSaveNotes, saving }) {
  const [notes, setNotes] = useState(gap.notes || '')
  const [notesChanged, setNotesChanged] = useState(false)

  const statusBg = {
    open: 'bg-white',
    in_progress: 'bg-amber-50/40',
    resolved: 'bg-green-50/40',
  }

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${gap.status === 'resolved' ? 'border-green-200' : gap.status === 'in_progress' ? 'border-amber-200' : 'border-slate-200'} ${statusBg[gap.status]}`}>
      <div className="px-4 py-3 flex items-start gap-3">
        <button
          onClick={onCycleStatus}
          disabled={saving}
          className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform disabled:opacity-50"
          title={`Click to mark as: ${STATUS_LABELS[STATUS_CYCLE[gap.status]]}`}
        >
          {saving ? <Spinner size="sm" className="text-slate-400" /> : STATUS_ICONS[gap.status]}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`font-medium text-sm ${gap.status === 'resolved' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {gap.title}
            </span>
            <SeverityBadge severity={gap.severity} />
            <span className="text-xs text-slate-400">{gap.effort}</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">{gap.description}</p>
          {gap.hipaa_rule && (
            <p className="text-xs text-indigo-600 font-medium mt-1">{gap.hipaa_rule}</p>
          )}
        </div>

        <button onClick={onToggle} className="flex-shrink-0 text-slate-400 hover:text-slate-600 mt-0.5">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3 bg-slate-50/50">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Recommended Action</p>
            <p className="text-sm text-slate-700">{gap.recommended_action}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setNotesChanged(true) }}
              placeholder="Add notes, links, or assignee info…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
            />
            {notesChanged && (
              <button
                onClick={() => { onSaveNotes(notes); setNotesChanged(false) }}
                className="mt-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Save notes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
