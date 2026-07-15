import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClockIcon, EmailIcon, CalendarIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationProvider.jsx';
import { API_BASE_URL, handleApiResponse } from '../config/api.js';

/**
 * DoctorDashboard Component
 * Portal dashboard that manages today's, upcoming, and past appointment statuses.
 */
function DoctorDashboard() {
  useEffect(() => {
    document.title = 'MediConnect | Doctor Dashboard';
  }, []);

  const { showNotification, showConfirm } = useNotification();
  const navigate = useNavigate();

  // Doctor and connection states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Section toggle state
  const [activeSection, setActiveSection] = useState('appointments');

  // Manage Availability states
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');

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
        const profileRes = await fetch(`${API_BASE_URL}/api/doctors/profile/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await handleApiResponse(profileRes);
        
        setDoctorProfile(profileData);
        setWorkingDays(profileData.workingDays || profileData.availability || []);
        setUnavailableDates(profileData.unavailableDates || []);
        setStartTime(profileData.startTime || '09:00 AM');
        setEndTime(profileData.endTime || '05:00 PM');
        
        // Fetch all appointments for the doctor
        const appRes = await fetch(`${API_BASE_URL}/api/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appData = await handleApiResponse(appRes);

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
    const actionText = newStatus === 'accepted' ? 'accept' : newStatus === 'rejected' ? 'reject' : 'complete';
    showConfirm(`Are you sure you want to ${actionText} this appointment?`, async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        const updatedApp = await handleApiResponse(response);

        // Update the local appointments list state with the updated appointment details
        setAppointments(appointments.map((app) => (app._id === appointmentId ? updatedApp : app)));
        showNotification(`Appointment ${newStatus} successfully.`, 'success');
      } catch (err) {
        showNotification(`Error updating status: ${err.message}`, 'error');
      }
    });
  };

  // Toggle checkbox for regular working days list
  const handleDayToggle = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  // Submit/save weekly working days selection to backend
  const handleAvailabilitySave = async (e) => {
    e.preventDefault();
    setAvailabilitySuccess('');
    setAvailabilityError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile/working-days`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workingDays, startTime, endTime })
      });

      const data = await handleApiResponse(response);

      setDoctorProfile(data);
      setAvailabilitySuccess('Regular working days updated successfully.');
      setTimeout(() => setAvailabilitySuccess(''), 3000);
    } catch (err) {
      setAvailabilityError(err.message || 'Error updating availability');
    }
  };

  // Submit/add custom unavailable date to backend
  const handleAddUnavailableDate = async (e) => {
    e.preventDefault();
    if (!newDate) return;
    setAvailabilitySuccess('');
    setAvailabilityError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile/unavailable-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate })
      });

      const data = await handleApiResponse(response);

      setDoctorProfile(data);
      setUnavailableDates(data.unavailableDates);
      setNewDate('');
      setAvailabilitySuccess('Unavailable date added successfully.');
      setTimeout(() => setAvailabilitySuccess(''), 3000);
    } catch (err) {
      setAvailabilityError(err.message || 'Error adding date');
    }
  };

  // Delete custom unavailable date from backend list
  const handleDeleteUnavailableDate = async (dateStr) => {
    setAvailabilitySuccess('');
    setAvailabilityError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctors/profile/unavailable-dates/${dateStr}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await handleApiResponse(response);

      setDoctorProfile(data);
      setUnavailableDates(data.unavailableDates);
      setAvailabilitySuccess('Unavailable date removed successfully.');
      setTimeout(() => setAvailabilitySuccess(''), 3000);
    } catch (err) {
      setAvailabilityError(err.message || 'Error removing date');
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
          
          {/* Section Toggle Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '2rem' }}>
            <button
              onClick={() => setActiveSection('appointments')}
              style={{
                padding: '0.75rem 0.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeSection === 'appointments' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                color: activeSection === 'appointments' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveSection('availability')}
              style={{
                padding: '0.75rem 0.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeSection === 'availability' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                color: activeSection === 'availability' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              Manage Availability
            </button>
          </div>

          {/* ============ TAB 1: APPOINTMENTS PORTAL ============ */}
          {activeSection === 'appointments' && (
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
                              <Link
                                to={`/consultation-record/${app._id}`}
                                className="btn"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center', display: 'inline-flex', alignItems: 'center' }}
                              >
                                Consultation Record
                              </Link>
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
                              <Link
                                to={`/consultation-record/${app._id}`}
                                className="btn"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center', display: 'inline-flex', alignItems: 'center' }}
                              >
                                Consultation Record
                              </Link>
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
          )}

          {/* ============ TAB 2: MANAGE AVAILABILITY PORTAL ============ */}
          {activeSection === 'availability' && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                Manage Availability
              </h3>

              {availabilitySuccess && (
                <div className="status-badge success" style={{ padding: '0.8rem', width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
                  {availabilitySuccess}
                </div>
              )}
              {availabilityError && (
                <div className="status-badge danger" style={{ padding: '0.8rem', width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
                  {availabilityError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Card 1: Regular Working Days */}
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700' }}>
                    Regular Working Days
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Select the weekdays you are usually available to accept consultations:
                  </p>

                  <form onSubmit={handleAvailabilitySave}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <label key={day} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          <input
                            type="checkbox"
                            checked={workingDays.includes(day)}
                            onChange={() => handleDayToggle(day)}
                            style={{ marginRight: '0.6rem', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          {day}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Working Hours</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Start Time</span>
                          <select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: '#fff' }}
                          >
                            {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>End Time</span>
                          <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: '#fff' }}
                          >
                            {['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn"
                      style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem', fontSize: '0.9rem' }}
                    >
                      Save Availability
                    </button>
                  </form>
                </div>

                {/* Card 2: Unavailable Dates */}
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700' }}>
                    Unavailable Dates
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Add individual dates when you will not be available for appointments:
                  </p>

                  <form onSubmit={handleAddUnavailableDate} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <button
                      type="submit"
                      className="btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                    >
                      Add Date
                    </button>
                  </form>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>
                      Scheduled Holidays / Days Off:
                    </strong>
                    {unavailableDates.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                        No unavailable dates added.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                        {unavailableDates.map((dateStr) => {
                          // Format YYYY-MM-DD to friendly 'DD Mmm YYYY'
                          const parts = dateStr.split('-');
                          const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                          const formatted = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                          return (
                            <div key={dateStr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                {formatted}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteUnavailableDate(dateStr)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                              >
                                Delete
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
