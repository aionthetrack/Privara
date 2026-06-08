export default function ScoreRing({ score, size = 160 }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score))
  const offset = circumference - (progress / 100) * circumference

  const color = score >= 71 ? '#22c55e' : score >= 41 ? '#f59e0b' : '#ef4444'
  const label = score >= 71 ? 'Good' : score >= 41 ? 'Fair' : 'At Risk'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: size / 2 - 24 }}>
        <span className="text-4xl font-bold text-slate-900" style={{ color }}>{score}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  )
}
