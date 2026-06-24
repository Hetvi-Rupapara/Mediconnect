import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Login Component
 * Handles login credentials authentication.
 */
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient' // Default selection is patient
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password, role } = formData;

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

      // Verify that the user's registered role matches their selected login role
      if (data.user.role !== role) {
        throw new Error(`This account is registered as a ${data.user.role}, not a ${role}.`);
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
          <div style={{ marginBottom: '1rem' }}>
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

          {/* Role selection dropdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Login As</label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '1rem', background: '#fff' }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
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
    </div>
  );
}

export default Login;
