import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIssue, submitResolution, updateIssueStatus, castVote, getVotes } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import VoteControls from '../components/VoteControls';
import Timeline from '../components/Timeline';
import './IssueDetail.css';

const severityColors = {
  low: 'var(--color-severity-low)',
  medium: 'var(--color-severity-medium)',
  high: 'var(--color-severity-high)'
};

const categoryIcons = {
  pothole: '🕳️',
  garbage: '🗑️',
  streetlight: '💡',
  water_leak: '💧',
  road_damage: '🚧',
  other: '⚠️'
};

const categoryLabels = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  streetlight: 'Streetlight',
  water_leak: 'Water Leak',
  road_damage: 'Road Damage',
  other: 'Other'
};

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [voteData, setVoteData] = useState({ report_verification: {}, resolution_verification: {}, userVote: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchIssueAndVotes();
    // eslint-disable-next-line
  }, [id, user]);

  const fetchIssueAndVotes = async () => {
    try {
      setLoading(true);
      const [issueData, votesRes] = await Promise.all([
        getIssue(id),
        getVotes(id).catch(() => ({ report_verification: {}, resolution_verification: {}, userVote: null }))
      ]);
      setIssue(issueData);
      setVoteData(votesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value) => {
    if (!user) {
      alert("Please sign in to vote.");
      return;
    }
    try {
      const response = await castVote(id, value);
      setIssue(response.issue);
      
      // Update local vote data
      const stage = response.voteCounts.stage;
      setVoteData(prev => ({
        ...prev,
        [stage]: response.voteCounts,
        userVote: {
          ...prev.userVote,
          [stage]: value
        }
      }));
    } catch (err) {
      alert(err.message || "Failed to vote");
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile) return;
    try {
      setSubmittingProof(true);
      const formData = new FormData();
      formData.append('photo', proofFile);
      const updatedIssue = await submitResolution(id, formData);
      setIssue(updatedIssue);
      setProofFile(null);
      setProofPreview(null);
    } catch (err) {
      alert(err.message || "Failed to submit proof");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleMarkInProgress = async () => {
    try {
      setUpdatingStatus(true);
      const updatedIssue = await updateIssueStatus(id, 'in_progress');
      setIssue(updatedIssue);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="skeleton skeleton-text" style={{ height: '300px', width: '100%' }}></div>
        <div className="skeleton skeleton-text" style={{ marginTop: '2rem', height: '40px' }}></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Error Loading Issue</h2>
        <p className="text-light">{error || "Issue not found"}</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const {
    photoUrl,
    title,
    aiDescription,
    description,
    status,
    isDisputed,
    category,
    severity,
    location,
    citizenFixable,
    statusTimestamps,
    resolutionPhotoUrl
  } = issue;

  const displayTitle = title || aiDescription || description || "Reported Issue";

  // Get current voting stage based on status
  const currentStage = (status === 'resolved_pending_verification' || status === 'resolved')
    ? 'resolution_verification' 
    : 'report_verification';
    
  const currentVoteData = voteData[currentStage] || {};
  const upvotes = currentVoteData.upvotes || 0;
  const downvotes = currentVoteData.downvotes || 0;
  const netVotes = currentVoteData.net || 0;
  const userVote = voteData.userVote ? voteData.userVote[currentStage] : null;

  // Logic for resolution upload
  const isOrgAdmin = user?.role === 'org_admin';
  const isCitizen = user?.role === 'citizen';
  
  const canUploadProof = status === 'in_progress' && (
    isOrgAdmin || (isCitizen && citizenFixable)
  );

  const canMarkInProgress = status === 'verified' && isOrgAdmin;

  return (
    <div className="issue-detail-page animate-fade-in">
      <div className="issue-hero">
        <img src={photoUrl || '/placeholder.jpg'} alt="Issue" className="issue-hero-img" />
        <div className="issue-hero-overlay">
          <button className="btn-back" onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="issue-content">
        <div className="card issue-header-card animate-fade-in-up animate-delay-1">
          <div className="issue-meta">
            <StatusBadge status={status} disputed={isDisputed} size="md" />
          </div>
          
          <h1 className="issue-title">{displayTitle}</h1>
          <p className="issue-desc">{description}</p>
          
          <div className="issue-attributes">
            <div className="attr-item">
              <span className="attr-label">Category</span>
              <span className="attr-val">
                {categoryIcons[category] || '⚠️'} {categoryLabels[category] || category}
              </span>
            </div>
            {severity && (
              <div className="attr-item">
                <span className="attr-label">Severity</span>
                <span className="attr-val">
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: severityColors[severity] || '#aaa' 
                  }}></span>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
              </div>
            )}
            {citizenFixable && (
              <div className="attr-item">
                <span className="attr-label">Community</span>
                <span className="attr-val" style={{ color: 'var(--color-primary)' }}>
                  ✨ Citizen Fixable
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="vote-section card animate-fade-in-up animate-delay-2">
          <h2 className="section-title">Community Verification</h2>
          <VoteControls 
            issueId={id}
            status={status}
            currentVote={userVote}
            upvotes={upvotes}
            downvotes={downvotes}
            netVotes={netVotes}
            onVote={handleVote}
          />
        </div>

        <div className="timeline-section card animate-fade-in-up animate-delay-3">
          <h2 className="section-title">Status Timeline</h2>
          <Timeline status={status} timestamps={statusTimestamps || {}} />
        </div>

        {canMarkInProgress && (
          <div className="card animate-fade-in-up animate-delay-4" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="section-title">Admin Actions</h2>
            <p className="text-medium" style={{ marginBottom: '1rem' }}>This issue is verified. Mark it as In Progress once work has begun.</p>
            <button 
              className="btn btn-primary" 
              onClick={handleMarkInProgress}
              disabled={updatingStatus}
            >
              {updatingStatus ? 'Updating...' : 'Mark In Progress'}
            </button>
          </div>
        )}

        {canUploadProof && (
          <div className="resolution-section card animate-fade-in-up animate-delay-4">
            <h2 className="section-title">Submit Resolution Proof</h2>
            <p className="text-medium" style={{ marginBottom: '1rem' }}>Upload a photo showing the issue has been resolved.</p>
            
            {!proofPreview ? (
              <label className="proof-upload-area">
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleProofChange}
                />
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                <div className="font-semibold text-primary">Click to upload photo</div>
                <div className="text-xs text-light" style={{ marginTop: '0.25rem' }}>JPEG or PNG, max 5MB</div>
              </label>
            ) : (
              <div className="resolution-card">
                <div className="resolution-photo-preview">
                  <img src={proofPreview} alt="Resolution preview" />
                </div>
                <div className="flex gap-3">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setProofFile(null); setProofPreview(null); }}
                    disabled={submittingProof}
                  >
                    Change Photo
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmitProof}
                    disabled={submittingProof}
                  >
                    {submittingProof ? 'Submitting...' : 'Submit Resolution'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {resolutionPhotoUrl && (
          <div className="card animate-fade-in-up animate-delay-4">
            <h2 className="section-title">Resolution Proof</h2>
            <p className="text-medium" style={{ marginBottom: '1rem' }}>A photo was provided to verify this issue has been resolved.</p>
            <img 
              src={resolutionPhotoUrl} 
              alt="Resolution" 
              className="resolution-proof-photo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
