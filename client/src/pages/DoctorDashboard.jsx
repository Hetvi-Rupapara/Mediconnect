import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, EmailIcon, CalendarIcon } from '../components/Icons';

/**
 * DoctorDashboard Component
 * Portal dashboard that manages today's, upcoming, and past appointment statuses.
 */
function DoctorDashboard() {
  const navigate = useNavigate();

  // Doctor and connection states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Role verification check
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
          Welcome, <strong>{doctorProfile?.name && (doctorProfile.name.toLowerCase().startsWith('dr.') ? doctorProfile.name : `Dr. ${doctorProfile.name}`)}</strong>. Manage your scheduled patients and check appointments.
        </p>

        {error && (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {/* Dashboard content */}
        <div style={{ marginTop: '2rem', maxWidth: '800px', margin: '2rem auto' }}>
          
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
                        <ClockIcon size={14} style={{ marginRight: '0.25rem' }} /> Time Slot: <strong>{app.timeSlot}</strong>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <EmailIcon size={14} style={{ marginRight: '0.25rem' }} /> Contact: {app.patient?.email}
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
                        <CalendarIcon size={14} style={{ marginRight: '0.25rem' }} /> Date: <strong>{new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> | <ClockIcon size={14} style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }} /> Slot: <strong>{app.timeSlot}</strong>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <EmailIcon size={14} style={{ marginRight: '0.25rem' }} /> Contact: {app.patient?.email}
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
                        <CalendarIcon size={14} style={{ marginRight: '0.25rem' }} /> Date: <strong>{new Date(app.date).toLocaleDateString()}</strong> | <ClockIcon size={14} style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }} /> Slot: <strong>{app.timeSlot}</strong>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <EmailIcon size={14} style={{ marginRight: '0.25rem' }} /> Contact: {app.patient?.email}
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

        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
