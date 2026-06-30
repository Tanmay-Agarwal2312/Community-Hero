import './StatCard.css'

export default function StatCard({ title, value, icon, trend, color = 'var(--color-primary)' }) {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <div className="stat-card card" id={`stat-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="stat-card__icon-wrap" style={{ background: `${color}15`, color }}>
        <span className="stat-card__icon">{icon}</span>
      </div>
      <div className="stat-card__content">
        <span className="stat-card__value">{value ?? '—'}</span>
        <span className="stat-card__title">{title}</span>
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`stat-card__trend ${isPositive ? 'stat-card__trend--up' : ''} ${isNegative ? 'stat-card__trend--down' : ''}`}>
          {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
