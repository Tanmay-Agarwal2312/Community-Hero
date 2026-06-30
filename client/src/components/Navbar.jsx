import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const { user, loading, login, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/#how-it-works', label: 'How It Works' },
    { to: '/map', label: 'Live Map' },
    { to: '/issues', label: 'Feed' },
  ]

  // Only org_admin can see the Impact Dashboard link
  if (user?.role === 'org_admin') {
    navLinks.splice(2, 0, { to: '/dashboard', label: 'Impact' })
  }

  const isActive = (to) => {
    if (to.startsWith('/#')) return location.pathname === '/' && location.hash === to.slice(1)
    return location.pathname === to
  }

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="navbar-logo">
          <div className="navbar__logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="currentColor" opacity="0.15"/>
              <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2ZM19 12C19 16.52 16.02 20.69 12 21.93C7.98 20.69 5 16.52 5 12V8.3L12 4.26L19 8.3V12Z" fill="currentColor"/>
              <path d="M10 15.5L7.5 13L8.91 11.59L10 12.67L14.59 8.09L16 9.5L10 15.5Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="navbar__logo-text">Community Hero</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar__links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${isActive(link.to) ? 'navbar__link--active' : ''}`}
              id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="navbar__right">
          {loading ? (
            <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 8 }} />
          ) : user ? (
            <div className="navbar__profile">
              <button
                className="navbar__avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                id="navbar-profile-btn"
              >
                <img
                  src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B5BDB&color=fff`}
                  alt={user.name}
                  className="navbar__avatar"
                />
                <span className="navbar__user-name">{user.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`navbar__chevron ${profileOpen ? 'navbar__chevron--open' : ''}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {profileOpen && (
                <div className="navbar__dropdown animate-fade-in-down" id="navbar-dropdown">
                  <div className="navbar__dropdown-header">
                    <img
                      src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B5BDB&color=fff`}
                      alt={user.name}
                      className="navbar__dropdown-avatar"
                    />
                    <div>
                      <div className="navbar__dropdown-name">{user.name}</div>
                      <div className="navbar__dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link
                    to="/report"
                    className="navbar__dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    ✏️ Report Issue
                  </Link>
                  <Link
                    to="/dashboard"
                    className="navbar__dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    📊 Dashboard
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={() => { logout(); setProfileOpen(false); }}
                    id="navbar-logout-btn"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={login} id="navbar-signin-btn">
              Sign In
            </button>
          )}

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            id="navbar-hamburger"
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile animate-fade-in-down" id="navbar-mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__mobile-link ${isActive(link.to) ? 'navbar__mobile-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <button className="btn btn-primary" onClick={() => { login(); setMenuOpen(false); }} style={{ marginTop: 8 }}>
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
