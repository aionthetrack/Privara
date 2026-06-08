import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.102.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const POLICY_PROMPTS: Record<string, (org: any) => string> = {
  privacy_policy: (org) => `Generate a HIPAA-compliant Privacy Policy for ${org.name}.

Company context:
- Product description: ${org.description || 'A health technology platform'}
- PHI types handled: ${(org.phi_types || []).join(', ')}
- Has mobile app: ${org.has_mobile_app ? 'Yes' : 'No'}

Include these sections clearly formatted with headers:
1. Introduction and scope
2. Types of Protected Health Information we collect
3. Permitted uses and disclosures of PHI
4. Patient rights (access, amendment, accounting of disclosures, restriction requests, confidential communications)
5. Minimum Necessary Standard
6. Privacy Officer contact information
7. Complaint procedures
8. Breach notification
9. Policy effective date and review schedule

Make it specific to the PHI types they handle. Write in plain English — accessible to patients and workforce members. Do not use legal boilerplate. Return plain text with clear section headers only — no markdown formatting symbols.`,

  security_policy: (org) => `Generate a HIPAA Security Policy for ${org.name}.

Company context:
- Product description: ${org.description || 'A health technology platform'}
- Cloud providers: ${(org.cloud_providers || []).join(', ')}
- Has mobile app: ${org.has_mobile_app ? 'Yes' : 'No'}
- PHI types handled: ${(org.phi_types || []).join(', ')}

Include these sections clearly formatted with headers:
1. Purpose and scope
2. Administrative safeguards (workforce security, training, access management, contingency planning)
3. Physical safeguards (facility access, workstation use, device controls)
4. Technical safeguards (access controls, audit controls, integrity controls, transmission security)
5. Encryption requirements (reference their cloud provider: ${(org.cloud_providers || []).join(', ')})
6. Password and authentication policy
7. Security incident procedures
8. Business associate management
9. Policy review and update schedule
10. Security Officer responsibilities

Tailor technical safeguard recommendations to their cloud provider(s). Return plain text with clear section headers only — no markdown formatting symbols.`,

  incident_response: (org) => `Generate a HIPAA Incident Response Plan for ${org.name}.

Company context:
- Product description: ${org.description || 'A health technology platform'}
- PHI types handled: ${(org.phi_types || []).join(', ')}
- Cloud providers: ${(org.cloud_providers || []).join(', ')}

Include these sections clearly formatted with headers:
1. Purpose and applicability
2. Incident classification (security incident vs. breach)
3. Incident response team — roles and responsibilities
4. Detection and initial assessment (0-24 hours)
5. Containment and investigation (24-72 hours)
6. Breach determination — the 4-factor risk assessment required by HIPAA
7. Notification requirements and 60-day timeline
   - Individual notification requirements
   - HHS/OCR notification process (hitech-breach@hhs.gov)
   - Media notification (if 500+ affected in a state)
8. Documentation requirements
9. Post-incident review and lessons learned
10. Contact list template (Privacy Officer, Security Officer, Legal, HR, Communications)
11. Incident log template

Be specific about HIPAA's 60-day notification clock and OCR reporting at hhs.gov/hipaa/filing-a-complaint. Return plain text with clear section headers only — no markdown formatting symbols.`,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { org_id, policy_type, org } = await req.json()

    if (!POLICY_PROMPTS[policy_type]) {
      return new Response(
        JSON.stringify({ error: 'Invalid policy type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const prompt = POLICY_PROMPTS[policy_type](org)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: 'You are a HIPAA compliance attorney and policy writer. Generate practical, specific, legally-sound HIPAA policy documents for health tech startups. Write in clear professional English. Return plain text only — no markdown, no asterisks, no bullet symbols from markdown. Use numbered sections and plain dashes for lists.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Upsert policy in database
    const { error } = await supabase
      .from('policies')
      .insert({
        org_id,
        type: policy_type,
        content,
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-policy error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
