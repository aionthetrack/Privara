export const PHI_TYPES = [
  { id: 'demographics', label: 'Demographics (name, address, DOB)' },
  { id: 'medical_records', label: 'Medical records & diagnoses' },
  { id: 'billing_info', label: 'Billing & insurance information' },
  { id: 'mental_health', label: 'Mental health records' },
  { id: 'substance_abuse', label: 'Substance abuse records' },
  { id: 'genetic_data', label: 'Genetic data' },
]

export const CLOUD_PROVIDERS = [
  { id: 'aws', label: 'Amazon Web Services (AWS)' },
  { id: 'gcp', label: 'Google Cloud Platform (GCP)' },
  { id: 'azure', label: 'Microsoft Azure' },
  { id: 'other', label: 'Other / On-premise' },
]

export const TEAM_SIZE_OPTIONS = [
  { id: '1-5', label: '1–5 employees' },
  { id: '6-25', label: '6–25 employees' },
  { id: '26-100', label: '26–100 employees' },
  { id: '100+', label: '100+ employees' },
]

export const COMPLIANCE_STATUS_OPTIONS = [
  { id: 'starting', label: 'Just starting out' },
  { id: 'partial', label: 'Partially compliant' },
  { id: 'audited', label: 'Have had a formal audit' },
]

export const ASSESSMENT_CATEGORIES = [
  {
    id: 'access_controls',
    label: 'Access Controls',
    description: 'How PHI access is managed and restricted',
    questions: [
      { id: 'ac_1', text: 'Do all users who access PHI require multi-factor authentication?' },
      { id: 'ac_2', text: 'Is access to PHI restricted by role (least privilege principle)?' },
      { id: 'ac_3', text: 'Do you have automatic session timeouts for systems handling PHI?' },
      { id: 'ac_4', text: 'Are access logs maintained and reviewed regularly?' },
      { id: 'ac_5', text: 'Is there a formal process for revoking access when employees leave?' },
      { id: 'ac_6', text: 'Do you use unique user IDs (no shared accounts) for PHI systems?' },
      { id: 'ac_7', text: 'Are privileged accounts (admin) separate from regular user accounts?' },
      { id: 'ac_8', text: 'Do you conduct periodic access reviews?' },
    ],
  },
  {
    id: 'data_handling',
    label: 'Data Handling',
    description: 'Encryption, storage, and data lifecycle practices',
    questions: [
      { id: 'dh_1', text: 'Is PHI encrypted at rest (AES-256 or equivalent)?' },
      { id: 'dh_2', text: 'Is PHI encrypted in transit (TLS 1.2+)?' },
      { id: 'dh_3', text: 'Do you have a data retention and disposal policy?' },
      { id: 'dh_4', text: 'Is PHI stored only in approved, documented locations?' },
      { id: 'dh_5', text: 'Do you have controls to prevent unauthorized PHI downloads or exports?' },
      { id: 'dh_6', text: 'Is PHI masked or de-identified in non-production environments?' },
      { id: 'dh_7', text: 'Do you back up PHI and test restoration procedures?' },
      { id: 'dh_8', text: 'Do you have a data classification policy?' },
    ],
  },
  {
    id: 'vendor_management',
    label: 'Vendor Management',
    description: 'Business Associate Agreements and third-party oversight',
    questions: [
      { id: 'vm_1', text: 'Have all vendors who access PHI signed a Business Associate Agreement (BAA)?' },
      { id: 'vm_2', text: 'Do you maintain an inventory of all vendors who handle PHI?' },
      { id: 'vm_3', text: 'Do you conduct vendor security reviews before onboarding?' },
      { id: 'vm_4', text: 'Do you have a process for terminating vendor BAAs when contracts end?' },
      { id: 'vm_5', text: 'Are vendor BAAs reviewed and renewed periodically?' },
      { id: 'vm_6', text: 'Do you know which subcontractors your vendors use who may touch PHI?' },
      { id: 'vm_7', text: 'Do you monitor vendors for security incidents?' },
      { id: 'vm_8', text: 'Is there a process for vendors to report breaches to you?' },
    ],
  },
  {
    id: 'policies_procedures',
    label: 'Policies & Procedures',
    description: 'Written policies, training, and workforce compliance',
    questions: [
      { id: 'pp_1', text: 'Have you designated a HIPAA Privacy Officer?' },
      { id: 'pp_2', text: 'Have you designated a HIPAA Security Officer?' },
      { id: 'pp_3', text: 'Do you have a written Privacy Policy that covers PHI?' },
      { id: 'pp_4', text: 'Do you have a written Security Policy?' },
      { id: 'pp_5', text: 'Have all workforce members received HIPAA training?' },
      { id: 'pp_6', text: 'Is HIPAA training conducted annually?' },
      { id: 'pp_7', text: 'Do you have a sanctions policy for workforce members who violate HIPAA?' },
      { id: 'pp_8', text: 'Are your policies reviewed and updated at least annually?' },
    ],
  },
  {
    id: 'incident_readiness',
    label: 'Incident Readiness',
    description: 'Breach response, insurance, and business continuity',
    questions: [
      { id: 'ir_1', text: 'Do you have a written Incident Response Plan?' },
      { id: 'ir_2', text: 'Does your plan cover the 60-day breach notification requirement?' },
      { id: 'ir_3', text: 'Have you conducted a breach response drill or tabletop exercise?' },
      { id: 'ir_4', text: 'Do you have a process for documenting and tracking security incidents?' },
      { id: 'ir_5', text: 'Do you know how to file a breach report with OCR (HHS)?' },
      { id: 'ir_6', text: 'Do you have cyber liability insurance?' },
      { id: 'ir_7', text: 'Is there a designated person responsible for breach notifications?' },
      { id: 'ir_8', text: 'Do you have a business continuity/disaster recovery plan?' },
    ],
  },
]

export const ANSWER_OPTIONS = [
  { value: 'yes', label: 'Yes', color: 'green' },
  { value: 'partial', label: 'Partial', color: 'amber' },
  { value: 'no', label: 'No', color: 'red' },
]

export const RISK_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
}

export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
