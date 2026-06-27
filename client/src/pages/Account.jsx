import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Account Component
 * Entry gateway page for guest users to either Login or Create Account.
 */
function Account() {
  return (
    <div className="container" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>Welcome to MediConnect</h2>
        
        {/* Option 1: Login */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '500' }}>
            Already have an account?
          </p>
          <Link to="/login" className="btn" style={{ display: 'inline-block', width: '220px', padding: '0.85rem' }}>
            Login
          </Link>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--border-color)' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ padding: '0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        {/* Option 2: Register */}
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '500' }}>
            New to MediConnect?
          </p>
          <Link to="/register" className="btn" style={{ display: 'inline-block', width: '220px', padding: '0.85rem', backgroundColor: 'var(--text-secondary)' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Account;
