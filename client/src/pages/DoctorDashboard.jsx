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

        // Fetch today's appointments
        const appRes = await fetch('/api/appointments/today', {
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
          Welcome, <strong>Dr. {doctorProfile?.name}</strong>. Manage your scheduled patients and weekly work schedule.
        </p>

        {error && (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {/* Dashboard split content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', marginTop: '2rem' }}>
          
          {/* ============ TODAY'S APPOINTMENTS SECTION ============ */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
              Today's Appointments ({appointments.length})
            </h3>

            {appointments.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>You have no appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="appointment-list-wrapper">
                {appointments.map((app) => (
                  <div key={app._id} className="appointment-row">
                    {/* Patient info details */}
                    <div className="appointment-info">
                      <h3>{app.patient?.name}</h3>
                      <div className="appointment-time-tag">
                        🕒 Scheduled Time Slot: <strong>{app.timeSlot}</strong>
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

                    {/* Action Panel based on appointment status */}
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
          </div>

          {/* ============ MANAGE AVAILABILITY SECTION ============ */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Manage Availability
            </h3>
            
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
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
          </div>

        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
