import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import './VoteControls.css'

export default function VoteControls({ issueId, status, currentVote, upvotes = 0, downvotes = 0, netVotes = 0, onVote }) {
  const { user } = useAuth()
  const [voting, setVoting] = useState(false)

  let headerText = 'Vote on this issue'
  const canVote = status === 'reported' || status === 'resolved_pending_verification'

  if (status === 'reported') {
    headerText = 'Upvote to verify (5 needed)'
  } else if (status === 'resolved_pending_verification') {
    headerText = 'Confirm fix (3 needed)'
  } else if (status === 'resolved') {
    headerText = 'Resolution verified ✓'
  } else {
    headerText = 'Report verified ✓'
  }

  async function handleVote(value) {
    if (!user || voting) return
    setVoting(true)
    try {
      await onVote(value)
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="vote-controls card card--flat" id={`vote-controls-${issueId}`}>
      <p className="vote-controls__header">{headerText}</p>
      <div className="vote-controls__actions">
        <button
          className={`vote-controls__btn vote-controls__btn--up ${currentVote === 1 ? 'vote-controls__btn--active-up' : ''}`}
          onClick={() => handleVote(1)}
          disabled={!user || voting || !canVote}
          id={`vote-up-${issueId}`}
          aria-label="Upvote"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span>{upvotes}</span>
        </button>

        <div className="vote-controls__net">
          <span className={`vote-controls__net-value ${netVotes > 0 ? 'vote-controls__net-value--positive' : netVotes < 0 ? 'vote-controls__net-value--negative' : ''}`}>
            {netVotes > 0 ? '+' : ''}{netVotes}
          </span>
        </div>

        <button
          className={`vote-controls__btn vote-controls__btn--down ${currentVote === -1 ? 'vote-controls__btn--active-down' : ''}`}
          onClick={() => handleVote(-1)}
          disabled={!user || voting || !canVote}
          id={`vote-down-${issueId}`}
          aria-label="Downvote"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <span>{downvotes}</span>
        </button>
      </div>
      {!user && <p className="vote-controls__hint">Sign in to vote</p>}
    </div>
  )
}
