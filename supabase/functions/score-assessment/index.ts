import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.102.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CATEGORIES = [
  { id: 'access_controls', label: 'Access Controls' },
  { id: 'data_handling', label: 'Data Handling' },
  { id: 'vendor_management', label: 'Vendor Management' },
  { id: 'policies_procedures', label: 'Policies & Procedures' },
  { id: 'incident_readiness', label: 'Incident Readiness' },
]

const QUESTION_CATEGORY_MAP: Record<string, string> = {
  ac_1: 'access_controls', ac_2: 'access_controls', ac_3: 'access_controls', ac_4: 'access_controls',
  ac_5: 'access_controls', ac_6: 'access_controls', ac_7: 'access_controls', ac_8: 'access_controls',
  dh_1: 'data_handling', dh_2: 'data_handling', dh_3: 'data_handling', dh_4: 'data_handling',
  dh_5: 'data_handling', dh_6: 'data_handling', dh_7: 'data_handling', dh_8: 'data_handling',
  vm_1: 'vendor_management', vm_2: 'vendor_management', vm_3: 'vendor_management', vm_4: 'vendor_management',
  vm_5: 'vendor_management', vm_6: 'vendor_management', vm_7: 'vendor_management', vm_8: 'vendor_management',
  pp_1: 'policies_procedures', pp_2: 'policies_procedures', pp_3: 'policies_procedures', pp_4: 'policies_procedures',
  pp_5: 'policies_procedures', pp_6: 'policies_procedures', pp_7: 'policies_procedures', pp_8: 'policies_procedures',
  ir_1: 'incident_readiness', ir_2: 'incident_readiness', ir_3: 'incident_readiness', ir_4: 'incident_readiness',
  ir_5: 'incident_readiness', ir_6: 'incident_readiness', ir_7: 'incident_readiness', ir_8: 'incident_readiness',
}

