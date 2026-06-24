import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DoctorDashboard Component
 * Portal dashboard that manages today's appointment statuses and weekly availability schedule.
 */
function DoctorDashboard() {
  const navigate = useNavigate();

  // Doctor and connection states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Availability checkboxes state
  const [availability, setAvailability] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile editing form states
  const [profileData, setProfileData] = useState({
    name: '',
    specialization: '',
    experience: '',
    fees: '',
    hospital: '',
    bio: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // 1. Role verification check
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'doctor') {
      // Prevent patients from viewing the doctor dashboard
      navigate('/dashboard');
      return;
    }

    const loadDashboardData = async () => {
      try {
        // Fetch doctor profile data
        const profileRes = await fetch('/api/doctors/profile/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        
        if (!profileRes.ok) {
          throw new Error(profileData.message || 'Failed to fetch doctor profile');
        }
        
        setDoctorProfile(profileData);
        setAvailability(profileData.availability || []);
        
        // Populate profile edit form initial values
        setProfileData({
          name: profileData.name || '',
          specialization: profileData.specialization || '',
          experience: profileData.experience || '',
          fees: profileData.fees || '',
          hospital: profileData.hospital || '',
          bio: profileData.bio || ''
        });

        // Fetch all appointments for the doctor
        const appRes = await fetch('/api/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appData = await appRes.json();

        if (!appRes.ok) {
          throw new Error(appData.message || 'Failed to fetch today\'s appointments');
        }

        setAppointments(appData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  // Handle status update (Accept / Reject / Complete)
  const handleStatusChange = async (appointmentId, newStatus) => {
    const confirmChange = window.confirm(`Are you sure you want to mark this appointment as ${newStatus}?`);
    if (!confirmChange) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const updatedApp = await response.json();

      if (!response.ok) {
        throw new Error(updatedApp.message || 'Failed to update status');
      }

      // Update the local appointments list state with the updated appointment details
      setAppointments(appointments.map((app) => (app._id === appointmentId ? updatedApp : app)));
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Toggle availability days checkboxes
  const handleCheckboxChange = (day) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter((d) => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  // Submit availability updates to server
  const saveAvailability = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);

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

      const updatedProfile = await response.json();

      if (!response.ok) {
        throw new Error(updatedProfile.message || 'Failed to update availability schedule');
      }

      setDoctorProfile(updatedProfile);
      setSaveSuccess(true);

      // Auto-hide success badge after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Error saving availability schedule: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit profile details updates to server
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/doctors/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const updatedProfile = await response.json();

      if (!response.ok) {
        throw new Error(updatedProfile.message || 'Failed to update profile details');
      }

      setDoctorProfile(updatedProfile);
      setProfileSuccess(true);
      
      // Update local storage user name too if it was changed
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser) {
        localUser.name = updatedProfile.name;
        localStorage.setItem('user', JSON.stringify(localUser));
      }

      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Group appointments into Today, Upcoming, and Past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppointments = [];
  const upcomingAppointments = [];
  const pastAppointments = [];

  appointments.forEach((app) => {
    const appDate = new Date(app.date);
    appDate.setHours(0, 0, 0, 0);

    if (appDate.getTime() === today.getTime()) {
      todayAppointments.push(app);
    } else if (appDate.getTime() > today.getTime()) {
      upcomingAppointments.push(app);
    } else {
      pastAppointments.push(app);
    }
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading doctor dashboard portal...</span>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Doctor Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Welcome, <strong>{doctorProfile?.name && (doctorProfile.name.toLowerCase().startsWith('dr.') ? doctorProfile.name : `Dr. ${doctorProfile.name}`)}</strong>. Manage your scheduled patients and weekly work schedule.
        </p>

        {error && (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {/* Dashboard split content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', marginTop: '2rem' }}>
          
          {/* ============ APPOINTMENTS PORTAL ============ */}
          <div>
            {/* TODAY'S APPOINTMENTS */}
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
              Today's Appointments ({todayAppointments.length})
            </h3>

            {todayAppointments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>You have no appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="appointment-list-wrapper" style={{ marginBottom: '2rem' }}>
                {todayAppointments.map((app) => (
                  <div key={app._id} className="appointment-row">
                    <div className="appointment-info">
                      <h3>{app.patient?.name}</h3>
                      <div className="appointment-time-tag">
                        🕒 Time Slot: <strong>{app.timeSlot}</strong>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        📧 Contact: {app.patient?.email}
                      </span>
                      {app.symptoms && (
                        <div className="appointment-symptoms">
                          <strong>Symptoms described:</strong> {app.symptoms}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                      <span className={`status-pill ${app.status}`}>
                        {app.status}
                      </span>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app._id, 'accepted')}
                              className="btn"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              className="btn"
                              style={{ backgroundColor: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {app.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app._id, 'completed')}
                              className="btn"
                              style={{ backgroundColor: 'var(--success-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              className="btn"
                              style={{ backgroundColor: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* UPCOMING APPOINTMENTS */}
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', marginTop: '2rem' }}>
              Upcoming Appointments ({upcomingAppointments.length})
            </h3>

            {upcomingAppointments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>You have no upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="appointment-list-wrapper" style={{ marginBottom: '2rem' }}>
                {upcomingAppointments.map((app) => (
                  <div key={app._id} className="appointment-row">
                    <div className="appointment-info">
                      <h3>{app.patient?.name}</h3>
                      <div className="appointment-time-tag">
                        📅 Date: <strong>{new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> | 🕒 Slot: <strong>{app.timeSlot}</strong>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        📧 Contact: {app.patient?.email}
                      </span>
                      {app.symptoms && (
                        <div className="appointment-symptoms">
                          <strong>Symptoms described:</strong> {app.symptoms}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                      <span className={`status-pill ${app.status}`}>
                        {app.status}
                      </span>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app._id, 'accepted')}
                              className="btn"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              className="btn"
                              style={{ backgroundColor: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {app.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app._id, 'completed')}
                              className="btn"
                              style={{ backgroundColor: 'var(--success-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              className="btn"
                              style={{ backgroundColor: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAST APPOINTMENTS */}
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', marginTop: '2rem' }}>
              Past Appointments ({pastAppointments.length})
            </h3>

            {pastAppointments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No past appointments recorded.</p>
              </div>
            ) : (
              <div className="appointment-list-wrapper">
                {pastAppointments.map((app) => (
                  <div key={app._id} className="appointment-row" style={{ opacity: 0.8 }}>
                    <div className="appointment-info">
                      <h3>{app.patient?.name}</h3>
                      <div className="appointment-time-tag">
                        📅 Date: <strong>{new Date(app.date).toLocaleDateString()}</strong> | 🕒 Slot: <strong>{app.timeSlot}</strong>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        📧 Contact: {app.patient?.email}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className={`status-pill ${app.status}`} style={{ filter: 'grayscale(30%)' }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============ MANAGE AVAILABILITY & PROFILE SECTION ============ */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Manage Availability
            </h3>
            
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Select the days of the week you are available for consultation bookings:
              </p>

              {saveSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                  Availability schedule saved successfully!
                </div>
              )}

              <form onSubmit={saveAvailability}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {daysOfWeek.map((day) => (
                    <label key={day} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={availability.includes(day)}
                        onChange={() => handleCheckboxChange(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={saveLoading}
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
                >
                  {saveLoading ? 'Saving...' : 'Save Availability Days'}
                </button>
              </form>
            </div>

            {/* EDIT PROFILE DETAILS */}
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Edit Profile Details
            </h3>

            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Configure your public doctor specialty, clinic, and description:
              </p>

              {profileSuccess && (
                <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                  Profile details updated successfully!
                </div>
              )}
              {profileError && (
                <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                {/* Doctor Name */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                  />
                </div>

                {/* Specialization */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Specialization</label>
                  <input
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Experience */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Experience (years)</label>
                    <input
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      required
                      min="0"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                    />
                  </div>
                  {/* Fees */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Fees ($)</label>
                    <input
                      type="number"
                      value={profileData.fees}
                      onChange={(e) => setProfileData({ ...profileData, fees: e.target.value })}
                      required
                      min="0"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                {/* Hospital / Clinic */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Affiliated Clinic/Hospital</label>
                  <input
                    type="text"
                    value={profileData.hospital}
                    onChange={(e) => setProfileData({ ...profileData, hospital: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                  />
                </div>

                {/* Bio */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Bio Details</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', fontSize: '0.95rem', resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={profileLoading}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {profileLoading ? 'Saving Profile...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
