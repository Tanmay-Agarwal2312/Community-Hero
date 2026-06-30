import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import ReportIssue from './pages/ReportIssue';
import LiveMap from './pages/LiveMap';
import CommunityFeed from './pages/CommunityFeed';
import IssueDetail from './pages/IssueDetail';
import ImpactDashboard from './pages/ImpactDashboard';

import './App.css';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  // We can hide Navbar on dashboard if we want, but requirements say "Navbar on all pages (except maybe a different nav for dashboard)"
  // ImpactDashboard has its own sidebar, but usually a top navbar is kept, or we can hide it.
  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      <ScrollToTop />
      {!isDashboard && <Navbar />}
      
      <main className={isDashboard ? "dashboard-main" : "app-main"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/map" element={<LiveMap />} />
          <Route path="/issues" element={<CommunityFeed />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/dashboard" element={<ImpactDashboard />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
