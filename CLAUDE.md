# Privara — Project Context for Claude Code

## What this project is
Privara is a HIPAA compliance SaaS for health tech startups. It runs a 40-question risk assessment, scores it via Claude AI, generates a compliance dashboard with gap analysis, produces AI-drafted policy documents, and provides a remediation tracker and shareable audit report.

## Current status: FULLY WORKING (as of 2026-06-08)
All features tested end-to-end and working:
- Auth (login, signup, onboarding)
- 40-question HIPAA assessment (5 categories × 8 questions)
- AI scoring via Claude Edge Function → dashboard populates
- Policy generator (Privacy Policy, Security Policy, Incident Response Plan)
- Remediation tracker (gap status toggle)
- Shareable report pages (`/report/:slug`, no auth required)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8, Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Router | React Router v7 |
| Auth + DB | Supabase (email/password auth, PostgreSQL, RLS) |
| Edge Functions | Supabase Edge Functions (Deno runtime) |
| AI | Claude API (`claude-sonnet-4-5`) — called server-side only |
| Hosting | Local dev (`npm run dev`); deploy target: Cloudflare Pages |

---

## Environment

**`.env` file** (never commit — in `.gitignore`):
```
VITE_SUPABASE_URL=https://cxlfnfahyovmuzwfetan.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

**Supabase secrets** (server-side, set via CLI — never in `.env`):
```
ANTHROPIC_API_KEY  — stored in Supabase vault, accessed only by Edge Functions
```

Set with: `.\supabase.exe secrets set ANTHROPIC_API_KEY=sk-ant-...`

---

## Supabase CLI on Windows

Requires TWO binaries co-located in the project root:
- `supabase.exe` — shim
- `supabase-go.exe` — actual CLI

Download from GitHub releases tarball (not npm — npm package has no Windows binary).
Both files are in `.gitignore` (large binaries, not source).

**Key commands:**
```powershell
.\supabase.exe functions deploy score-assessment --no-verify-jwt
.\supabase.exe functions deploy generate-policy --no-verify-jwt
.\supabase.exe secrets list
.\supabase.exe secrets set KEY=value
```

`functions logs` subcommand does NOT exist in this CLI version — check logs in Supabase Dashboard → Edge Functions → [function name] → Logs tab.

---

## Edge Functions

### score-assessment
- Receives: `{ assessment_id, org_id, org, responses }`
- Calls Claude with all 40 responses formatted by category
- Returns JSON: `{ overall_score, risk_level, category_scores, gaps[], strengths[], priority_actions[] }`
- Writes score back to `assessments` table, inserts rows into `gaps` table
- **Critical fix**: Claude sometimes wraps JSON in markdown fences — always strip before `JSON.parse`:
  ```ts
  let cleaned = rawText.trim()
  if (cleaned.startsWith('`')) {
    cleaned = cleaned.replace(/^`{1,3}(?:json)?[\r\n]*/i, '').replace(/[\r\n]*`{1,3}$/i, '').trim()
  }
  const scoreData = JSON.parse(cleaned)
  ```
- `max_tokens: 8192` — 4096 is not enough, response gets truncated mid-JSON

### generate-policy
- Receives: `{ org_id, policy_type, org }`
- `policy_type`: `privacy_policy` | `security_policy` | `incident_response`
- Calls Claude with org-tailored prompt, inserts result into `policies` table
- Same markdown-fence stripping is NOT needed here (plain text response)

---

## Known issues / gotchas

- **Windows saves files as `.env.txt`** — always `Rename-Item ".env.txt" ".env"` after creating in Notepad
- **Supabase email confirmation** must be DISABLED for local dev (Dashboard → Auth → Sign In/Sign Up → disable "Confirm email"). Otherwise RLS blocks inserts.
- **Schema cache** can be stale after SQL Editor changes — run `NOTIFY pgrst, 'reload schema'` or use the Dashboard reload button
- **`description` column** was missing from initial schema deploy — added via `ALTER TABLE organizations ADD COLUMN description TEXT;`
- **`RootRedirect` must NOT be wrapped in `ProtectedRoute`** — it handles its own auth redirect logic
- **`useEffect` with `org` dependency** — always add `else setLoading(false)` branch or pages spin forever when org is null

---

## Database schema
Schema file: `supabase/schema.sql`
Run in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

Tables: `organizations`, `assessments`, `gaps`, `policies`, `report_shares`

---

## Auth flow
1. Signup → auto-confirmed (email confirmation disabled) → redirect to `/onboarding`
2. Onboarding → 5-step form → inserts into `organizations` → redirect to `/assessment`
3. Assessment → 40 questions → submit → Edge Function scores → redirect to `/dashboard`
4. `RootRedirect` at `/`: no user → `/login`, no org → `/onboarding`, has org → `/dashboard`

---

## Deployment — DONE (2026-06-08)
Frontend live on Cloudflare Pages: **https://privara-4q7.pages.dev**

Deploy command:
```powershell
npm run build
npx wrangler pages deploy dist --project-name=privara
```

Environment variables set in Cloudflare Pages dashboard (Settings → Variables and secrets → Production):
- `VITE_SUPABASE_URL` = `https://cxlfnfahyovmuzwfetan.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (anon key)

After adding/changing env vars, must redeploy for them to take effect.

---

## Pricing page — current tiers (2026-06-10)
`src/components/landing/PricingSection.jsx`:
- Starter ($99/mo, $79 annual), Growth ($299/mo, $239 annual, 14-day trial), Scale ($599/mo, $479 annual, mailto CTA)
- **Audit Prep Package — $499 one-time** (added 2026-06-10): one-time document bundle for due diligence,
  no subscription. Grants access equivalent to `plan === 'paid'` gating (gap analysis, all policy docs,
  remediation tracker, shareable report). CTA is currently `mailto:hello@privara.io` placeholder —
  needs real Stripe one-time Checkout session once Stripe is wired up (see below).

## Next steps
1. ~~Deploy frontend to Cloudflare Pages~~ ✅ DONE 2026-06-08 — https://privara-4q7.pages.dev
2. ~~Add a remote Git origin (GitHub) and push~~ ✅ DONE 2026-06-08 — https://github.com/aionthetrack/Privara
3. Add pricing / Stripe billing
   - When this lands, add `plan` and `trial_ends_at` columns to `organizations` and gate
     premium features (e.g. Compliance Gaps "Manage" / remediation tracker on Dashboard)
     behind plan/trial status — currently fully open to all users regardless of plan.
   - Also wire the **Audit Prep Package ($499 one-time)** Stripe Checkout (mode: `payment`, not
     `subscription`). On successful payment, set `organizations.plan = 'paid'` (or a separate
     `audit_prep_purchased_at` flag if one-time access should differ from a recurring 'paid' plan —
     decide scope when building this).
4. Add multi-user / team support
5. Add re-assessment diff view (score over time)
