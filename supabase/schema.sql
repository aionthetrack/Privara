-- Privara — HIPAA Compliance SaaS
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  website       TEXT,
  description   TEXT,
  phi_types     JSONB NOT NULL DEFAULT '[]',
  cloud_providers JSONB NOT NULL DEFAULT '[]',
  has_mobile_app BOOLEAN,
  team_size     TEXT,
  compliance_status TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  responses     JSONB NOT NULL DEFAULT '{}',
  score_data    JSONB,
  overall_score INTEGER,
  risk_level    TEXT CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  status        TEXT NOT NULL DEFAULT 'scoring' CHECK (status IN ('scoring', 'complete', 'failed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gaps (one row per gap, linked to an assessment)
CREATE TABLE IF NOT EXISTS gaps (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id      UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category           TEXT NOT NULL,
  title              TEXT NOT NULL,
  description        TEXT,
  severity           TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  hipaa_rule         TEXT,
  effort             TEXT,
  recommended_action TEXT,
  status             TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('privacy_policy', 'security_policy', 'incident_response')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shareable reports
CREATE TABLE IF NOT EXISTS report_shares (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orgs_user_id ON organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_org_id ON assessments(org_id);
CREATE INDEX IF NOT EXISTS idx_gaps_assessment_id ON gaps(assessment_id);
CREATE INDEX IF NOT EXISTS idx_gaps_org_id ON gaps(org_id);
CREATE INDEX IF NOT EXISTS idx_policies_org_id ON policies(org_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_slug ON report_shares(slug);

-- Row Level Security

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- Organizations: users own their own org
CREATE POLICY "Users can manage their own org"
  ON organizations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Assessments: users access via their org
CREATE POLICY "Users can manage their own assessments"
  ON assessments FOR ALL
  USING (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Gaps
CREATE POLICY "Users can manage their own gaps"
  ON gaps FOR ALL
  USING (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Policies
CREATE POLICY "Users can manage their own policies"
  ON policies FOR ALL
  USING (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

-- Report shares: owner can manage, public can read by slug
CREATE POLICY "Owners can manage report shares"
  ON report_shares FOR ALL
  USING (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read report shares by slug"
  ON report_shares FOR SELECT
  USING (true);

-- Newsletter / email signups (public, no auth required)
CREATE TABLE IF NOT EXISTS email_signups (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  source     TEXT NOT NULL DEFAULT 'newsletter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own email; no one can read the list via client
CREATE POLICY "Anyone can sign up"
  ON email_signups FOR INSERT
  WITH CHECK (true);

-- Edge functions need service role to bypass RLS (handled via SUPABASE_SERVICE_ROLE_KEY in function env)
