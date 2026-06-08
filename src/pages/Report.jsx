import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Shield, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ASSESSMENT_CATEGORIES } from '../lib/constants'
import { RiskBadge } from '../components/Badge'
import Spinner from '../components/Spinner'

export default function Report() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [slug])

  async function fetchReport() {
    const { data: share } = await supabase
      .from('report_shares')
      .select('*, assessments(*), organizations(name)')
      .eq('slug', slug)
      .maybeSingle()

    if (!share) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setData(share)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle size={40} className="text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Report not found</h2>
          <p className="text-slate-500 text-sm">This report link may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  const assessment = data.assessments
  const org = data.organizations
  const score = assessment.overall_score
  const scoreData = assessment.score_data || {}
  const categoryScores = scoreData.category_scores || {}
  const scoreColor = score >= 71 ? '#22c55e' : score >= 41 ? '#f59e0b' : '#ef4444'
  const size = 120
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">Privara</span>
          </div>
          <span className="text-xs text-slate-400">HIPAA Compliance Report</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Company + score */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-1">{org?.name}</h1>
          <p className="text-xs text-slate-400 mb-5">
            Assessment date: {new Date(assessment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="flex justify-center mb-3">
            <div className="relative flex items-center justify-center">
              <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={9} />
                <circle
                  cx={size / 2} cy={size / 2} r={radius} fill="none"
                  strokeWidth={9} strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" style={{ stroke: scoreColor }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold" style={{ color: scoreColor }}>{score}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">Score</span>
              </div>
            </div>
          </div>

          <RiskBadge level={assessment.risk_level} />
        </div>

        {/* Category scores */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {ASSESSMENT_CATEGORIES.map(cat => {
              const s = categoryScores[cat.id] ?? 0
              const barColor = s >= 71 ? 'bg-green-500' : s >= 41 ? 'bg-amber-500' : 'bg-red-500'
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{cat.label}</span>
                    <span className={`font-semibold ${s >= 71 ? 'text-green-600' : s >= 41 ? 'text-amber-600' : 'text-red-600'}`}>
                      {s}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-center text-xs text-slate-400 pb-4">
          <p>This report was generated by <strong className="text-indigo-600">Privara</strong> — HIPAA compliance for health tech startups.</p>
          <a href="/" className="text-indigo-500 hover:underline">Get your own compliance score →</a>
        </div>
      </div>
    </div>
  )
}
