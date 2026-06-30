import { Link } from 'react-router-dom'
import './Landing.css'

const VALUE_PROPS = [
  { icon: '👥', title: 'Stronger Together', desc: 'Community-driven issue reporting and verification' },
  { icon: '✓', title: 'Safer Streets', desc: 'AI-powered categorization keeps neighborhoods safe' },
  { icon: '📊', title: 'Data-Driven Impact', desc: 'Real-time dashboards track community progress' },
  { icon: '💙', title: 'Proud Communities', desc: 'Every fix builds a better neighborhood for all' },
]

const STEPS = [
  { num: '01', title: 'Spot & Snap', desc: 'See an issue? Take a photo and our AI categorizes it instantly.', icon: '📸' },
  { num: '02', title: 'Community Verifies', desc: 'Neighbors upvote to confirm — 5 votes and it\'s officially verified.', icon: '✅' },
  { num: '03', title: 'Track & Resolve', desc: 'Follow progress in real-time. See fixes as they happen on the live map.', icon: '🗺️' },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* ===== HERO ===== */}
      <section className="hero" id="hero">
        <div className="hero__container container">
          <div className="hero__content animate-fade-in-up">
            <div className="hero__badge animate-fade-in-up animate-delay-1">
              <span className="hero__badge-dot" />
              Empowering neighborhoods since 2024
            </div>
            <h1 className="hero__title">
              Be the Hero Your{' '}
              <span className="hero__title-accent">Neighborhood</span>{' '}
              Needs
            </h1>
            <p className="hero__subtitle">
              Report potholes, broken lights, and more to build a better city together. 
              Your voice matters — every report makes a difference.
            </p>
            <div className="hero__cta">
              <Link to="/report" className="btn btn-primary btn-lg" id="hero-report-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Report an Issue
              </Link>
              <Link to="/map" className="btn btn-secondary btn-lg" id="hero-map-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                View Live Map
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="hero__stats animate-fade-in-up animate-delay-3">
              <div className="hero__stat">
                <span className="hero__stat-value">2,500+</span>
                <span className="hero__stat-label">Issues Reported</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-value">1,800+</span>
                <span className="hero__stat-label">Resolved</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-value">10K+</span>
                <span className="hero__stat-label">Citizens</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="hero__illustration animate-fade-in-up animate-delay-2">
            <div className="hero__visual">
              {/* City skyline illustration using CSS */}
              <div className="hero__city">
                <div className="hero__building hero__building--1" />
                <div className="hero__building hero__building--2" />
                <div className="hero__building hero__building--3" />
                <div className="hero__building hero__building--4" />
                <div className="hero__building hero__building--5" />
              </div>
              {/* Floating elements */}
              <div className="hero__float hero__float--1">🛡️</div>
              <div className="hero__float hero__float--2">📍</div>
              <div className="hero__float hero__float--3">✅</div>
              <div className="hero__float hero__float--4">💡</div>
              {/* Map card mock */}
              <div className="hero__map-card">
                <div className="hero__map-card-header">
                  <div className="hero__map-card-dot hero__map-card-dot--red" />
                  <div className="hero__map-card-dot hero__map-card-dot--yellow" />
                  <div className="hero__map-card-dot hero__map-card-dot--green" />
                </div>
                <div className="hero__map-card-body">
                  <div className="hero__map-card-pin">📍</div>
                  <div className="hero__map-card-lines">
                    <div className="hero__map-card-line" style={{ width: '80%' }} />
                    <div className="hero__map-card-line" style={{ width: '60%' }} />
                  </div>
                  <div className="badge badge-verified" style={{ fontSize: '0.65rem' }}>✓ Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient orbs background */}
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works section" id="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <span className="how-it-works__eyebrow">Simple & Effective</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three easy steps to make your community better</p>
          </div>
          <div className="how-it-works__grid">
            {STEPS.map((step, i) => (
              <div key={step.num} className={`how-it-works__card card animate-fade-in-up animate-delay-${i + 1}`} id={`step-${step.num}`}>
                <div className="how-it-works__num">{step.num}</div>
                <div className="how-it-works__icon">{step.icon}</div>
                <h4 className="how-it-works__card-title">{step.title}</h4>
                <p className="how-it-works__card-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="values section" id="values">
        <div className="container">
          <div className="values__grid">
            {VALUE_PROPS.map((vp, i) => (
              <div key={vp.title} className={`values__item animate-fade-in-up animate-delay-${i + 1}`} id={`value-${i}`}>
                <div className="values__icon">{vp.icon}</div>
                <h5 className="values__title">{vp.title}</h5>
                <p className="values__desc">{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section section" id="cta-section">
        <div className="container text-center">
          <div className="cta-card animate-scale-in">
            <h2 className="cta-card__title">Ready to Make a Difference?</h2>
            <p className="cta-card__desc">Join thousands of citizens building stronger neighborhoods. Every report counts.</p>
            <div className="cta-card__buttons">
              <Link to="/report" className="btn btn-primary btn-lg" id="cta-report-btn">
                Get Started — It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <span className="footer__logo">🛡️ Community Hero</span>
              <p className="footer__tagline">Empowering citizens to build better communities, one report at a time.</p>
            </div>
            <div className="footer__links">
              <Link to="/map">Live Map</Link>
              <Link to="/issues">Feed</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/report">Report</Link>
            </div>
          </div>
          <div className="footer__bottom">
            <p>© 2024 Community Hero. Built with 💙 for better neighborhoods.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
