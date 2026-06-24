import React from 'react';
import { Link } from 'react-router-dom';
import { StethoscopeIcon, CalendarIcon, AIIcon } from '../components/Icons';

/**
 * Home Component
 * Professional landing page for the MediConnect platform.
 * Removes debug statistics and displays actual marketing structure and platform value.
 */
function Home() {
  // Check if a user is logged in to toggle CTA targets
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isDoctor = user && user.role === 'doctor';

  // Determine dashboard redirect target based on logged-in user role
  const dashboardLink = isDoctor ? '/doctor/dashboard' : '/dashboard';

  return (
    <div className="container">
      {/* 1. Hero Welcome Banner */}
      <section className="hero-grid">
        <div className="hero-left-content">
          <h1 className="hero-title">
            Your Health.<br />
            <span style={{ color: 'var(--primary)' }}>Connected & Simplified.</span>
          </h1>
          <p className="hero-subtitle">
            MediConnect bridges the gap between patients and quality healthcare. 
            Discover specialized medical practitioners, book appointments instantly, 
            and consult our AI health assistant to navigate symptoms—all from one secure portal.
          </p>
          <div className="hero-btn-group">
            {isAuthenticated ? (
              <>
                <Link to={dashboardLink} className="btn" style={{ padding: '0.85rem 2rem' }}>
                  Go to Dashboard
                </Link>
                <Link to="/doctors" className="btn" style={{ background: '#ffffff', color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.85rem 2rem' }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                  }}>
                  Browse Doctors
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn" style={{ padding: '0.85rem 2rem' }}>
                  Create Free Account
                </Link>
                <Link to="/login" className="btn" style={{ background: '#ffffff', color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.85rem 2rem' }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'var(--primary-light)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                  }}>
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right column: Banner Image */}
        <div className="hero-right-image-container">
          <img 
            src="/healthcare_hero_banner.png" 
            alt="Friendly, diverse team of doctors in a bright modern medical center lobby" 
            className="hero-right-image"
          />
        </div>
      </section>

      {/* 2. Platform Value Features Grid */}
      <h3 className="features-section-title">Why Choose MediConnect?</h3>
      <section className="features-grid">
        {/* Feature 1 */}
        <div className="feature-box">
          <span className="feature-icon">
            <StethoscopeIcon size={36} color="var(--primary)" style={{ marginRight: 0 }} />
          </span>
          <h4>Find Specialized Doctors</h4>
          <p>
            Filter and search through our verified list of medical practitioners including 
            Cardiologists, Dermatologists, Pediatricians, and General Physicians.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="feature-box">
          <span className="feature-icon">
            <CalendarIcon size={36} color="var(--primary)" style={{ marginRight: 0 }} />
          </span>
          <h4>Instant Appointment Booking</h4>
          <p>
            View live weekly available slots for doctors and schedule your consultations. 
            Receive real-time confirmation or updates from the doctor's portal.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="feature-box">
          <span className="feature-icon">
            <AIIcon size={36} color="var(--primary)" style={{ marginRight: 0 }} />
          </span>
          <h4>AI Health Assistant</h4>
          <p>
            List your symptoms to consult our rule-based AI analyzer. Receive immediate specialist 
            recommendations and urgency guidelines (coming in the next step!).
          </p>
        </div>
      </section>

      {/* 3. Simple Process flow */}
      <div className="card" style={{ padding: '3rem', marginBottom: '3.5rem', textCombineUpright: 'center' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Getting Started is Easy</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', marginBottom: '1rem' }}>
              1
            </span>
            <h5 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Sign Up</h5>
            <p style={{ fontSize: '0.9rem' }}>Create your secure account as a patient or a doctor in seconds.</p>
          </div>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', marginBottom: '1rem' }}>
              2
            </span>
            <h5 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Select Specialist</h5>
            <p style={{ fontSize: '0.9rem' }}>Browse doctor profiles, select based on reviews, hospital location, and fees.</p>
          </div>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', marginBottom: '1rem' }}>
              3
            </span>
            <h5 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Book & Visit</h5>
            <p style={{ fontSize: '0.9rem' }}>Select an available date and time slot. Describe your symptoms and confirm booking.</p>
          </div>
        </div>
      </div>

      {/* 4. Footer & Medical Disclaimer */}
      <footer style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', paddingBottom: '2.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} MediConnect. All rights reserved.
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '700px', margin: '0.5rem auto 0 auto', lineHeight: '1.5' }}>
          <strong>Medical Disclaimer:</strong> MediConnect is an educational demonstration application. 
          The information and AI-based suggestions provided are for educational and tracking purposes only 
          and should not be used as professional medical diagnosis or treatment. For urgent health matters, 
          always contact a licensed doctor or emergency healthcare response services.
        </p>
      </footer>
    </div>
  );
}

export default Home;
