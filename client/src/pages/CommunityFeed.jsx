import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIssues } from '../utils/api';
import IssueCard from '../components/IssueCard';
import CategoryFilter from '../components/CategoryFilter';
import './CommunityFeed.css';

const statuses = [
  { id: 'all', label: 'All Statuses' },
  { id: 'reported', label: 'Reported' },
  { id: 'verified', label: 'Verified' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved_pending_verification', label: 'Pending Verify' },
  { id: 'resolved', label: 'Resolved' }
];

export default function CommunityFeed() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line
  }, [selectedCategory, selectedStatus]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedStatus !== 'all') filters.status = selectedStatus;
      
      const data = await getIssues(filters);
      setIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = issue.title?.toLowerCase().includes(q);
    const matchDesc = issue.description?.toLowerCase().includes(q);
    const matchAiDesc = issue.aiDescription?.toLowerCase().includes(q);
    return matchTitle || matchDesc || matchAiDesc;
  });

  return (
    <div className="feed-page">
      <div className="feed-header animate-fade-in-down">
        <div className="container container-sm">
          <div className="feed-title-row">
            <h1 className="feed-title">
              Community Feed
            </h1>
            <div className="bell-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
          </div>

          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="input search-input" 
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
            
            <div className="status-filters">
              {statuses.map(s => (
                <button 
                  key={s.id}
                  className={`status-pill ${selectedStatus === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container container-sm feed-content">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '120px' }}></div>
          ))
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Oops, something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={fetchIssues}>Try Again</button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">🌱</div>
            <h3>No issues found</h3>
            <p>Your community looks clear! Try adjusting your filters.</p>
          </div>
        ) : (
          filteredIssues.map((issue, index) => (
            <div key={issue._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <IssueCard issue={issue} />
            </div>
          ))
        )}
      </div>

      {/* Mobile Nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner container container-sm">
          <Link to="/issues" className="nav-item active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            Feed
          </Link>
          <Link to="/map" className="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Map
          </Link>
          
          <Link to="/report" className="fab-report" aria-label="Report Issue">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Link>
          
          <Link to="/dashboard" className="nav-item" style={{ marginLeft: '40px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            Stats
          </Link>
          <div className="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </div>
        </div>
      </nav>
    </div>
  );
}
