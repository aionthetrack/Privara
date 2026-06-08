import { RISK_COLORS } from '../lib/constants'

export function RiskBadge({ level }) {
  const colors = RISK_COLORS[level] || RISK_COLORS.medium
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {level?.charAt(0).toUpperCase() + level?.slice(1)} Risk
    </span>
  )
}

export function SeverityBadge({ severity }) {
  const colors = RISK_COLORS[severity] || RISK_COLORS.medium
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1)}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    open: 'bg-red-50 text-red-700',
    in_progress: 'bg-amber-50 text-amber-700',
    resolved: 'bg-green-50 text-green-700',
  }
  const labels = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] || map.open}`}>
      {labels[status] || status}
    </span>
  )
}
