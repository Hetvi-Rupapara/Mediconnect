import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

/**
 * DoctorDetails Component
 * Displays the complete profile bio, details, and schedule of a selected doctor.
 */
function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if patient is logged in (needed to show booking alerts later)
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(`/api/doctors/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch doctor details');
        }

        setDoctor(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching doctor details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading doctor profile details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--danger-color)' }}>Error Loading Profile</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn" onClick={() => navigate('/doctors')}>Back to Directory</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back button link */}
      <div style={{ marginTop: '2rem' }}>
        <Link to="/doctors" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
          ← Back to Doctors List
        </Link>
      </div>

      {doctor && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          {/* Header Summary */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{doctor.name}</h2>
            <div className="doctor-specialization" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {doctor.specialization}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              📍 Affiliated with <strong>{doctor.hospital}</strong>
            </p>
          </div>

          {/* Details split layout */}
          <div className="details-layout">
            {/* Left side: Bio and details */}
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>About the Doctor</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                {doctor.bio || 'No description available for this doctor.'}
              </p>

              <h3 style={{ marginBottom: '0.5rem' }}>Professional Experience</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Dr. {doctor.name.split(' ').slice(1).join(' ')} has been practicing medicine for <strong>{doctor.experience} years</strong>.
              </p>
            </div>

            {/* Right side: Fees, Availability, and Booking CTA */}
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Consultation Info</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  ${doctor.fees} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>per visit</span>
                </div>

                <h4 style={{ marginBottom: '0.25rem' }}>Weekly Schedule</h4>
                {doctor.availability && doctor.availability.length > 0 ? (
                  <ul className="availability-list">
                    {doctor.availability.map((day) => (
                      <li key={day} className="availability-day">
                        {day}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No days listed.</p>
                )}

                {/* Booking Button */}
                <div style={{ marginTop: '1.5rem' }}>
                  {isLoggedIn ? (
                    <button 
                      onClick={() => navigate(`/book/${doctor._id}`)} 
                      className="btn" 
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      Book Appointment
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <Link to="/login" className="btn" style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
                        Login to Book
                      </Link>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        You must be signed in as a patient to request appointments.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDetails;
