import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ASSESSMENT_CATEGORIES, ANSWER_OPTIONS } from '../lib/constants'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'

export default function Assessment() {
  const { user, org } = useAuth()
  const navigate = useNavigate()
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: 'yes' | 'partial' | 'no' }
  const [submitting, setSubmitting] = useState(false)

  const category = ASSESSMENT_CATEGORIES[categoryIndex]
  const totalQuestions = ASSESSMENT_CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0)
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / totalQuestions) * 100)

  const categoryAnswered = category.questions.every(q => answers[q.id] !== undefined)
  const allAnswered = answeredCount === totalQuestions

  function setAnswer(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit() {
    if (!allAnswered) {
      toast.error('Please answer all questions before submitting.')
      return
    }
    if (!org) {
      toast.error('Organization profile not found. Please complete onboarding first.')
      navigate('/onboarding')
      return
    }

    setSubmitting(true)

    // Save assessment with raw responses
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        org_id: org.id,
        responses: answers,
        status: 'scoring',
      })
      .select()
      .single()

    if (assessmentError) {
      setSubmitting(false)
      toast.error('Failed to save assessment. Please try again.')
      return
    }

    // Call the Edge Function for scoring
    const { data: fnData, error: fnError } = await supabase.functions.invoke('score-assessment', {
      body: {
        assessment_id: assessment.id,
        org_id: org.id,
        org: {
          name: org.name,
          phi_types: org.phi_types,
          team_size: org.team_size,
          cloud_providers: org.cloud_providers,
          has_mobile_app: org.has_mobile_app,
          compliance_status: org.compliance_status,
          description: org.description,
        },
        responses: answers,
      },
    })

    setSubmitting(false)

    if (fnError || fnData?.error) {
      console.error('fnError:', JSON.stringify(fnError))
      console.error('fnData:', JSON.stringify(fnData))
      toast.error(`Scoring failed: ${fnError?.message || fnData?.error || 'unknown error'}`)
      // Delete the partial assessment
      await supabase.from('assessments').delete().eq('id', assessment.id)
      return
    }

    toast.success('Assessment scored!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">HIPAA Risk Assessment</h1>
          <p className="text-slate-500 text-sm mt-1">
            {answeredCount} of {totalQuestions} questions answered
          </p>
        </div>

        {/* Overall progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Overall progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {ASSESSMENT_CATEGORIES.map((cat, i) => {
            const catAnswered = cat.questions.filter(q => answers[q.id]).length
            const catTotal = cat.questions.length
            const done = catAnswered === catTotal
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryIndex(i)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                  ${i === categoryIndex
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : done
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
              >
                {done && i !== categoryIndex ? <CheckCircle2 size={12} /> : null}
                <span className="hidden sm:block">{cat.label}</span>
                <span className="sm:hidden">{i + 1}</span>
                <span className={`text-xs ${i === categoryIndex ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {catAnswered}/{catTotal}
                </span>
              </button>
            )
          })}
        </div>

        {/* Category card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-900">{category.label}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>
          </div>

          <div className="divide-y divide-slate-100">
            {category.questions.map((q, qi) => (
              <div key={q.id} className="px-6 py-4">
                <p className="text-sm text-slate-800 mb-3">
                  <span className="font-medium text-slate-400 mr-2">{qi + 1}.</span>
                  {q.text}
                </p>
                <div className="flex gap-2">
                  {ANSWER_OPTIONS.map(({ value, label, color }) => {
                    const selected = answers[q.id] === value
                    const colorMap = {
                      green: selected
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-green-200 text-green-700 hover:bg-green-50',
                      amber: selected
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'border-amber-200 text-amber-700 hover:bg-amber-50',
                      red: selected
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-red-200 text-red-700 hover:bg-red-50',
                    }
                    return (
                      <button
                        key={value}
                        onClick={() => setAnswer(q.id, value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${colorMap[color]}`}
                      >
                        {selected
                          ? <CheckCircle2 size={12} />
                          : value === 'no' ? <AlertCircle size={12} /> : <Circle size={12} />}
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCategoryIndex(i => Math.max(0, i - 1))}
            disabled={categoryIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {categoryIndex < ASSESSMENT_CATEGORIES.length - 1 ? (
            <button
              onClick={() => setCategoryIndex(i => i + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !allAnswered}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Analyzing with AI…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Submit & Score
                </>
              )}
            </button>
          )}
        </div>

        {submitting && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700 text-center">
            Claude is analyzing your responses… this typically takes 10–15 seconds.
          </div>
        )}
      </div>
    </div>
  )
}
