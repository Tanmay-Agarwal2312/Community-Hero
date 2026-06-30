import './MapLegend.css'

const LEGEND_ITEMS = [
  { status: 'reported', icon: '🚩', label: 'Reported', color: 'var(--color-reported)' },
  { status: 'verified', icon: '✓', label: 'Verified', color: 'var(--color-verified)' },
  { status: 'in_progress', icon: '⏳', label: 'In Progress', color: 'var(--color-in-progress)' },
  { status: 'resolved_pending_verification', icon: '🔍', label: 'Resolved – Pending Verification', color: 'var(--color-pending-verification)' },
  { status: 'resolved', icon: '✅', label: 'Resolved', color: 'var(--color-resolved)' },
]

export default function MapLegend({ collapsed = false, onToggle }) {
  return (
    <div className={`map-legend card ${collapsed ? 'map-legend--collapsed' : ''}`} id="map-legend">
      <button className="map-legend__toggle" onClick={onToggle} aria-label="Toggle legend">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      {!collapsed && (
        <>
          <h4 className="map-legend__title">Map Legend</h4>
          <div className="map-legend__items">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.status} className="map-legend__item" id={`legend-${item.status}`}>
                <span className="map-legend__dot" style={{ background: item.color }} />
                <span className="map-legend__icon">{item.icon}</span>
                <span className="map-legend__label">{item.label}</span>
              </div>
            ))}
            <div className="map-legend__item">
              <span className="map-legend__dot" style={{ background: 'var(--color-disputed)' }} />
              <span className="map-legend__icon">⚠</span>
              <span className="map-legend__label">Disputed</span>
            </div>
          </div>
          <div className="map-legend__footer">
            <p>Stronger Communities, Better Together.</p>
          </div>
        </>
      )}
    </div>
  )
}
