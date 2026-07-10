import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * ConsultationRecord Component
 * Allows doctors to create or update digital health records for patients
 * and complete the associated appointment as the final step.
 */
function ConsultationRecord() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  // Component states
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [prescription, setPrescription] = useState('');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [recordId, setRecordId] = useState(null); // Stores ID if record already exists

  useEffect(() => {
    fetchAppointmentAndRecord();
  }, [appointmentId]);

  const fetchAppointmentAndRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch appointments list to find details for the target appointmentId
      const appResponse = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appointmentsList = await appResponse.json();

      if (!appResponse.ok) {
        throw new Error(appointmentsList.message || 'Failed to fetch appointment details');
      }

      const targetApp = appointmentsList.find(app => app._id === appointmentId);
      if (!targetApp) {
        throw new Error('Appointment not found');
      }

      setAppointment(targetApp);
      setSymptoms(targetApp.symptoms || '');

      // 2. Fetch existing health records for this patient to check if one is already created for this appointment
      const patientId = targetApp.patient._id || targetApp.patient;
      const recordsResponse = await fetch(`/api/health-records/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recordsList = await recordsResponse.json();

      if (recordsResponse.ok) {
        const existingRecord = recordsList.find(rec => rec.appointmentId === appointmentId);
        if (existingRecord) {
          // Pre-populate form fields if record already exists
          setRecordId(existingRecord._id);
          setSymptoms(existingRecord.symptoms || '');
          setDiagnosisSummary(existingRecord.diagnosisSummary || '');
          setPrescription(existingRecord.prescription || '');
          setAdvice(existingRecord.advice || '');
          if (existingRecord.followUpDate) {
            setFollowUpDate(new Date(existingRecord.followUpDate).toISOString().split('T')[0]);
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading appointment details');
      setLoading(false);
    }
  };

  const handleSaveRecord = async (e) => {
    if (e) e.preventDefault();
    if (!diagnosisSummary.trim()) {
      setError('Diagnosis Summary is required before saving');
      return false;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        appointmentId,
        symptoms,
        diagnosisSummary,
        prescription,
        advice,
        followUpDate: followUpDate || null
      };

      const url = recordId ? `/api/health-records/${recordId}` : '/api/health-records';
      const method = recordId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save health record');
      }

      // Update local state with saved record details
      if (!recordId) {
        setRecordId(data._id);
      }
      setMessage('Consultation record saved successfully.');
      return true;
    } catch (err) {
      setError(err.message || 'Error saving consultation record');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!diagnosisSummary.trim()) {
      setError('Please fill in the Diagnosis Summary and save the record first.');
      return;
    }

    // Save record first to capture any unsaved edits
    const saveSuccess = await handleSaveRecord();
    if (!saveSuccess) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete appointment');
      }

      // Redirect back to doctor dashboard
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message || 'Error completing appointment');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading appointment details...</p>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="status-badge danger" style={{ display: 'inline-block', padding: '1rem 2rem' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '800px' }}>
      <button 
        onClick={() => navigate('/doctor/dashboard')}
        className="btn"
        style={{ backgroundColor: 'var(--text-secondary)', marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
      >
        &larr; Back to Dashboard
      </button>

      <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
          Consultation Record
        </h2>

        {/* Appointment Information Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <div>
            <strong>Patient Name:</strong> {appointment.patient?.name}
          </div>
          <div>
            <strong>Doctor Name:</strong> {appointment.doctor?.name}
          </div>
          <div>
            <strong>Appointment Date:</strong> {new Date(appointment.date).toLocaleDateString()}
          </div>
          <div>
            <strong>Specialization:</strong> {appointment.doctor?.specialization}
          </div>
        </div>

        {/* Success/Error Alerts */}
        {message && (
          <div className="status-badge success" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="status-badge danger" style={{ padding: '1rem', width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSaveRecord(); }}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="symptoms" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Symptoms</label>
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms presented by the patient..."
              rows="3"
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="diagnosis" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Diagnosis Summary *</label>
            <textarea
              id="diagnosis"
              value={diagnosisSummary}
              onChange={(e) => setDiagnosisSummary(e.target.value)}
              placeholder="Enter professional diagnosis summary..."
              rows="3"
              required
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="prescription" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Prescription</label>
            <textarea
              id="prescription"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Paracetamol 500mg&#10;Twice daily after meals"
              rows="4"
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="advice" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Advice</label>
            <textarea
              id="advice"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Drink plenty of fluids.&#10;Take sufficient rest.&#10;Return if symptoms worsen."
              rows="3"
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="followup" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Follow-up Date</label>
            <input
              type="date"
              id="followup"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none' }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn"
              style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', minWidth: '150px' }}
            >
              {saving ? 'Saving...' : 'Save Record'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleCompleteAppointment}
              className="btn"
              style={{ flex: 1, backgroundColor: 'var(--success-color)', padding: '0.75rem', fontSize: '1rem', minWidth: '150px' }}
            >
              {saving ? 'Completing...' : 'Complete Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConsultationRecord;
