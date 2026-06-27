import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PrivacyPolicy Component
 * Placeholder page showing patient privacy regulations.
 */
function PrivacyPolicy() {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '3rem auto' }}>
      <div className="card" style={{ padding: '3rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Privacy Policy</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
          Last Updated: June 27, 2026
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          At MediConnect, we take your personal and health data security seriously. This privacy document outlines how patient and doctor records are stored and processed on our demonstration platform.
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>1. Data We Process</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          We collect basic identifiers including full name, login email addresses, secure cryptographically-hashed password keys, patient age, and phone numbers.
        </p>

        <h3 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>2. Clinical Records</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Consultation slots, appointment dates, and user-provided health symptoms description text are stored exclusively to facilitate patient-to-doctor booking coordination.
        </p>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '2.5rem', textAlign: 'center' }}>
          <Link to="/" className="btn">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
