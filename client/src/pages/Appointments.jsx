import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, LocationIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationProvider.jsx';
import { API_BASE_URL, handleApiResponse } from '../config/api.js';

/**
 * Appointments Component
 * Renders patient's bookings and historical record divided into tabs:
 * Upcoming, Completed, and Medical Records.
 */
function Appointments() {
  useEffect(() => {
    document.title = 'MediConnect | My Appointments';
  }, []);

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
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

    const fetchAppointmentsAndRecords = async () => {
      try {
        // 1. Fetch all appointments
        const response = await fetch(`${API_BASE_URL}/api/appointments`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await handleApiResponse(response);

        setAppointments(data);

        // 2. Fetch health records belonging to this logged-in patient
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.id) {
          const recResponse = await fetch(`${API_BASE_URL}/api/health-records/patient/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const recData = await handleApiResponse(recResponse);
          if (recData) {
            setRecords(recData);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsAndRecords();
  }, [navigate]);

  const { showNotification, showConfirm } = useNotification();

  // Handle appointment cancellation (DELETE)
  const handleCancel = (id) => {
    showConfirm('Are you sure you want to cancel this appointment?', async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await handleApiResponse(response);

        // Update local state by removing the cancelled appointment
        setAppointments(appointments.filter((app) => app._id !== id));
        showNotification('Appointment cancelled successfully.', 'success');
      } catch (err) {
        showNotification(`Error cancelling appointment: ${err.message}`, 'error');
      }
    });
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
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Manage your scheduled sessions, view history, and access digital consultation records.
        </p>

        {error && (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '2rem' }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'upcoming' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
              color: activeTab === 'upcoming' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'completed' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
              color: activeTab === 'completed' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('records')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'records' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
              color: activeTab === 'records' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            Medical Records
          </button>
        </div>

        {/* ================= TAB 1: UPCOMING APPOINTMENTS ================= */}
        {activeTab === 'upcoming' && (
          <section>
            <h3 style={{ display: 'none' }}>Upcoming Appointments</h3>
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
        )}

        {/* ================= TAB 2: COMPLETED APPOINTMENTS ================= */}
        {activeTab === 'completed' && (
          <section>
            <h3 style={{ display: 'none' }}>Appointment History</h3>
            {history.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No past appointments found.</p>
              </div>
            ) : (
              <div className="appointment-list-wrapper">
                {history.map((app) => (
                  <div key={app._id} className="appointment-row" style={{ backgroundColor: '#fafafa', borderColor: '#e2e8f0' }}>
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
        )}

        {/* ================= TAB 3: MEDICAL RECORDS ================= */}
        {activeTab === 'records' && (
          <section>
            <h3 style={{ display: 'none' }}>Medical Records</h3>
            {records.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', fontWeight: '500' }}>
                  You don't have any medical records yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {records.map((rec) => (
                  <div key={rec._id} style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{rec.doctorName}</h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textTransform: 'uppercase', marginTop: '0.1rem' }}>
                            {rec.specialization}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '20px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                          {new Date(rec.visitDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Diagnosis Summary</strong>
                        <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4' }}>
                          {rec.diagnosisSummary}
                        </p>
                      </div>
                    </div>

                    <Link 
                      to={`/health-records/${rec._id}`} 
                      className="btn" 
                      style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Appointments;

