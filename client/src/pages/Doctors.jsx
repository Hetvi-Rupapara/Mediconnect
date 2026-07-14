import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, LocationIcon, DollarIcon, ShieldIcon } from '../components/Icons';

/**
 * Doctors Component
 * Lists all doctors and provides real-time search and filter controls.
 */
function Doctors() {
  useEffect(() => {
    document.title = 'MediConnect | Find Doctors';
  }, []);

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');
  const [promptDoctorId, setPromptDoctorId] = useState(null);

  // List of distinct specializations for the filter dropdown
  const specializations = [
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'General Physician'
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // Construct the query string dynamically
        let url = `/api/doctors?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (specialization) url += `specialization=${encodeURIComponent(specialization)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch doctors list');
        }

        setDoctors(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    // Use a small debounce style behavior or fetch immediately on inputs change
    fetchDoctors();
  }, [search, specialization]);

  return (
    <div className="container">
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Find a Doctor</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Search for medical specialists near you and book an appointment instantly.
        </p>

        {/* Filter and Search Controls */}
        <div className="filter-section">
          {/* Search text input */}
          <input
            type="text"
            className="search-input"
            placeholder="Search by doctor's name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Specialization select filter */}
          <select
            className="filter-select"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Loading and Error Indicators */}
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <span className="status-badge loading">Loading doctors list...</span>
          </div>
        ) : error ? (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center' }}>
            {error}
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)' }}>
            <h3>No doctors found</h3>
            <p>Try refining your search text or removing the specialization filter.</p>
          </div>
        ) : (
          /* Grid list of Doctor Cards */
          <div className="doctor-grid">
            {doctors.map((doc) => (
              <div key={doc._id} className="doctor-card">
                <div>
                  <h3>{doc.name}</h3>
                  <div className="doctor-specialization">{doc.specialization}</div>
                  
                  <div className="doctor-details-preview">
                    <span><BriefcaseIcon size={14} style={{ marginRight: '0.25rem' }} /> {doc.experience} years experience</span>
                    <span><LocationIcon size={14} style={{ marginRight: '0.25rem' }} /> {doc.hospital}</span>
                    <span><DollarIcon size={14} style={{ marginRight: '0.25rem' }} /> Consultation: ${doc.fees}</span>
                  </div>

                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {promptDoctorId === doc._id ? (
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Please sign in or create an account to book an appointment.
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to="/login" className="btn" style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>Login</Link>
                        <Link to="/register" className="btn" style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--text-secondary)', textAlign: 'center' }}>Create Account</Link>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setPromptDoctorId(null)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link to={`/doctors/${doc._id}`} className="btn" style={{ width: '100%', textAlign: 'center' }}>
                        View Profile
                      </Link>
                      {isLoggedIn ? (
                        <Link to={`/book/${doc._id}`} className="btn" style={{ width: '100%', textAlign: 'center', backgroundColor: 'var(--primary-color)' }}>
                          Book Appointment
                        </Link>
                      ) : (
                        <button 
                          onClick={() => setPromptDoctorId(doc._id)} 
                          className="btn" 
                          style={{ width: '100%', textAlign: 'center', backgroundColor: 'var(--primary-color)' }}
                        >
                          Book Appointment
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Doctors;
