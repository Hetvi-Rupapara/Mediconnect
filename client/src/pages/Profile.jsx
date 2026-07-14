import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, EmailIcon, StethoscopeIcon, CalendarIcon, BriefcaseIcon, DollarIcon, LocationIcon, ShieldIcon, LogoutIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationProvider.jsx';

/**
 * Profile Component
 * Redesigned Account Profile Settings Dashboard.
 * Delivers a premium, healthcare-focused UI/UX matching Practo/Apollo styles.
 * Organizes information cleanly using descriptive cards, dynamic counters, and custom action links.
 */
function Profile() {
  useEffect(() => {
    document.title = 'MediConnect | Profile';
  }, []);

  const { showNotification, showConfirm, showLoading, hideLoading } = useNotification();
  const navigate = useNavigate();

  // Authentication & Global states
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointmentCount, setAppointmentCount] = useState(0);

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

  // Password form toggle state
  const [showPasswordForm, setShowPasswordForm] = useState(false);



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

        // 2. Fetch user appointments count dynamically
        const appRes = await fetch('/api/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          setAppointmentCount(appData.length);
        }

        if (userData.role === 'doctor') {
          // 3. Fetch doctor details
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

  // Execute logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Helper to extract initials
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const cleanName = fullName.trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Submit Patient profile details
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientSuccess('');
    setPatientSaveLoading(true);
    showLoading('Updating profile...');

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

      hideLoading();
      showNotification('Profile updated successfully!', 'success');
      setPatientEditMode(false);
    } catch (err) {
      hideLoading();
      setPatientError(err.message);
    } finally {
      setPatientSaveLoading(false);
    }
  };

  // Submit Doctor profile details
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setDoctorError('');
    setDoctorSuccess('');
    setDoctorSaveLoading(true);
    showLoading('Updating profile...');

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

      hideLoading();
      showNotification('Doctor information updated successfully!', 'success');
      setDoctorEditMode(false);
    } catch (err) {
      hideLoading();
      setDoctorError(err.message);
    } finally {
      setDoctorSaveLoading(false);
    }
  };

  // Toggle availability days
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
    showLoading('Updating availability...');

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
      hideLoading();
      showNotification('Availability schedule saved successfully!', 'success');
    } catch (err) {
      hideLoading();
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
    showLoading('Updating password...');
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

      hideLoading();
      showNotification('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      hideLoading();
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper date formatter for "Member Since"
  const getMemberSinceDate = () => {
    const creationDate = userRole === 'doctor' ? doctorProfile?.createdAt : patientProfile?.createdAt;
    if (!creationDate) return 'Recently Joined';
    const dateObj = new Date(creationDate);
    return dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const displayName = userRole === 'doctor' ? doctorProfile?.name : patientProfile?.name;
  const displayEmail = JSON.parse(localStorage.getItem('user'))?.email;
  const roleLabel = userRole === 'doctor' ? 'DOCTOR' : 'PATIENT';

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Page Title */}
      <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Profile</h2>
      </div>

      <div className="profile-layout-grid">
        {/* ==========================================
            LEFT COLUMN: PROFILE SUMMARY CARD
           ========================================== */}
        <div>
          <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            {/* Initials Avatar */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.25rem',
              fontWeight: '800',
              margin: '0 auto 1.25rem auto',
              border: '2px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {getInitials(displayName)}
            </div>

            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1.35rem', fontWeight: '700' }}>{displayName}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <a href={`mailto:${displayEmail}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{displayEmail}</a>
            </p>
            


            {/* Role Badge */}
            <span style={{ 
              display: 'inline-block',
              textTransform: 'uppercase', 
              fontSize: '0.75rem', 
              fontWeight: '800', 
              letterSpacing: '0.08em', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary-color)',
              padding: '0.35rem 1rem',
              borderRadius: '30px',
              marginBottom: '2rem',
              border: '1px solid rgba(13, 148, 136, 0.15)'
            }}>
              {roleLabel}
            </span>

            {/* Profile Statistics info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0', marginBottom: '2rem', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Member Since</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{getMemberSinceDate()}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Appointments</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)', fontWeight: '700' }}>{appointmentCount}</strong>
              </div>
            </div>

            {userRole === 'doctor' ? (
              <button 
                onClick={() => setDoctorEditMode(!doctorEditMode)} 
                className="btn" 
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', backgroundColor: 'var(--primary-color)' }}
              >
                {doctorEditMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            ) : (
              <button 
                onClick={() => setPatientEditMode(!patientEditMode)} 
                className="btn" 
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', backgroundColor: 'var(--primary-color)' }}
              >
                {patientEditMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: FORMS & DETAILS CARDS
           ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* ============ CARD 1: PERSONAL INFORMATION ============ */}
          {userRole === 'doctor' ? (
            /* DOCTOR INFORMATION CARD */
            <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
                <UserIcon size={20} color="var(--primary-color)" style={{ marginRight: '0.6rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Doctor Information
                </h3>
              </div>

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
                /* Doctor View Details blocks */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem 2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Full Name</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{doctorProfile?.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Email Address</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{displayEmail}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Specialization</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{doctorProfile?.specialization}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Years of Experience</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{doctorProfile?.experience} years</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Consultation Fee</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>${doctorProfile?.fees} per session</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Affiliated Clinic/Hospital</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{doctorProfile?.hospital}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Biography Details</span>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {doctorProfile?.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not Added</span>}
                    </p>
                  </div>
                </div>
              ) : (
                /* Doctor Edit Form */
                <form onSubmit={handleDoctorSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Full Name</label>
                      <input
                        type="text"
                        className="search-input"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Specialization</label>
                      <input
                        type="text"
                        className="search-input"
                        value={doctorSpecialization}
                        onChange={(e) => setDoctorSpecialization(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Experience (Years)</label>
                      <input
                        type="number"
                        className="search-input"
                        value={doctorExperience}
                        onChange={(e) => setDoctorExperience(e.target.value)}
                        required
                        min="0"
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Consultation Fee ($)</label>
                      <input
                        type="number"
                        className="search-input"
                        value={doctorFees}
                        onChange={(e) => setDoctorFees(e.target.value)}
                        required
                        min="0"
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Clinic/Hospital Affiliation</label>
                    <input
                      type="text"
                      className="search-input"
                      value={doctorHospital}
                      onChange={(e) => setDoctorHospital(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.65rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Biography Details</label>
                    <textarea
                      className="search-input"
                      value={doctorBio}
                      onChange={(e) => setDoctorBio(e.target.value)}
                      rows="4"
                      style={{ width: '100%', resize: 'none', lineHeight: '1.4', padding: '0.65rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn" disabled={doctorSaveLoading} style={{ flex: 1, backgroundColor: 'var(--primary-color)' }}>
                      {doctorSaveLoading ? 'Saving...' : 'Save Changes'}
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
            <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
                <UserIcon size={20} color="var(--primary-color)" style={{ marginRight: '0.6rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  Personal Information
                </h3>
              </div>

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
                /* Patient View Details block with icons next to fields */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem 2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Name</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserIcon size={16} color="var(--text-secondary)" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                      <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{patientProfile?.name}</strong>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Email</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon size={16} color="var(--text-secondary)" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                      <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{patientProfile?.email}</strong>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Phone</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Inline Phone SVG */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {patientProfile?.phone ? (
                        <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{patientProfile.phone}</strong>
                      ) : (
                        <span 
                          onClick={() => setPatientEditMode(true)} 
                          style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}
                        >
                          + Add Phone Number
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Age</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon size={16} color="var(--text-secondary)" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                      {patientProfile?.age ? (
                        <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>{patientProfile.age} years old</strong>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>Not Added</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Patient Edit Form */
                <form onSubmit={handlePatientSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Name</label>
                      <input
                        type="text"
                        className="search-input"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Email</label>
                      <input
                        type="email"
                        className="search-input"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Phone</label>
                      <input
                        type="text"
                        className="search-input"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="Enter phone number"
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Age</label>
                      <input
                        type="number"
                        className="search-input"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="Enter age"
                        min="0"
                        max="120"
                        style={{ width: '100%', padding: '0.65rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn" disabled={patientSaveLoading} style={{ flex: 1, backgroundColor: 'var(--primary-color)' }}>
                      {patientSaveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setPatientEditMode(false)} className="btn" style={{ flex: 1, backgroundColor: 'var(--text-secondary)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============ CARD 2: SECURITY (CHANGE PASSWORD) ============ */}
          <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.35rem' }}>
              {/* Inline Shield Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                Security
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
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

            {!showPasswordForm ? (
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Password</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600', display: 'block', marginBottom: '1.25rem' }}>************</strong>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="btn"
                  style={{ width: '100%', backgroundColor: 'var(--primary-color)', padding: '0.8rem', fontWeight: '600' }}
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Current Password</label>
                    <input
                      type="password"
                      className="search-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>New Password</label>
                    <input
                      type="password"
                      className="search-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>Confirm Password</label>
                    <input
                      type="password"
                      className="search-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={passwordLoading}
                    style={{ flex: 1, backgroundColor: 'var(--primary-color)', padding: '0.8rem', fontWeight: '600' }}
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="btn"
                    style={{ flex: 1, backgroundColor: 'var(--text-secondary)', padding: '0.8rem', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ============ CARD 3: ACCOUNT (LOGOUT) ============ */}
          <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.35rem' }}>
              {/* Inline Settings Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                Account
              </h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Manage your account settings.
            </p>

            <button 
              onClick={() => showConfirm('Are you sure you want to log out of your account?', handleLogout)} 
              className="btn btn-danger" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '700',
                padding: '0.8rem'
              }}
            >
              <LogoutIcon size={18} style={{ marginRight: '0.4rem', color: '#fff' }} />
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
