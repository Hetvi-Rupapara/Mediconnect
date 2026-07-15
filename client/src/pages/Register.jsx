import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, handleApiResponse } from '../config/api.js';

/**
 * Register Component
 * Handles new account creation for both Patients and Doctors.
 */
function Register() {
  React.useEffect(() => {
    document.title = 'MediConnect | Register';
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' // Default role is patient
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await handleApiResponse(response);

      // Store JWT token and basic user details in local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role
      if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      // Force page reload to update navigation bar states (if needed)
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
          Create an Account
        </h2>

        {errorMessage && (
          <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              placeholder="Enter your full name"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '1rem' }}
            />
          </div>

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
              placeholder="Create a password"
              minLength="6"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '1rem' }}
            />
          </div>

          {/* Role selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Account Type</label>
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '500', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
