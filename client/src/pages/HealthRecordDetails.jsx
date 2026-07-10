import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * HealthRecordDetails Component
 * Displays the complete, read-only consultation record details for patients.
 */
function HealthRecordDetails() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  // Component states
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecordDetails();
  }, [recordId]);

  const fetchRecordDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/health-records/${recordId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch record details');
      }

      setRecord(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading health record details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading health record details...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="status-badge danger" style={{ display: 'inline-block', padding: '1rem 2rem', marginBottom: '1.5rem' }}>
          {error || 'Health record not found'}
        </div>
        <br />
        <button 
          onClick={() => navigate('/appointments')}
          className="btn"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '750px' }}>
      <button 
        onClick={() => navigate('/appointments')}
        className="btn"
        style={{ backgroundColor: 'var(--text-secondary)', marginBottom: '1.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
      >
        &larr; Back to Appointments
      </button>

      <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Consultation Details</h2>
          <span style={{ fontSize: '0.9rem', padding: '0.25rem 0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', color: 'var(--primary-color)', fontWeight: '600' }}>
            {new Date(record.visitDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Doctor Identity Profile Section */}
        <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '2rem' }}>
          <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{record.doctorName}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '600', textTransform: 'uppercase', marginTop: '0.15rem' }}>
            {record.specialization}
          </div>
        </div>

        {/* Record Details Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Symptoms
            </strong>
            <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {record.symptoms || 'No symptoms specified.'}
            </p>
          </div>

          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Diagnosis Summary
            </strong>
            <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {record.diagnosisSummary}
            </p>
          </div>

          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Prescription
            </strong>
            <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.5' }}>
              {record.prescription || 'No prescription specified.'}
            </p>
          </div>

          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Advice
            </strong>
            <p style={{ margin: 0, padding: '0.75rem', backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {record.advice || 'No general advice specified.'}
            </p>
          </div>

          {record.followUpDate && (
            <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Follow-up Date
              </strong>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                {new Date(record.followUpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Medical Notice Disclaimer */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2.5rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          Please consult a qualified healthcare professional for proper medical advice.
        </div>
      </div>
    </div>
  );
}

export default HealthRecordDetails;
