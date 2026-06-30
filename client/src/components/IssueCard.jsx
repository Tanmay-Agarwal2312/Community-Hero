import { useNavigate } from 'react-router-dom'
import { format } from 'timeago.js'
import StatusBadge from './StatusBadge.jsx'
import './IssueCard.css'

const CATEGORY_ICONS = {
  pothole: '🕳️',
  garbage: '🗑️',
  streetlight: '💡',
  water_leak: '💧',
  road_damage: '🚧',
  other: '⚠️',
}

export default function IssueCard({ issue }) {
  const navigate = useNavigate()

  const photoUrl = issue.photoUrl
    ? (issue.photoUrl.startsWith('http') ? issue.photoUrl : `/uploads/${issue.photoUrl}`)
    : null

  return (
    <div
      className="issue-card card card--hover"
      onClick={() => navigate(`/issues/${issue._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/issues/${issue._id}`)}
      id={`issue-card-${issue._id}`}
    >
      {/* Thumbnail */}
      <div className="issue-card__thumb">
        {photoUrl ? (
          <img src={photoUrl} alt={issue.title || issue.description} loading="lazy" />
        ) : (
          <div className="issue-card__thumb-placeholder">
            <span>{CATEGORY_ICONS[issue.category] || '📍'}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="issue-card__content">
        <div className="issue-card__top">
          <h4 className="issue-card__title truncate">
            {issue.aiDescription || issue.title || issue.description || 'Untitled Issue'}
          </h4>
          <span className="issue-card__time">{format(issue.createdAt)}</span>
        </div>

        <p className="issue-card__desc truncate">
          {issue.description || 'No description provided'}
        </p>

        <div className="issue-card__meta">
          <StatusBadge status={issue.status} disputed={issue.disputed} size="sm" />
          <span className="issue-card__category">
            {CATEGORY_ICONS[issue.category] || '📍'} {issue.category?.replace(/_/g, ' ')}
          </span>
          {issue.netVotes !== undefined && (
            <span className={`issue-card__votes ${issue.netVotes > 0 ? 'issue-card__votes--positive' : ''}`}>
              ▲ {issue.netVotes || 0}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
