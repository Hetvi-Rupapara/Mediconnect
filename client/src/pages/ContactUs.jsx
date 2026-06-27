import React, { useState } from 'react';
import { EmailIcon, LocationIcon } from '../components/Icons';

/**
 * ContactUs Component
 * Provides corporate contact details and a validated contact form.
 */
function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Client-side Validation
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Mark as successfully submitted (no backend save needed)
    setSubmitted(true);
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Contact Us</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Have questions about the platform? Reach out to our support team directly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        {/* LEFT COLUMN: PLATFORM INFORMATION */}
        <div>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Platform Information
          </h3>

          <div className="card" style={{ marginTop: '1rem', padding: '2rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>MediConnect</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              We connect patients with trusted clinical specialists and offer automated AI symptom guidance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon size={18} color="var(--primary-color)" style={{ marginRight: '0.75rem' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Email</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>support@mediconnect.com</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: '0.75rem',
                  color: 'var(--primary-color)'
                }}>
                  {/* Fictional Phone Icon SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Phone</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>+91 98765 43210</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon size={18} color="var(--primary-color)" style={{ marginRight: '0.75rem' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Address</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Ahmedabad, Gujarat, India</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Get in Touch
          </h3>

          <div className="card" style={{ marginTop: '1rem', padding: '2rem' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: '#dcfce7', 
                  color: 'var(--success-color)', 
                  marginBottom: '1rem' 
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Message Sent!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Thank you for contacting MediConnect.<br />We will get back to you soon.
                </p>
                <button 
                  onClick={() => {
                    setName('');
                    setEmail('');
                    setMessage('');
                    setSubmitted(false);
                  }}
                  className="btn"
                  style={{ marginTop: '1.5rem', backgroundColor: 'var(--text-secondary)' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Name</label>
                  <input
                    type="text"
                    id="name"
                    className="search-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="search-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Message</label>
                  <textarea
                    id="message"
                    className="search-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    rows="5"
                    style={{ width: '100%', resize: 'none', lineHeight: '1.4' }}
                    required
                  />
                </div>

                <button type="submit" className="btn" style={{ width: '100%' }}>
                  Submit Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
