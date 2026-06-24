import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Profile Component
 * Account settings dashboard enabling profile details updates and secure password changes.
 */
function Profile() {
  const navigate = useNavigate();

  // Profile data and loading states
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form 1: Edit Profile details states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Form 2: Change Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          // Clear expired/invalid local storage credentials
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error(data.message || 'Session expired');
        }

        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Form 1: Validate and submit profile details changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Client-side Validation: Name required
    if (!name.trim()) {
      setProfileError('Name is required');
      return;
    }

    // Client-side Validation: Email required
    if (!email.trim()) {
      setProfileError('Email is required');
      return;
    }

    // Client-side Validation: Valid email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setProfileError('Please enter a valid email address');
      return;
    }

    setProfileLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile details');
      }

      setProfile(data);
      // Update details stored in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }));

      setProfileSuccess('Profile details updated successfully!');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Form 2: Validate and submit password changes
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Client-side Validation: Fields required
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    // Client-side Validation: New password length
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    // Client-side Validation: New passwords match check
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully!');
      
      // Reset password form inputs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto-clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading account settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--danger-color)' }}>Error Loading Profile</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your personal details, email configurations, and password security.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* ============ LEFT COLUMN: PROFILE DATA DETAILS & EDIT FORM ============ */}
        <div>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Personal Details
          </h3>

          <div className="card" style={{ marginTop: '1rem', padding: '2rem' }}>
            {profileSuccess && (
              <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              {/* Account Type info */}
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Account Type:</span>
                <span style={{ marginLeft: '0.5rem', textTransform: 'uppercase', fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary-color)' }}>
                  {profile?.role}
                </span>
                <span style={{ float: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Since {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Name field */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="Enter full name"
                />
              </div>

              {/* Email field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="Enter email address"
                />
              </div>

              <button type="submit" className="btn" disabled={profileLoading} style={{ width: '100%' }}>
                {profileLoading ? 'Saving changes...' : 'Save Profile details'}
              </button>
            </form>
          </div>
        </div>

        {/* ============ RIGHT COLUMN: SECURITY / CHANGE PASSWORD FORM ============ */}
        <div>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Security Settings
          </h3>

          <div className="card" style={{ marginTop: '1rem', padding: '2rem' }}>
            {passwordSuccess && (
              <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              {/* Current Password */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="Re-enter new password"
                />
              </div>

              <button type="submit" className="btn" disabled={passwordLoading} style={{ width: '100%', backgroundColor: 'var(--text-secondary)' }}>
                {passwordLoading ? 'Updating password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
