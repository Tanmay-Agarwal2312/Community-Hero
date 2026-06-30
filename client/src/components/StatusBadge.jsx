import './StatusBadge.css'

const STATUS_CONFIG = {
  reported: {
    label: 'Reported',
    icon: '🚩',
    className: 'badge-reported',
  },
  verified: {
    label: 'Verified',
    icon: '✓',
    className: 'badge-verified',
  },
  in_progress: {
    label: 'In Progress',
    icon: '⏳',
    className: 'badge-in-progress',
  },
  resolved_pending_verification: {
    label: 'Pending Verification',
    icon: '🔍',
    className: 'badge-pending-verification',
  },
  resolved: {
    label: 'Resolved',
    icon: '✅',
    className: 'badge-resolved',
  },
}

export default function StatusBadge({ status, disputed, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.reported

  return (
    <div className="status-badge-wrapper" id={`status-badge-${status}`}>
      <span className={`badge ${config.className} ${size === 'md' ? 'badge-md' : ''}`}>
        <span className="status-badge__icon">{config.icon}</span>
        {config.label}
      </span>
      {disputed && (
        <span className="badge badge-disputed" style={{ marginLeft: 4 }}>
          <span className="status-badge__icon">⚠</span>
          Disputed
        </span>
      )}
    </div>
  )
}
