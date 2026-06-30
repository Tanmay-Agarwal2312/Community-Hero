import './Timeline.css'

const STAGES = [
  { key: 'reported', label: 'Reported', icon: '🚩' },
  { key: 'verified', label: 'Verified', icon: '✓' },
  { key: 'in_progress', label: 'In Progress', icon: '⏳' },
  { key: 'resolved_pending_verification', label: 'Pending Verification', icon: '🔍' },
  { key: 'resolved', label: 'Resolved', icon: '✅' },
]

const STATUS_ORDER = {
  reported: 0,
  verified: 1,
  in_progress: 2,
  resolved_pending_verification: 3,
  resolved: 4,
}

export default function Timeline({ status, timestamps = {} }) {
  const currentIndex = STATUS_ORDER[status] ?? 0

  function formatDate(dateStr) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="timeline" id="issue-timeline">
      <div className="timeline__track">
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex
          const isFuture = i > currentIndex
          const tsKey = stage.key + 'At'
          const date = formatDate(timestamps[tsKey] || timestamps[stage.key])

          return (
            <div key={stage.key} className="timeline__stage" id={`timeline-stage-${stage.key}`}>
              {/* Connector line before (skip first) */}
              {i > 0 && (
                <div className={`timeline__connector ${isCompleted || isCurrent ? 'timeline__connector--done' : ''}`} />
              )}

              {/* Circle */}
              <div className={`timeline__circle ${isCompleted ? 'timeline__circle--done' : ''} ${isCurrent ? 'timeline__circle--current' : ''} ${isFuture ? 'timeline__circle--future' : ''}`}>
                <span className="timeline__circle-icon">
                  {isCompleted ? '✓' : stage.icon}
                </span>
              </div>

              {/* Label + date */}
              <div className="timeline__info">
                <span className={`timeline__label ${isCurrent ? 'timeline__label--current' : ''} ${isFuture ? 'timeline__label--future' : ''}`}>
                  {stage.label}
                </span>
                {date && (
                  <span className="timeline__date">{date}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
