import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EmailIcon, StethoscopeIcon, CalendarIcon, BriefcaseIcon, DollarIcon, LocationIcon, ShieldIcon, LogoutIcon } from '../components/Icons';

/**
 * Profile Component
 * Unified Profile and Account Settings manager.
 * Adapts dynamically to render the correct profile forms and configuration options
 * depending on whether the authenticated user is a Patient or a Doctor.
 */
function Profile() {
  const navigate = useNavigate();

  // Common authentication states
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Patient states
  const [patientProfile, setPatientProfile] = useState(null);
  const [patientEditMode, setPatientEditMode] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSaveLoading, setPatientSaveLoading] = useState(false);
  const [patientSuccess, setPatientSuccess] = useState('');
  const [patientError, setPatientError] = useState('');

  // Doctor states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctorEditMode, setDoctorEditMode] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialization, setDoctorSpecialization] = useState('');
  const [doctorExperience, setDoctorExperience] = useState('');
  const [doctorFees, setDoctorFees] = useState('');
  const [doctorHospital, setDoctorHospital] = useState('');
  const [doctorBio, setDoctorBio] = useState('');
  const [doctorSaveLoading, setDoctorSaveLoading] = useState(false);
  const [doctorSuccess, setDoctorSuccess] = useState('');
  const [doctorError, setDoctorError] = useState('');

  // Availability states
  const [availability, setAvailability] = useState([]);
  const [availSaveLoading, setAvailSaveLoading] = useState(false);
  const [availSuccess, setAvailSuccess] = useState('');
  const [availError, setAvailError] = useState('');

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        // 1. Fetch user core profile
        const userRes = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userRes.json();

        if (!userRes.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error(userData.message || 'Session expired');
        }

        setUserRole(userData.role);

        if (userData.role === 'doctor') {
          // 2. Fetch doctor specific details
          const docRes = await fetch('/api/doctors/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const docData = await docRes.json();

          if (!docRes.ok) {
            throw new Error(docData.message || 'Failed to retrieve doctor details');
          }

          setDoctorProfile(docData);
          setDoctorName(docData.name || '');
          setDoctorSpecialization(docData.specialization || '');
          setDoctorExperience(docData.experience || '');
          setDoctorFees(docData.fees || '');
          setDoctorHospital(docData.hospital || '');
          setDoctorBio(docData.bio || '');
          setAvailability(docData.availability || []);
        } else {
          // Patient core profile
          setPatientProfile(userData);
          setPatientName(userData.name || '');
          setPatientEmail(userData.email || '');
          setPatientPhone(userData.phone || '');
          setPatientAge(userData.age || '');
        }
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Submit Patient profile updates
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientSuccess('');

    if (!patientName.trim()) {
      setPatientError('Name is required');
      return;
    }
    if (!patientEmail.trim()) {
      setPatientError('Email is required');
      return;
    }

    setPatientSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: patientName,
          email: patientEmail,
          phone: patientPhone,
          age: patientAge ? Number(patientAge) : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setPatientProfile(data);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }));

      setPatientSuccess('Profile updated successfully!');
      setPatientEditMode(false);
      setTimeout(() => setPatientSuccess(''), 3000);
    } catch (err) {
      setPatientError(err.message);
    } finally {
      setPatientSaveLoading(false);
    }
  };

  // Submit Doctor profile updates
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setDoctorError('');
    setDoctorSuccess('');

    if (!doctorName.trim() || !doctorSpecialization.trim() || !doctorHospital.trim()) {
      setDoctorError('Required profile fields cannot be empty');
      return;
    }

    setDoctorSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/doctors/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: doctorName,
          specialization: doctorSpecialization,
          experience: Number(doctorExperience),
          fees: Number(doctorFees),
          hospital: doctorHospital,
          bio: doctorBio
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update doctor profile');
      }

      setDoctorProfile(data);
      // Sync user local storage name
      const userObj = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...userObj, name: data.name }));

      setDoctorSuccess('Doctor information updated successfully!');
      setDoctorEditMode(false);
      setTimeout(() => setDoctorSuccess(''), 3000);
    } catch (err) {
      setDoctorError(err.message);
    } finally {
      setDoctorSaveLoading(false);
    }
  };

  // Toggle Availability weekday array
  const handleAvailabilityToggle = (day) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter(d => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  // Save Availability array
  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setAvailError('');
    setAvailSuccess('');
    setAvailSaveLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/doctors/profile/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability schedule');
      }

      setDoctorProfile(data);
      setAvailSuccess('Availability schedule saved successfully!');
      setTimeout(() => setAvailSuccess(''), 3000);
    } catch (err) {
      setAvailError(err.message);
    } finally {
      setAvailSaveLoading(false);
    }
  };

  // Submit Password changes
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
        <span className="status-badge loading">Loading account profile...</span>
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
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Account Profile</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your personal information, configure options, and update credentials.
        </p>
      </div>

      {userRole === 'doctor' ? (
        // ==========================================
        // DOCTOR PROFILE VIEW
        // ==========================================
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          {/* LEFT: DOCTOR GENERAL INFORMATION & EDIT */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
              Doctor Information
            </h3>

            <div className="card" style={{ marginTop: '1rem', padding: '2rem' }}>
              {doctorSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                  {doctorSuccess}
                </div>
              )}
              {doctorError && (
                <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                  {doctorError}
                </div>
              )}

              {!doctorEditMode ? (
                // View Mode
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Full Name</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{doctorProfile?.name}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Email Address</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {JSON.parse(localStorage.getItem('user'))?.email}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <StethoscopeIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Specialization</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{doctorProfile?.specialization}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <BriefcaseIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Years of Experience</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{doctorProfile?.experience} years</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <DollarIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Consultation Fee</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>${doctorProfile?.fees} per session</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Hospital Affiliation</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{doctorProfile?.hospital}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <ShieldIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem', marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Biography Details</span>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)', lineHeight: '1.5', fontSize: '0.95rem' }}>
                          {doctorProfile?.bio || 'No bio provided yet.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <button onClick={() => setDoctorEditMode(true)} className="btn" style={{ width: '100%' }}>
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleDoctorSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Full Name</label>
                    <input
                      type="text"
                      className="search-input"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Specialization</label>
                    <input
                      type="text"
                      className="search-input"
                      value={doctorSpecialization}
                      onChange={(e) => setDoctorSpecialization(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Experience (Years)</label>
                      <input
                        type="number"
                        className="search-input"
                        value={doctorExperience}
                        onChange={(e) => setDoctorExperience(e.target.value)}
                        required
                        min="0"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Fees ($)</label>
                      <input
                        type="number"
                        className="search-input"
                        value={doctorFees}
                        onChange={(e) => setDoctorFees(e.target.value)}
                        required
                        min="0"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Hospital Affiliation</label>
                    <input
                      type="text"
                      className="search-input"
                      value={doctorHospital}
                      onChange={(e) => setDoctorHospital(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Bio Details</label>
                    <textarea
                      className="search-input"
                      value={doctorBio}
                      onChange={(e) => setDoctorBio(e.target.value)}
                      rows="4"
                      style={{ width: '100%', resize: 'none', lineHeight: '1.4' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn" disabled={doctorSaveLoading} style={{ flex: 1 }}>
                      {doctorSaveLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button type="button" onClick={() => setDoctorEditMode(false)} className="btn" style={{ flex: 1, backgroundColor: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: MANAGE AVAILABILITY & ACCOUNT (PASSWORD / LOGOUT) */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Manage Availability
            </h3>
            
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Select the weekdays you are available to accept patient consultations:
              </p>

              {availSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                  {availSuccess}
                </div>
              )}
              {availError && (
                <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                  {availError}
                </div>
              )}

              <form onSubmit={handleAvailabilitySubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {daysOfWeek.map((day) => (
                    <label key={day} className="checkbox-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={availability.includes(day)}
                        onChange={() => handleAvailabilityToggle(day)}
                        style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={availSaveLoading}
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
                >
                  {availSaveLoading ? 'Saving Schedule...' : 'Save Availability'}
                </button>
              </form>
            </div>

            {/* UNIFIED ACCOUNT SECTION */}
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Account
            </h3>

            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '1rem' }}>
                Change Password
              </span>

              {passwordSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.4rem' }}>
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.4rem' }}>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Current Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>New Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={passwordLoading}
                  style={{ width: '100%', backgroundColor: 'var(--text-secondary)', marginBottom: '1.5rem' }}
                >
                  {passwordLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleLogout} 
                  className="btn" 
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--danger-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <LogoutIcon size={18} style={{ marginRight: '0.4rem' }} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // PATIENT PROFILE VIEW
        // ==========================================
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          {/* LEFT: MY PROFILE INFO */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
              My Profile
            </h3>

            <div className="card" style={{ marginTop: '1rem', padding: '2rem' }}>
              {patientSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                  {patientSuccess}
                </div>
              )}
              {patientError && (
                <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.5rem' }}>
                  {patientError}
                </div>
              )}

              {!patientEditMode ? (
                // View Mode
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Name</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{patientProfile?.name}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Email</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{patientProfile?.email}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Phone</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {patientProfile?.phone || 'Not provided'}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <BriefcaseIcon size={20} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Age</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {patientProfile?.age ? `${patientProfile.age} years old` : 'Not provided'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '2.5rem' }}>
                    <button onClick={() => setPatientEditMode(true)} className="btn" style={{ width: '100%' }}>
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handlePatientSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Name</label>
                    <input
                      type="text"
                      className="search-input"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Email</label>
                    <input
                      type="email"
                      className="search-input"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Phone</label>
                    <input
                      type="text"
                      className="search-input"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="Enter phone number"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Age</label>
                    <input
                      type="number"
                      className="search-input"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Enter age"
                      min="0"
                      max="120"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn" disabled={patientSaveLoading} style={{ flex: 1 }}>
                      {patientSaveLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button type="button" onClick={() => setPatientEditMode(false)} className="btn" style={{ flex: 1, backgroundColor: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: ACCOUNT SECTION (PASSWORD / LOGOUT) */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Account
            </h3>

            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '1rem' }}>
                Change Password
              </span>

              {passwordSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.4rem' }}>
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.25rem', padding: '0.4rem' }}>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Current Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>New Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={passwordLoading}
                  style={{ width: '100%', backgroundColor: 'var(--text-secondary)', marginBottom: '1.5rem' }}
                >
                  {passwordLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleLogout} 
                  className="btn" 
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'var(--danger-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <LogoutIcon size={18} style={{ marginRight: '0.4rem' }} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
