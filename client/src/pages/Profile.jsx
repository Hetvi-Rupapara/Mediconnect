import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EmailIcon, StethoscopeIcon, CalendarIcon, BriefcaseIcon, DollarIcon, LocationIcon, ShieldIcon } from '../components/Icons';

/**
 * Profile Component
 * Redesigned Account Profile settings page.
 * Uses a professional two-column layout on desktop, initials-based avatars,
 * clean cards, and a custom logout confirmation modal.
 */
function Profile() {
  const navigate = useNavigate();

  // Authentication states
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Patient profile states
  const [patientProfile, setPatientProfile] = useState(null);
  const [patientEditMode, setPatientEditMode] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSaveLoading, setPatientSaveLoading] = useState(false);
  const [patientSuccess, setPatientSuccess] = useState('');
  const [patientError, setPatientError] = useState('');

  // Doctor profile states
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

  // Doctor Availability states
  const [availability, setAvailability] = useState([]);
  const [availSaveLoading, setAvailSaveLoading] = useState(false);
  const [availSuccess, setAvailSuccess] = useState('');
  const [availError, setAvailError] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // UI state for custom logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch core user data
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
          // Fetch doctor details
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
          // Patient profile
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

  // Execute actual logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Helper function to extract name initials
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const cleanName = fullName.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Save Patient edits
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

      setPatientSuccess('Profile details updated successfully!');
      setPatientEditMode(false);
      setTimeout(() => setPatientSuccess(''), 3000);
    } catch (err) {
      setPatientError(err.message);
    } finally {
      setPatientSaveLoading(false);
    }
  };

  // Save Doctor edits
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

      setDoctorSuccess('Doctor details updated successfully!');
      setDoctorEditMode(false);
      setTimeout(() => setDoctorSuccess(''), 3000);
    } catch (err) {
      setDoctorError(err.message);
    } finally {
      setDoctorSaveLoading(false);
    }
  };

  // Toggle Doctor weekday availability
  const handleAvailabilityToggle = (day) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter(d => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  // Save Doctor Availability array
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

  // Submit Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
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

      setPasswordSuccess('Password updated successfully!');
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

  // Display fields conditionally with fallback symbols
  const renderField = (value, fallbackText = '—') => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{fallbackText}</span>;
    }
    return <span>{value}</span>;
  };

  const displayName = userRole === 'doctor' ? doctorProfile?.name : patientProfile?.name;
  const displayEmail = JSON.parse(localStorage.getItem('user'))?.email;
  const roleLabel = userRole === 'doctor' ? 'Doctor' : 'Patient';

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Page Title */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Profile</h2>
      </div>

      <div className="profile-layout-grid">
        {/* ==========================================
            LEFT COLUMN: PROFILE SUMMARY CARD
           ========================================== */}
        <div>
          <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            {/* Initials Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 auto 1.25rem auto',
              border: '2px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {getInitials(displayName)}
            </div>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1.25rem' }}>{displayName}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{displayEmail}</p>
            
            <span className="status-badge" style={{ 
              display: 'inline-block',
              textTransform: 'uppercase', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              letterSpacing: '0.05em', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary-color)',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              marginBottom: '2rem'
            }}>
              {roleLabel}
            </span>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              {userRole === 'doctor' ? (
                <button 
                  onClick={() => setDoctorEditMode(!doctorEditMode)} 
                  className="btn" 
                  style={{ width: '100%', backgroundColor: doctorEditMode ? 'var(--text-secondary)' : 'var(--primary-color)' }}
                >
                  {doctorEditMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              ) : (
                <button 
                  onClick={() => setPatientEditMode(!patientEditMode)} 
                  className="btn" 
                  style={{ width: '100%', backgroundColor: patientEditMode ? 'var(--text-secondary)' : 'var(--primary-color)' }}
                >
                  {patientEditMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: FORMS & ACTIONS
           ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* ============ CARD 1: GENERAL INFORMATION / EDIT ============ */}
          {userRole === 'doctor' ? (
            /* DOCTOR INFORMATION CARD */
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Doctor Information
              </h3>

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
                /* Doctor View Mode */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Full Name</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{doctorProfile?.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Email Address</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{displayEmail}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Specialization</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{doctorProfile?.specialization}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Years of Experience</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{doctorProfile?.experience} years</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Consultation Fee</span>
                    <strong style={{ color: 'var(--text-primary)' }}>${doctorProfile?.fees}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Affiliated Clinic/Hospital</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{doctorProfile?.hospital}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Biography Details</span>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {doctorProfile?.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                    </p>
                  </div>
                </div>
              ) : (
                /* Doctor Edit Form */
                <form onSubmit={handleDoctorSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
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
                    <div>
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
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Consultation Fee ($)</label>
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
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Clinic/Hospital Affiliation</label>
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
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Biography Details</label>
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
          ) : (
            /* PATIENT PERSONAL INFORMATION CARD */
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Personal Information
              </h3>

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
                /* Patient View Mode */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Name</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{patientProfile?.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Email</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{patientProfile?.email}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Phone</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {renderField(patientProfile?.phone, 'Add Phone Number (Edit Profile)')}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Age</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {renderField(patientProfile?.age ? `${patientProfile.age} years old` : null)}
                    </strong>
                  </div>
                </div>
              ) : (
                /* Patient Edit Form */
                <form onSubmit={handlePatientSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
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

                    <div>
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
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
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

                    <div>
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
          )}

          {/* ============ DOCTOR AVAILABILITY SCHEDULE ============ */}
          {userRole === 'doctor' && (
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                Manage Availability
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {daysOfWeek.map((day) => (
                    <label key={day} className="checkbox-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                      <input
                        type="checkbox"
                        checked={availability.includes(day)}
                        onChange={() => handleAvailabilityToggle(day)}
                        style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{day}</span>
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
          )}

          {/* ============ CARD 2: SECURITY (CHANGE PASSWORD) ============ */}
          <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
              Security
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Update your password to keep your account secure.
            </p>

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Current Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>New Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Confirm Password</label>
                  <input
                    type="password"
                    className="search-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn"
                disabled={passwordLoading}
                style={{ width: '100%', backgroundColor: 'var(--text-secondary)' }}
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* ============ CARD 3: ACCOUNT (LOGOUT) ============ */}
          <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
              Account
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Manage your account actions.
            </p>

            <button 
              onClick={() => setShowLogoutModal(true)} 
              className="btn" 
              style={{ 
                width: '100%', 
                backgroundColor: 'var(--danger-color)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '700'
              }}
            >
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* ==========================================
          LOGOUT CONFIRMATION MODAL
         ========================================== */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            width: '90%',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              backgroundColor: '#fee2e2', 
              color: 'var(--danger-color)', 
              marginBottom: '1rem'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Confirm Logout</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to log out of your account?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout} 
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--danger-color)' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
