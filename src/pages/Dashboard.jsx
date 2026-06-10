import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ClipboardList, AlertTriangle, CheckCircle2, TrendingUp,
  FileText, Share2, ChevronRight, RefreshCw, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ASSESSMENT_CATEGORIES, SEVERITY_ORDER } from '../lib/constants'
import Navbar from '../components/Navbar'
import { RiskBadge, SeverityBadge, StatusBadge } from '../components/Badge'
import Spinner from '../components/Spinner'

export default function Dashboard() {
  const { org } = useAuth()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [gaps, setGaps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (org) fetchLatest()
    else setLoading(false)
  }, [org])

  async function fetchLatest() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" className="text-indigo-500" />
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No assessment yet</h2>
          <p className="text-slate-500 text-sm mb-6">
            Run your first HIPAA risk assessment to see your compliance score and identify gaps.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
          >
            <ClipboardList size={16} /> Start Assessment
          </Link>
        </div>
      </div>
    )
  }

  const score = assessment.overall_score
  const scoreData = assessment.score_data || {}
  const categoryScores = scoreData.category_scores || {}
  const strengths = scoreData.strengths || []
  const priorityActions = scoreData.priority_actions || []

  const sortedGaps = [...gaps].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  )
  const openGaps = gaps.filter(g => g.status === 'open').length
  const resolvedGaps = gaps.filter(g => g.status === 'resolved').length

  const scoreColor = score >= 71 ? 'text-green-600' : score >= 41 ? 'text-amber-500' : 'text-red-500'
  const ringColor = score >= 71 ? 'stroke-green-500' : score >= 41 ? 'stroke-amber-500' : 'stroke-red-500'
  const isPaid = org?.plan === 'paid'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {org?.name} · Last assessed {new Date(assessment.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/assessment')}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
            >
              <RefreshCw size={14} /> Re-assess
            </button>
            {isPaid && <ShareButton orgId={org?.id} assessmentId={assessment.id} />}
          </div>
        </div>

        {/* Score + Category grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Score card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center gap-3">
            <ScoreCircle score={score} ringColor={ringColor} scoreColor={scoreColor} />
            <RiskBadge level={assessment.risk_level} />
            <p className="text-xs text-slate-500 text-center">
              {resolvedGaps} of {gaps.length} gaps resolved
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${gaps.length ? (resolvedGaps / gaps.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Category scores */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Category Scores</h3>
            <div className="space-y-3">
              {ASSESSMENT_CATEGORIES.map(cat => {
                const catScore = categoryScores[cat.id] ?? 0
                const barColor = catScore >= 71 ? 'bg-green-500' : catScore >= 41 ? 'bg-amber-500' : 'bg-red-500'
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{cat.label}</span>
                      <span className={`font-semibold ${catScore >= 71 ? 'text-green-600' : catScore >= 41 ? 'text-amber-600' : 'text-red-600'}`}>
                        {catScore}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${catScore}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {!isPaid && <UpgradePanel />}

        {/* Priority actions + Strengths */}
        {isPaid && <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {priorityActions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-600" />
                <h3 className="font-semibold text-amber-900">Priority Actions</h3>
              </div>
              <ol className="space-y-2">
                {priorityActions.map((action, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-800">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-green-600" />
                <h3 className="font-semibold text-green-900">What You're Doing Well</h3>
              </div>
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-green-800">
                    <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>}

        {/* Gaps list */}
        {isPaid && <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Compliance Gaps</h3>
              <p className="text-xs text-slate-500 mt-0.5">{openGaps} open · sorted by severity</p>
            </div>
            <Link
              to="/remediation"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Manage <ChevronRight size={14} />
            </Link>
          </div>

          {sortedGaps.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">No gaps found — excellent!</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedGaps.slice(0, 6).map(gap => (
                <GapRow key={gap.id} gap={gap} />
              ))}
              {sortedGaps.length > 6 && (
                <div className="px-6 py-3 text-center">
                  <Link to="/remediation" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    View all {sortedGaps.length} gaps →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>}

        {/* Policy CTA */}
        {isPaid && <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Generate Compliance Policies</h3>
            <p className="text-indigo-200 text-sm mt-1">
              Let AI draft your Privacy Policy, Security Policy, and Incident Response Plan — tailored to your org.
            </p>
          </div>
          <Link
            to="/policies"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold rounded-lg"
          >
            <FileText size={16} /> Generate Policies
          </Link>
        </div>}
      </div>
    </div>
  )
}

function UpgradePanel() {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
          <Lock size={18} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Unlock your full compliance report</h3>
          <p className="text-indigo-200 text-sm mt-1">
            Upgrade to see your detailed gap analysis, priority actions, AI-generated policy documents,
            remediation tracker, and a shareable audit report.
          </p>
          <Link
            to="/landing#pricing"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold rounded-lg"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  )
}

function ScoreCircle({ score, ringColor, scoreColor }) {
  const size = 140
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          strokeWidth={10} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className={`${ringColor} transition-all duration-700`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
      </div>
    </div>
  )
}

function GapRow({ gap }) {
  return (
    <div className="px-6 py-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-medium text-slate-800 text-sm">{gap.title}</span>
          <SeverityBadge severity={gap.severity} />
          <StatusBadge status={gap.status} />
        </div>
        <p className="text-xs text-slate-500 line-clamp-2">{gap.description}</p>
        {gap.hipaa_rule && (
          <p className="text-xs text-indigo-600 mt-1 font-medium">{gap.hipaa_rule}</p>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap pt-0.5">{gap.effort}</span>
    </div>
  )
}

function ShareButton({ orgId, assessmentId }) {
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    setLoading(true)
    // Check for existing share
    const { data: existing } = await supabase
      .from('report_shares')
      .select('slug')
      .eq('assessment_id', assessmentId)
      .maybeSingle()

    if (existing) {
      const url = `${window.location.origin}/report/${existing.slug}`
      await navigator.clipboard.writeText(url)
      toast.success('Report link copied!')
      setLoading(false)
      return
    }

    // Create new share
    const slug = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    const { error } = await supabase.from('report_shares').insert({
      org_id: orgId,
      assessment_id: assessmentId,
      slug,
    })

    if (error) {
      toast.error('Failed to create share link.')
    } else {
      const url = `${window.location.origin}/report/${slug}`
      await navigator.clipboard.writeText(url)
      toast.success('Report link copied to clipboard!')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg disabled:opacity-50"
    >
      {loading ? <Spinner size="sm" /> : <Share2 size={14} />}
      Share
    </button>
  )
}
