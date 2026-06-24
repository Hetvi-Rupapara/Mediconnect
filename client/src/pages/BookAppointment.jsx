import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon } from '../components/Icons';

/**
 * BookAppointment Component
 * Allows authenticated patients to schedule appointments with a doctor.
 */
function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dateValidationError, setDateValidationError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  // Static standard time slots for simplicity in Version 1
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM'
  ];

  useEffect(() => {
    // Check if token exists, redirect if not authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDoctor = async () => {
      try {
        const response = await fetch(`/api/doctors/${doctorId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch doctor details');
        }

        setDoctor(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, navigate]);

  // Fetch booked slots for the selected date
  useEffect(() => {
    if (!date || !doctorId) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/appointments/booked?doctor=${doctorId}&date=${date}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setBookedSlots(data);
          
          // Clear selected slot if it gets booked in the meantime
          if (data.includes(selectedSlot)) {
            setSelectedSlot('');
          }
        }
      } catch (err) {
        console.error('Error fetching booked slots:', err);
      }
    };

    fetchBookedSlots();
  }, [date, doctorId, selectedSlot]);

  // Handle date input and validate it matches the doctor's available days
  const handleDateChange = (e) => {
    const selectedDateStr = e.target.value;
    setDate(selectedDateStr);
    setDateValidationError('');

    if (!selectedDateStr) return;

    // Convert date string to day name (e.g. 'Monday')
    const selectedDate = new Date(selectedDateStr);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = daysOfWeek[selectedDate.getUTCDay()];

    // Check if doctor is available on this day
    const isAvailable = doctor.availability.includes(selectedDayName);

    if (!isAvailable) {
      setDateValidationError(
        `Dr. ${doctor.name.split(' ').slice(1).join(' ')} is not available on ${selectedDayName}s. Please choose: ${doctor.availability.join(', ')}`
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final check for date validation error
    if (dateValidationError) {
      setError('Please choose an available date.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }

    setSubmitLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor: doctorId,
          date,
          timeSlot: selectedSlot,
          symptoms
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      // Redirect to appointments dashboard on success
      navigate('/appointments');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading doctor schedule info...</span>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginTop: '2rem' }}>
        <Link to={`/doctors/${doctorId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
          ← Back to Doctor Details
        </Link>
      </div>

      <div className="card" style={{ maxWidth: '650px', margin: '1.5rem auto 0 auto' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem', textAlign: 'center' }}>
          Book Appointment
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Scheduling a session with <strong>{doctor?.name}</strong> ({doctor?.specialization})
        </p>

        {error && (
          <div className="status-badge danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1.5rem', padding: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Appointment Date */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <CalendarIcon size={16} /> Select Date
            </label>
            <input
              type="date"
              id="date"
              className="search-input"
              style={{ width: '100%' }}
              value={date}
              min={new Date().toISOString().split('T')[0]} // Block past dates
              onChange={handleDateChange}
              required
            />
            {dateValidationError && (
              <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '500' }}>
                {dateValidationError}
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Doctor availability: <strong>{doctor?.availability.join(', ')}</strong>
            </p>
          </div>

          {/* Time Slot Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <ClockIcon size={16} /> Select Time Slot
            </label>
            <div className="timeslot-grid">
              {timeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`timeslot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    style={isBooked ? {
                      backgroundColor: '#f1f5f9',
                      color: '#94a3b8',
                      cursor: 'not-allowed',
                      borderColor: '#cbd5e1',
                      textDecoration: 'line-through'
                    } : {}}
                  >
                    {slot} {isBooked && ' (Unavailable)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms description */}
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="symptoms" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Describe Symptoms / Reason for Visit (Optional)
            </label>
            <textarea
              id="symptoms"
              rows="4"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Provide a brief description of symptoms (e.g. fever, headache, joint pain)..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 'var(--border-radius)', 
                border: '1px solid var(--border-color)', 
                fontSize: '1rem', 
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn"
            disabled={submitLoading || !!dateValidationError}
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {submitLoading ? 'Submitting Booking Request...' : 'Confirm Appointment Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;
