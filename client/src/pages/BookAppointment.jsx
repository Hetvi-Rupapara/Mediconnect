import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon } from '../components/Icons';
import { useNotification } from '../components/NotificationProvider.jsx';

/**
 * BookAppointment Component
 * Allows authenticated patients to schedule appointments with a doctor.
 * Features real-time slot availability based on date and current time comparison.
 */
function BookAppointment() {
  useEffect(() => {
    document.title = 'MediConnect | Book Appointment';
  }, []);

  const { showNotification, showLoading, hideLoading } = useNotification();
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

  // Specialty duration assignment
  const getSpecialtyDuration = (specialization) => {
    const spec = (specialization || '').trim().toLowerCase();
    if (spec.includes('general physician')) return 15;
    if (spec.includes('dermatologist')) return 15;
    if (spec.includes('pediatrician')) return 20;
    if (spec.includes('cardiologist')) return 30;
    return 30; // default slot duration fallback
  };

  // Convert "09:00 AM" to total minutes from midnight
  const parseTime12h = (timeStr) => {
    const parts = (timeStr || '').match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!parts) return 0;
    let hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    const ampm = parts[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };

  // Convert total minutes from midnight to "09:00 AM" format
  const formatTime12h = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;

    const hStr = displayHours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');

    return `${hStr}:${mStr} ${ampm}`;
  };

  // Generate dynamic slots based on doctor's specialization and working hours
  const generateDoctorSlots = () => {
    if (!doctor) return [];
    const duration = getSpecialtyDuration(doctor.specialization);
    const start = parseTime12h(doctor.startTime || '09:00 AM');
    const end = parseTime12h(doctor.endTime || '05:00 PM');

    const slots = [];
    for (let current = start; current < end; current += duration) {
      slots.push(formatTime12h(current));
    }
    return slots;
  };

  const timeSlots = generateDoctorSlots();

  const morningSlots = [];
  const afternoonSlots = [];
  timeSlots.forEach((slot) => {
    const mins = parseTime12h(slot);
    if (mins < 720) {
      morningSlots.push(slot);
    } else {
      afternoonSlots.push(slot);
    }
  });

  // Helper function to parse slot time (e.g. '09:00 AM') into comparable hours and minutes
  const parseSlotTime = (slotStr) => {
    const [time, modifier] = slotStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return { hours, minutes };
  };

  // Helper function to check if a slot's time has already passed today
  const isPastSlot = (slotStr) => {
    if (!date) return false;
    
    const today = new Date();
    const selectedDate = new Date(date);
    
    // Clear time portions for pure date comparison
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    const selectedMidnight = new Date(selectedDate);
    selectedMidnight.setHours(0, 0, 0, 0);
    
    // If selecting a future date, all configured slots are available
    if (selectedMidnight > todayMidnight) {
      return false;
    }
    
    // If selecting a past date, all slots are disabled
    if (selectedMidnight < todayMidnight) {
      return true;
    }
    
    // If selecting today, compare slot hours/minutes with current system hours/minutes
    const { hours, minutes } = parseSlotTime(slotStr);
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    
    if (currentHours > hours) {
      return true;
    }
    if (currentHours === hours && currentMinutes >= minutes) {
      return true;
    }
    
    return false;
  };

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

  // Reset selected slot if it becomes a past/unavailable slot due to date changes
  useEffect(() => {
    if (selectedSlot && isPastSlot(selectedSlot)) {
      setSelectedSlot('');
    }
  }, [date, selectedSlot]);

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

    const selectedDate = new Date(selectedDateStr);
    
    // Prevent and block selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedMidnight = new Date(selectedDate);
    selectedMidnight.setHours(0, 0, 0, 0);
    
    if (selectedMidnight < today) {
      setDateValidationError('Appointments cannot be booked for past dates.');
      return;
    }

    // Convert date string to day name (e.g. 'Monday')
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = daysOfWeek[selectedDate.getUTCDay()];

    // 1. First check: Is the selected weekday included in the doctor's working days?
    const doctorWorkingDays = doctor.workingDays && doctor.workingDays.length > 0 ? doctor.workingDays : doctor.availability;
    const isWorkingDay = doctorWorkingDays.includes(selectedDayName);

    if (!isWorkingDay) {
      setDateValidationError('The doctor is not available on this day.');
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return; // Prevent duplicate submissions from double clicks
    setError('');
    
    // Prevent submit if date is invalid or past
    if (dateValidationError) {
      setError(dateValidationError || 'Please choose an available date.');
      return;
    }

    // Block submit if the doctor is on leave on this date
    if (doctor && doctor.unavailableDates && doctor.unavailableDates.includes(date)) {
      setError('The doctor is unavailable on this date. Please choose another date.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }

    // Explicit check to block booking past slots
    if (isPastSlot(selectedSlot)) {
      setError('Selected time slot has already passed. Please select another slot.');
      return;
    }

    setSubmitLoading(true);
    showLoading('Booking appointment...');

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

      hideLoading();
      showNotification('Appointment booked successfully!', 'success', () => {
        navigate('/appointments');
      });
    } catch (err) {
      hideLoading();
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderSlotButton = (slot) => {
    const isBooked = bookedSlots.includes(slot);
    const isPast = isPastSlot(slot);
    const isSelected = selectedSlot === slot;
    const isLeave = doctor?.unavailableDates && doctor.unavailableDates.includes(date);

    if (isSelected) {
      return (
        <button
          key={slot}
          type="button"
          className="timeslot-btn selected"
          onClick={() => setSelectedSlot(slot)}
        >
          {slot}
        </button>
      );
    }

    if (isLeave) {
      return (
        <button
          key={slot}
          type="button"
          className="timeslot-btn"
          disabled={true}
          style={{
            backgroundColor: '#f8fafc',
            color: '#cbd5e1',
            borderColor: '#e2e8f0',
            cursor: 'not-allowed',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {slot}
          <span style={{
            fontSize: '0.65rem',
            padding: '0.1rem 0.35rem',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            borderRadius: '4px',
            marginLeft: '0.4rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Unavailable
          </span>
        </button>
      );
    }

    if (isBooked) {
      return (
        <button
          key={slot}
          type="button"
          className="timeslot-btn"
          disabled={true}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#94a3b8',
            borderColor: '#cbd5e1',
            cursor: 'not-allowed',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {slot}
          <span style={{
            fontSize: '0.65rem',
            padding: '0.1rem 0.35rem',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            borderRadius: '4px',
            marginLeft: '0.4rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Booked
          </span>
        </button>
      );
    }

    if (isPast) {
      return (
        <button
          key={slot}
          type="button"
          className="timeslot-btn"
          disabled={true}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#94a3b8',
            borderColor: '#cbd5e1',
            cursor: 'not-allowed',
            pointerEvents: 'none'
          }}
        >
          {slot}
        </button>
      );
    }

    return (
      <button
        key={slot}
        type="button"
        className="timeslot-btn"
        onClick={() => setSelectedSlot(slot)}
      >
        {slot}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <span className="status-badge loading">Loading booking details...</span>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card" style={{ padding: '2.5rem', marginTop: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
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
              min={new Date().toISOString().split('T')[0]} // Block selecting past dates in native picker
              onChange={handleDateChange}
              required
            />
            {dateValidationError && (
              <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '500' }}>
                {dateValidationError}
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Doctor availability: <strong>{doctor?.workingDays && doctor.workingDays.length > 0 ? doctor.workingDays.join(', ') : doctor?.availability.join(', ')}</strong>
            </p>
          </div>

          {/* Time Slot Selection */}
          {date && !dateValidationError && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                <ClockIcon size={16} /> Select Time Slot
              </label>

              {/* Morning Section */}
              {morningSlots.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem' }}>
                    Morning
                  </span>
                  <div className="timeslot-grid">
                    {morningSlots.map((slot) => renderSlotButton(slot))}
                  </div>
                </div>
              )}

              {/* Afternoon Section */}
              {afternoonSlots.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem' }}>
                    Afternoon
                  </span>
                  <div className="timeslot-grid">
                    {afternoonSlots.map((slot) => renderSlotButton(slot))}
                  </div>
                </div>
              )}

              {morningSlots.length === 0 && afternoonSlots.length === 0 && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                  No available slots generated for this doctor.
                </p>
              )}
            </div>
          )}

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