const QUESTION_TEXT: Record<string, string> = {
  ac_1: 'Do all users who access PHI require multi-factor authentication?',
  ac_2: 'Is access to PHI restricted by role (least privilege principle)?',
  ac_3: 'Do you have automatic session timeouts for systems handling PHI?',
  ac_4: 'Are access logs maintained and reviewed regularly?',
  ac_5: 'Is there a formal process for revoking access when employees leave?',
  ac_6: 'Do you use unique user IDs (no shared accounts) for PHI systems?',
  ac_7: 'Are privileged accounts (admin) separate from regular user accounts?',
  ac_8: 'Do you conduct periodic access reviews?',
  dh_1: 'Is PHI encrypted at rest (AES-256 or equivalent)?',
  dh_2: 'Is PHI encrypted in transit (TLS 1.2+)?',
  dh_3: 'Do you have a data retention and disposal policy?',
  dh_4: 'Is PHI stored only in approved, documented locations?',
  dh_5: 'Do you have controls to prevent unauthorized PHI downloads or exports?',
  dh_6: 'Is PHI masked or de-identified in non-production environments?',
  dh_7: 'Do you back up PHI and test restoration procedures?',
  dh_8: 'Do you have a data classification policy?',
  vm_1: 'Have all vendors who access PHI signed a Business Associate Agreement (BAA)?',
  vm_2: 'Do you maintain an inventory of all vendors who handle PHI?',
  vm_3: 'Do you conduct vendor security reviews before onboarding?',
  vm_4: 'Do you have a process for terminating vendor BAAs when contracts end?',
  vm_5: 'Are vendor BAAs reviewed and renewed periodically?',
  vm_6: 'Do you know which subcontractors your vendors use who may touch PHI?',
  vm_7: 'Do you monitor vendors for security incidents?',
  vm_8: 'Is there a process for vendors to report breaches to you?',
  pp_1: 'Have you designated a HIPAA Privacy Officer?',
  pp_2: 'Have you designated a HIPAA Security Officer?',
  pp_3: 'Do you have a written Privacy Policy that covers PHI?',
  pp_4: 'Do you have a written Security Policy?',
  pp_5: 'Have all workforce members received HIPAA training?',
  pp_6: 'Is HIPAA training conducted annually?',
  pp_7: 'Do you have a sanctions policy for workforce members who violate HIPAA?',
  pp_8: 'Are your policies reviewed and updated at least annually?',
  ir_1: 'Do you have a written Incident Response Plan?',
  ir_2: 'Does your plan cover the 60-day breach notification requirement?',
  ir_3: 'Have you conducted a breach response drill or tabletop exercise?',
  ir_4: 'Do you have a process for documenting and tracking security incidents?',
  ir_5: 'Do you know how to file a breach report with OCR (HHS)?',
  ir_6: 'Do you have cyber liability insurance?',
  ir_7: 'Is there a designated person responsible for breach notifications?',
  ir_8: 'Do you have a business continuity/disaster recovery plan?',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { assessment_id, org_id, org, responses } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    // Format responses by category for Claude
    const byCategory: Record<string, string[]> = {}
    for (const [qId, answer] of Object.entries(responses)) {
      const cat = QUESTION_CATEGORY_MAP[qId]
      if (cat) {
        if (!byCategory[cat]) byCategory[cat] = []
        byCategory[cat].push(`  - ${QUESTION_TEXT[qId]}: ${answer}`)
      }
    }

    const formattedResponses = CATEGORIES.map(cat => {
      const lines = byCategory[cat.id] || []
      return `${cat.label}:\n${lines.join('\n')}`
    }).join('\n\n')

    const userPrompt = `Analyze this HIPAA risk assessment for ${org.name}:

[ORG PROFILE]
Company: ${org.name}
Description: ${org.description || 'Not provided'}
PHI types handled: ${(org.phi_types || []).join(', ')}
Team members accessing PHI: ${org.team_size}
Cloud providers: ${(org.cloud_providers || []).join(', ')}
Has mobile app: ${org.has_mobile_app ? 'Yes' : 'No'}
Current compliance status: ${org.compliance_status}

[ASSESSMENT RESPONSES]
${formattedResponses}

Return JSON in exactly this structure:
{
  "overall_score": 0-100,
  "risk_level": "critical|high|medium|low",
  "category_scores": {
    "access_controls": 0-100,
    "data_handling": 0-100,
    "vendor_management": 0-100,
    "policies_procedures": 0-100,
    "incident_readiness": 0-100
  },
  "gaps": [
    {
      "id": "unique_id",
      "category": "category_id",
      "title": "short gap title",
      "description": "plain English explanation of the gap",
      "severity": "critical|high|medium|low",
      "hipaa_rule": "specific HIPAA rule reference",
      "effort": "hours|days|weeks",
      "recommended_action": "specific actionable fix"
    }
  ],
  "strengths": ["list of things they are doing well"],
  "priority_actions": ["top 3 immediate actions to take"]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: 'You are a HIPAA compliance expert. You will receive a health tech startup\'s assessment responses and must return a structured JSON risk analysis. Be concise — keep each description under 100 characters, recommended_action under 120 characters, strengths under 80 characters each. Always return valid JSON only — no prose, no markdown, no code fences.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    // Strip markdown code fences if Claude wraps output in ```json ... ```
    let cleaned = rawText.trim()
    if (cleaned.startsWith('`')) {
      cleaned = cleaned.replace(/^`{1,3}(?:json)?[\r\n]*/i, '').replace(/[\r\n]*`{1,3}$/i, '').trim()
    }
    const scoreData = JSON.parse(cleaned)

    // Update assessment with score data
    await supabase
      .from('assessments')
      .update({
        score_data: scoreData,
        overall_score: scoreData.overall_score,
        risk_level: scoreData.risk_level,
        status: 'complete',
      })
      .eq('id', assessment_id)

    // Insert gap rows
    if (scoreData.gaps && scoreData.gaps.length > 0) {
      const gapRows = scoreData.gaps.map((g: any) => ({
        assessment_id,
        org_id,
        category: g.category,
        title: g.title,
        description: g.description,
        severity: g.severity,
        hipaa_rule: g.hipaa_rule,
        effort: g.effort,
        recommended_action: g.recommended_action,
        status: 'open',
      }))
      await supabase.from('gaps').insert(gapRows)
    }

    return new Response(
      JSON.stringify({ success: true, score: scoreData.overall_score }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('score-assessment error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
