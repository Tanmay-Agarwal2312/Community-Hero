import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getDashboardStats, getDashboardByCategory, getDashboardByStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import './ImpactDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const statusColors = {
  reported: '#F59F00',
  verified: '#3B5BDB',
  in_progress: '#7048E8',
  resolved_pending_verification: '#15AABF',
  resolved: '#37B24D'
};

const statusLabels = {
  reported: 'Reported',
  verified: 'Verified',
  in_progress: 'In Progress',
  resolved_pending_verification: 'Pending Verify',
  resolved: 'Resolved'
};

export default function ImpactDashboard() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, catRes, statRes] = await Promise.all([
        getDashboardStats().catch(() => ({ total: 0, resolved: 0, pending: 0 })),
        getDashboardByCategory().catch(() => []),
        getDashboardByStatus().catch(() => [])
      ]);
      setStats(statsRes);
      setCategoryData(catRes);
      setStatusData(statRes);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Chart data preparation
  const barChartData = {
    labels: categoryData.map(d => {
      const id = d.category || d._id || '';
      return id ? id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ') : '';
    }),
    datasets: [
      {
        label: 'Issues Reported',
        data: categoryData.map(d => d.count),
        backgroundColor: '#364FC7', // Primary dark blue
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#E9ECEF' } },
      x: { grid: { display: false } }
    }
  };

  const doughnutData = {
    labels: statusData.map(d => {
      const id = d.status || d._id;
      return statusLabels[id] || id;
    }),
    datasets: [
      {
        data: statusData.map(d => d.count),
        backgroundColor: statusData.map(d => {
          const id = d.status || d._id;
          return statusColors[id] || '#ccc';
        }),
        borderWidth: 0,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
    },
    cutout: '70%'
  };

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link">
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Overview
          </Link>
          <Link to="/report" className="sidebar-link">
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Report Issue
          </Link>
          <Link to="/issues" className="sidebar-link">
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            Feed
          </Link>
          <Link to="/map" className="sidebar-link">
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Map
          </Link>
          <Link to="/dashboard" className="sidebar-link active">
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            Impact Dashboard
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={logout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-header animate-fade-in-up">
          <h1 className="dashboard-title">Community Impact Dashboard</h1>
          <p className="dashboard-subtitle">Track the progress we're making together to improve our city.</p>
        </div>

        {loading ? (
          <div className="stats-grid">
            <div className="skeleton card" style={{ height: '140px' }}></div>
            <div className="skeleton card" style={{ height: '140px' }}></div>
            <div className="skeleton card" style={{ height: '140px' }}></div>
          </div>
        ) : (
          <>
            <div className="stats-grid animate-fade-in-up animate-delay-1">
              <StatCard 
                title="Total Issues Reported" 
                value={stats.total} 
                icon="📊" 
                color="var(--color-primary)" 
                trend="+12% this month"
              />
              <StatCard 
                title="Issues Resolved" 
                value={stats.resolved} 
                icon="✅" 
                color="var(--color-resolved)" 
                trend="+5% this week"
              />
              <StatCard 
                title="Pending Verification" 
                value={stats.pending} 
                icon="🔍" 
                color="var(--color-pending-verification)" 
              />
            </div>

            {categoryData.length === 0 && statusData.length === 0 ? (
              <div className="card empty-dashboard animate-fade-in-up animate-delay-2">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
                <h3>No data to display yet</h3>
                <p className="text-medium">Start reporting issues to see the impact dashboard come to life!</p>
              </div>
            ) : (
              <div className="charts-grid">
                <div className="card chart-card animate-fade-in-up animate-delay-2">
                  <h3 className="chart-title">Issues by Category</h3>
                  <div className="chart-container">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </div>
                
                <div className="card chart-card animate-fade-in-up animate-delay-3">
                  <h3 className="chart-title">Status Breakdown</h3>
                  <div className="chart-container">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
