import { useEffect, useState } from 'react'
import { FileText, Download, Copy, Check, Loader2, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'

const POLICY_TYPES = [
  {
    id: 'privacy_policy',
    label: 'Privacy Policy',
    description: 'Permitted uses and disclosures of PHI, patient rights, and complaint procedures.',
    icon: '🔒',
  },
  {
    id: 'security_policy',
    label: 'Security Policy',
    description: 'Workforce security, physical and technical safeguards, access management, and audit controls.',
    icon: '🛡️',
  },
  {
    id: 'incident_response',
    label: 'Incident Response Plan',
    description: '60-day breach notification timeline, OCR reporting process, and documentation requirements.',
    icon: '🚨',
  },
]

export default function Policies() {
  const { org } = useAuth()
  const [policies, setPolicies] = useState({}) // { type: { id, content, created_at } }
  const [generating, setGenerating] = useState({}) // { type: bool }
  const [viewPolicy, setViewPolicy] = useState(null) // { type, content }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (org) fetchPolicies()
    else setLoading(false)
  }, [org])

  async function fetchPolicies() {
    setLoading(true)
    const { data } = await supabase
      .from('policies')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })

    const map = {}
    if (data) {
      // Keep only latest per type
      for (const p of data) {
        if (!map[p.type]) map[p.type] = p
      }
    }
    setPolicies(map)
    setLoading(false)
  }

  async function generatePolicy(type) {
    if (!org) return
    setGenerating(g => ({ ...g, [type]: true }))

    const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-policy', {
      body: {
        org_id: org.id,
        policy_type: type,
        org: {
          name: org.name,
          phi_types: org.phi_types,
          cloud_providers: org.cloud_providers,
          has_mobile_app: org.has_mobile_app,
          description: org.description,
        },
      },
    })

    setGenerating(g => ({ ...g, [type]: false }))

    if (fnError || fnData?.error) {
      toast.error('Generation failed. Please try again.')
      return
    }

    toast.success('Policy generated!')
    await fetchPolicies()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Policy Documents</h1>
          <p className="text-slate-500 text-sm mt-1">
            AI-generated HIPAA-compliant policy templates tailored to {org?.name}.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {POLICY_TYPES.map(pt => {
              const existing = policies[pt.id]
              const isGenerating = generating[pt.id]
              return (
                <div key={pt.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{pt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{pt.label}</h3>
                        {existing && (
                          <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            Generated {new Date(existing.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{pt.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      {existing && (
                        <button
                          onClick={() => setViewPolicy({ type: pt.label, content: existing.content })}
                          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
                        >
                          <FileText size={14} /> View
                        </button>
                      )}
                      <button
                        onClick={() => generatePolicy(pt.id)}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-60"
                      >
                        {isGenerating ? (
                          <><Spinner size="sm" className="text-white" /> Generating…</>
                        ) : existing ? (
                          <><RefreshCw size={14} /> Regenerate</>
                        ) : (
                          <><FileText size={14} /> Generate</>
                        )}
                      </button>
                    </div>
                  </div>
                  {isGenerating && (
                    <div className="mt-3 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700">
                      Claude is drafting your {pt.label}… this takes 15–25 seconds.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {viewPolicy && (
        <PolicyModal policy={viewPolicy} onClose={() => setViewPolicy(null)} />
      )}
    </div>
  )
}

function PolicyModal({ policy, onClose }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(policy.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  function handleDownload() {
    const blob = new Blob([policy.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${policy.type.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">{policy.type}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg"
            >
              <Download size={14} /> .txt
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
            {policy.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
