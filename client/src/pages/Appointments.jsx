import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, LocationIcon } from '../components/Icons';

/**
 * Appointments Component
 * Renders patient's upcoming bookings and complete historical record,
 * allowing cancellation of active sessions.
 */
function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists, redirect if not authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch appointments');
        }

        setAppointments(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Handle appointment cancellation (DELETE)
  const handleCancel = async (id) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }

      // Update local state by removing the cancelled appointment
      setAppointments(appointments.filter((app) => app._id !== id));
      alert('Appointment cancelled successfully.');
    } catch (err) {
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  // Helper function to split appointments into Upcoming vs History
  const getCategorizedAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Clear time for precise date comparison

    const upcoming = [];
    const history = [];

    appointments.forEach((app) => {
      const appDate = new Date(app.date);
      appDate.setHours(0, 0, 0, 0);

      // Check if it's upcoming (Date is today or future, and status is pending or accepted)
      const isUpcomingDate = appDate >= today;
      const isUpcomingStatus = app.status === 'pending' || app.status === 'accepted';

      if (isUpcomingDate && isUpcomingStatus) {
        upcoming.push(app);
      } else {
        history.push(app);
      }
    });

    // Sort history to show most recent first
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcoming, history };
  };

  const { upcoming, history } = getCategorizedAppointments();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading appointment records...</span>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>My Appointments</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your upcoming scheduled sessions and view your complete visit history.
        </p>

        {error && (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {/* ================= UPCOMING APPOINTMENTS ================= */}
        <section style={{ marginTop: '2rem' }}>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Upcoming Appointments ({upcoming.length})
          </h3>

          {upcoming.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>You have no upcoming appointments.</p>
              <button className="btn" style={{ marginTop: '1rem' }} onClick={() => navigate('/doctors')}>
                Find Doctors & Book
              </button>
            </div>
          ) : (
            <div className="appointment-list-wrapper">
              {upcoming.map((app) => (
                <div key={app._id} className="appointment-row">
                  {/* Appointment info details */}
                  <div className="appointment-info">
                    <h3>{app.doctor?.name}</h3>
                    <p style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                      {app.doctor?.specialization}
                    </p>
                    <div className="appointment-time-tag">
                      <CalendarIcon size={14} style={{ marginRight: '0.25rem' }} /> {new Date(app.date).toLocaleDateString()} at <ClockIcon size={14} style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }} /> {app.timeSlot}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <LocationIcon size={14} style={{ marginRight: '0.25rem' }} /> {app.doctor?.hospital}
                    </span>
                    {app.symptoms && (
                      <div className="appointment-symptoms">
                        <strong>Symptoms:</strong> {app.symptoms}
                      </div>
                    )}
                  </div>

                  {/* Status and Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <span className={`status-pill ${app.status}`}>
                      {app.status}
                    </span>
                    
                    <button
                      onClick={() => handleCancel(app._id)}
                      className="btn"
                      style={{ backgroundColor: 'var(--danger-color)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= APPOINTMENT HISTORY ================= */}
        <section style={{ marginTop: '3rem' }}>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Appointment History ({history.length})
          </h3>

          {history.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No past appointments found.</p>
            </div>
          ) : (
            <div className="appointment-list-wrapper">
              {history.map((app) => (
                <div key={app._id} className="appointment-row" style={{ backgroundColor: '#fafafa', borderColor: '#e2e8f0' }}>
                  {/* Appointment info details */}
                  <div className="appointment-info">
                    <h3 style={{ color: 'var(--text-secondary)' }}>{app.doctor?.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem' }}>
                      {app.doctor?.specialization}
                    </p>
                    <div className="appointment-time-tag">
                      <CalendarIcon size={14} style={{ marginRight: '0.25rem' }} /> {new Date(app.date).toLocaleDateString()} at <ClockIcon size={14} style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }} /> {app.timeSlot}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <LocationIcon size={14} style={{ marginRight: '0.25rem' }} /> {app.doctor?.hospital}
                    </span>
                    {app.symptoms && (
                      <div className="appointment-symptoms" style={{ borderLeftColor: '#cbd5e1', backgroundColor: '#f1f5f9' }}>
                        <strong>Symptoms:</strong> {app.symptoms}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`status-pill ${app.status}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Appointments;
