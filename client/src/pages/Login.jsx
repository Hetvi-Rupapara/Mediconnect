import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Login Component
 * Handles login credentials authentication.
 */
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  // Handle input field changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store JWT token and basic user details in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role
      if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      // Force page reload to update navigation bar states
      window.location.reload();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '3rem auto 0 auto' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
          Login to MediConnect
        </h2>

        {errorMessage && (
          <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* Email Address */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Enter your email"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '1rem' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Enter your password"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '1rem' }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '500', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>

      {/* Quick Tester Login Helper */}
      <div className="card" style={{ maxWidth: '500px', margin: '1.5rem auto 3rem auto', background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛠️ Tester Quick Login
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Click an account to automatically fill the credentials:
        </p>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Seeded Doctor Accounts:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button 
                type="button"
                className="btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer' }}
                onClick={() => setFormData({ email: 'sarah.jenkins@mediconnect.com', password: 'doctorpassword123' })}
              >
                Dr. Sarah (Cardio)
              </button>
              <button 
                type="button"
                className="btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer' }}
                onClick={() => setFormData({ email: 'amit.patel@mediconnect.com', password: 'doctorpassword123' })}
              >
                Dr. Amit (Derma)
              </button>
              <button 
                type="button"
                className="btn" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer' }}
                onClick={() => setFormData({ email: 'emily.watson@mediconnect.com', password: 'doctorpassword123' })}
              >
                Dr. Emily (Pedia)
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              💡 <em>To test as a Patient, simply use the "Register" link above to sign up instantly.</em>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
