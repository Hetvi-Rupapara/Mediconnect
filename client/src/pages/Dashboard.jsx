import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, LocationIcon, SearchIcon, AIIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationProvider.jsx';
import { API_BASE_URL, handleApiResponse } from '../config/api.js';

/**
 * Dashboard Component
 * Renders patient homepage summary, statistics, quick links, and inline profile editor.
 */
function Dashboard() {
  useEffect(() => {
    document.title = 'MediConnect | Dashboard';
  }, []);

  const { showNotification, showConfirm } = useNotification();
  const navigate = useNavigate();

  // Profile and appointment states
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    // 1. Role verification check
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'patient') {
      // Prevent doctors from viewing the patient dashboard
      navigate('/doctor/dashboard');
      return;
    }

    const loadDashboardData = async () => {
      try {
        // Fetch patient profile
        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let profileData;
        try {
          profileData = await handleApiResponse(profileRes);
        } catch (parseErr) {
          // If token expired/invalid, clear local credentials
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw parseErr;
        }

        setProfile(profileData);
        setEditData({ name: profileData.name, email: profileData.email });

        // Fetch patient appointments
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

  // Handle appointment cancellation
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

        // Update local appointments list state
        setAppointments(appointments.filter((app) => app._id !== id));
        showNotification('Appointment cancelled successfully.', 'success');
      } catch (err) {
        showNotification(`Error cancelling appointment: ${err.message}`, 'error');
      }
    });
  };

  // Submit profile details updates to backend
  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);
    setEditLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editData.name, email: editData.email })
      });

      const updatedUser = await handleApiResponse(response);

      // Update local states and localStorage metadata
      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }));

      setEditSuccess(true);
      setIsEditing(false);

      // Auto refresh navigation header states
      setTimeout(() => {
        setEditSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Calculate appointment statistics from state
  const getStatistics = () => {
    const stats = {
      total: appointments.length,
      pending: 0,
      completed: 0
    };

    appointments.forEach((app) => {
      if (app.status === 'pending') stats.pending += 1;
      if (app.status === 'completed') stats.completed += 1;
    });

    return stats;
  };

  // Abbreviated upcoming appointments filter (max 2 entries)
  const getUpcomingPreview = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments
      .filter((app) => {
        const appDate = new Date(app.date);
        appDate.setHours(0, 0, 0, 0);
        return appDate >= today && (app.status === 'pending' || app.status === 'accepted');
      })
      .slice(0, 2); // Show only top 2 upcoming appointments on dashboard home
  };

  const stats = getStatistics();
  const upcomingPreview = getUpcomingPreview();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading patient dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2>Welcome, {profile?.name}!</h2>
        <p>Your healthcare dashboard is active. Connect with qualified doctors and manage your appointments.</p>
      </div>

      {/* Main Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        
        {/* Left Column: Stats & Upcoming Slots */}
        <div>
          {/* Stats Grid */}
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>
            My Schedule Summary
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" style={{ color: '#d97706' }}>{stats.pending}</span>
              <span className="stat-label">Pending Reviews</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" style={{ color: 'var(--success-color)' }}>{stats.completed}</span>
              <span className="stat-label">Completed Visits</span>
            </div>
          </div>

          {/* Upcoming Appointment Preview Section */}
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)', marginTop: '2rem' }}>
            Next Scheduled Bookings
          </h3>

          {upcomingPreview.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No upcoming appointments scheduled.</p>
              <Link to="/doctors" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Book Appointment Now
              </Link>
            </div>
          ) : (
            <div className="appointment-list-wrapper">
              {upcomingPreview.map((app) => (
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
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <span className={`status-pill ${app.status}`}>
                      {app.status}
                    </span>
                    <button
                      onClick={() => handleCancel(app._id)}
                      className="btn"
                      style={{ backgroundColor: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/appointments" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
                  View All Appointments →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Profile Summary Sidebar & Quick Actions */}
        <div>
          {/* Profile Summary Card */}
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Profile Details
          </h3>
          
          <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
            {editSuccess && (
              <div className="status-badge success" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                Profile updated successfully!
              </div>
            )}

            {!isEditing ? (
              /* Profile static view */
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block' }}>Name</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{profile?.name}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block' }}>Email Address</span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{profile?.email}</span>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block' }}>Member Since</span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <button className="btn" style={{ width: '100%' }} onClick={() => setIsEditing(true)}>
                  Edit Profile Information
                </button>
              </div>
            ) : (
              /* Profile edit view */
              <form onSubmit={handleProfileUpdateSubmit}>
                {editError && (
                  <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem' }}>
                    {editError}
                  </div>
                )}
                
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="editName" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="editName"
                    value={editData.name}
                    className="search-input"
                    style={{ width: '100%', padding: '0.5rem' }}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="editEmail" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="editEmail"
                    value={editData.email}
                    className="search-input"
                    style={{ width: '100%', padding: '0.5rem' }}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn" disabled={editLoading} style={{ flex: 1, padding: '0.5rem' }}>
                    {editLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ flex: 1, backgroundColor: 'var(--text-secondary)', padding: '0.5rem' }}
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({ name: profile.name, email: profile.email });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Actions Panel */}
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            Quick Actions
          </h3>
          <div className="actions-grid">
            <Link to="/doctors" className="action-link-btn">
              <SearchIcon size={18} style={{ marginRight: '0.5rem' }} /> Find and Browse Doctors
            </Link>
            <Link to="/appointments" className="action-link-btn">
              <CalendarIcon size={18} style={{ marginRight: '0.5rem' }} /> My Appointments History
            </Link>
            <Link 
              to="/ai-assistant" 
              className="action-link-btn"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
              <AIIcon size={18} style={{ marginRight: '0.5rem' }} /> Consult AI Health Assistant
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
