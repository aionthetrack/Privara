import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { PHI_TYPES, CLOUD_PROVIDERS, TEAM_SIZE_OPTIONS, COMPLIANCE_STATUS_OPTIONS } from '../lib/constants'
import Spinner from '../components/Spinner'

const STEPS = [
  { id: 1, label: 'Company' },
  { id: 2, label: 'PHI Types' },
  { id: 3, label: 'Infrastructure' },
  { id: 4, label: 'Team' },
  { id: 5, label: 'Status' },
]

export default function Onboarding() {
  const { user, refreshOrg } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    website: '',
    description: '',
    phi_types: [],
    cloud_providers: [],
    has_mobile_app: null,
    team_size: '',
    compliance_status: '',
  })

  function toggleArray(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  function canAdvance() {
    if (step === 1) return form.name.trim().length > 0
    if (step === 2) return form.phi_types.length > 0
    if (step === 3) return form.cloud_providers.length > 0 && form.has_mobile_app !== null
    if (step === 4) return form.team_size !== ''
    if (step === 5) return form.compliance_status !== ''
    return true
  }

  async function handleFinish() {
    setSaving(true)
    const { error } = await supabase.from('organizations').insert({
      user_id: user.id,
      name: form.name.trim(),
      website: form.website.trim() || null,
      description: form.description.trim() || null,
      phi_types: form.phi_types,
      cloud_providers: form.cloud_providers,
      has_mobile_app: form.has_mobile_app,
      team_size: form.team_size,
      compliance_status: form.compliance_status,
    })
    setSaving(false)
    if (error) {
      console.error('Org insert error:', JSON.stringify(error))
      toast.error(`Failed to save: ${error.message}`)
      return
    }
    await refreshOrg(user.id)
    toast.success('Profile saved! Let\'s run your first assessment.')
    navigate('/assessment')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">Privara</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                    ${step > s.id ? 'bg-indigo-600 text-white'
                      : step === s.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-slate-200 text-slate-500'}`}
                >
                  {step > s.id ? <Check size={14} /> : s.id}
                </div>
                <span className={`text-xs hidden sm:block ${step === s.id ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mb-4 sm:mb-0 ${step > s.id ? 'bg-indigo-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {step === 1 && <StepCompany form={form} setForm={setForm} />}
          {step === 2 && <StepPHI form={form} toggleArray={toggleArray} />}
          {step === 3 && <StepInfra form={form} setForm={setForm} toggleArray={toggleArray} />}
          {step === 4 && <StepTeam form={form} setForm={setForm} />}
          {step === 5 && <StepStatus form={form} setForm={setForm} />}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={15} /> Back
            </button>
            {step < 5 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canAdvance() || saving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? <Spinner size="sm" className="text-white" /> : null}
                {saving ? 'Saving…' : 'Start Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCompany({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Tell us about your company</h2>
        <p className="text-sm text-slate-500 mt-1">This helps us tailor your compliance assessment.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Company name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Acme Health Inc."
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
        <input
          type="url"
          value={form.website}
          onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          placeholder="https://example.com"
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Brief product description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="e.g. A telehealth platform connecting patients with mental health providers"
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  )
}

function StepPHI({ form, toggleArray }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">What PHI does your product handle?</h2>
        <p className="text-sm text-slate-500 mt-1">Select all that apply. This shapes your risk profile.</p>
      </div>
      <div className="space-y-2">
        {PHI_TYPES.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={form.phi_types.includes(id)}
              onChange={() => toggleArray('phi_types', id)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function StepInfra({ form, setForm, toggleArray }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Your infrastructure</h2>
        <p className="text-sm text-slate-500 mt-1">Cloud provider and mobile presence affect your risk surface.</p>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Cloud provider(s) *</p>
        <div className="space-y-2">
          {CLOUD_PROVIDERS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={form.cloud_providers.includes(id)}
                onChange={() => toggleArray('cloud_providers', id)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Do you have a mobile app? *</p>
        <div className="flex gap-3">
          {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
            <button
              key={l}
              onClick={() => setForm(f => ({ ...f, has_mobile_app: v }))}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors
                ${form.has_mobile_app === v
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepTeam({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Team size with PHI access</h2>
        <p className="text-sm text-slate-500 mt-1">How many employees can access protected health information?</p>
      </div>
      <div className="space-y-2">
        {TEAM_SIZE_OPTIONS.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="team_size"
              checked={form.team_size === id}
              onChange={() => setForm(f => ({ ...f, team_size: id }))}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function StepStatus({ form, setForm }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Current compliance status</h2>
        <p className="text-sm text-slate-500 mt-1">Be honest — this only helps us calibrate your results.</p>
      </div>
      <div className="space-y-2">
        {COMPLIANCE_STATUS_OPTIONS.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
            <input
              type="radio"
              name="compliance_status"
              checked={form.compliance_status === id}
              onChange={() => setForm(f => ({ ...f, compliance_status: id }))}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
