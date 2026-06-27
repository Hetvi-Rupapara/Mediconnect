import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIIcon, StethoscopeIcon, ShieldIcon } from '../components/Icons';

/**
 * AIAssistant Component
 * AI Symptom Analyzer that helps patients assess their symptoms, estimates urgency,
 * and refers them directly to the appropriate specialist.
 */
function AIAssistant() {
  const navigate = useNavigate();
  const [symptomsText, setSymptomsText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Common symptom tags to help the patient
  const commonSymptoms = [
    'Chest Pain',
    'Shortness of Breath',
    'High Fever',
    'Cough',
    'Skin Rash',
    'Itching',
    'Severe Headache',
    'Stomach Ache',
    'Child Fever/Cough'
  ];

  // Toggle selection of preset symptom tags
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      // Remove from textarea if matches
      const tagLower = tag.toLowerCase();
      if (symptomsText.toLowerCase().includes(tagLower)) {
        setSymptomsText(prev => prev.replace(new RegExp(tag, 'gi'), '').trim());
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
      // Append to text input nicely
      setSymptomsText(prev => prev ? `${prev}, ${tag}` : tag);
    }
  };

  // Rule-based diagnostic algorithm
  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!symptomsText.trim() && selectedTags.length === 0) {
      alert('Please describe your symptoms or select symptom tags.');
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate AI thinking time for premium feeling
    setTimeout(() => {
      const combinedText = `${symptomsText} ${selectedTags.join(' ')}`.toLowerCase();
      let specialization = 'General Physician';
      let urgency = 'Low';
      let explanation = 'Based on the entered symptoms, a standard consultation is recommended. Continue resting, stay hydrated, and monitor your symptoms.';

      // Determine urgency and specialization
      const hasCardio = combinedText.includes('chest pain') || combinedText.includes('heart') || combinedText.includes('palpitations');
      const hasRespiratory = combinedText.includes('shortness of breath') || combinedText.includes('breathing') || combinedText.includes('difficulty breathing');
      const hasDermatology = combinedText.includes('skin') || combinedText.includes('rash') || combinedText.includes('acne') || combinedText.includes('itching') || combinedText.includes('spots') || combinedText.includes('eczema');
      const hasPediatric = combinedText.includes('child') || combinedText.includes('baby') || combinedText.includes('pediatric') || combinedText.includes('infant') || combinedText.includes('kid');
      const hasHighFever = combinedText.includes('high fever') || combinedText.includes('102') || combinedText.includes('103') || combinedText.includes('104');
      const hasSeverePain = combinedText.includes('severe') || combinedText.includes('excruciating') || combinedText.includes('chest') || combinedText.includes('head injury');

      if (hasCardio) {
        specialization = 'Cardiologist';
        urgency = 'High';
        explanation = 'Chest pains or cardiac distress requires immediate evaluation to rule out acute conditions. Do not delay medical review.';
      } else if (hasRespiratory) {
        specialization = 'General Physician';
        urgency = 'High';
        explanation = 'Respiratory difficulties or shortness of breath should be checked immediately to ensure adequate oxygen levels.';
      } else if (hasDermatology) {
        specialization = 'Dermatologist';
        urgency = 'Low';
        explanation = 'Skin surface symptoms and persistent itching are best evaluated by a skin care specialist to determine the exact allergy or condition.';
      } else if (hasPediatric) {
        specialization = 'Pediatrician';
        urgency = hasHighFever ? 'Medium' : 'Low';
        explanation = 'Sickness in infants and young children is best handled by pediatric specialists who specialize in developmental medicine.';
      } else if (hasHighFever || hasSeverePain) {
        urgency = 'Medium';
        explanation = 'Elevated temperatures or acute painful localized areas warrant a visit within 24-48 hours to check for infections or acute inflammation.';
      }

      setResult({
        specialization,
        urgency,
        explanation
      });
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setSymptomsText('');
    setSelectedTags([]);
    setResult(null);
  };

  // Find color tokens based on urgency
  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'High':
        return {
          bg: '#fef2f2',
          text: '#991b1b',
          border: '1px solid #fee2e2',
          badgeBg: '#fee2e2',
          badgeText: '#991b1b'
        };
      case 'Medium':
        return {
          bg: '#fffbeb',
          text: '#92400e',
          border: '1px solid #fef3c7',
          badgeBg: '#fef3c7',
          badgeText: '#92400e'
        };
      case 'Low':
      default:
        return {
          bg: '#eff6ff',
          text: '#1e40af',
          border: '1px solid #dbeafe',
          badgeBg: '#dbeafe',
          badgeText: '#1e40af'
        };
    }
  };

  return (
    <div className="container">
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <AIIcon size={24} color="var(--primary-color)" style={{ marginRight: '0.75rem' }} />
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>AI Health Assistant</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Describe your symptoms to receive an initial guidance assessment, urgency rating, and a recommended medical specialist.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* ============ INPUT PANEL ============ */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleAnalyze}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem' }}>
                Select Common Symptoms:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {commonSymptoms.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--primary-color)' : '#fff',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="symptoms" style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Describe how you feel (Optional details):
              </label>
              <textarea
                id="symptoms"
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                className="search-input"
                style={{
                  width: '100%',
                  height: '140px',
                  padding: '0.75rem',
                  resize: 'none',
                  lineHeight: '1.5',
                  fontSize: '0.95rem'
                }}
                placeholder="Example: I have been experiencing a mild chest pain that started this morning, accompanied by a cough."
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {loading ? (
                  <span>Analyzing symptoms...</span>
                ) : (
                  <>
                    <AIIcon size={18} color="#fff" style={{ marginRight: '0.5rem' }} />
                    Analyze Symptoms
                  </>
                )}
              </button>
              {(symptomsText || selectedTags.length > 0) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn"
                  style={{ flex: 1, backgroundColor: 'var(--text-secondary)' }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ============ DIAGNOSTIC RESULT PANEL ============ */}
        {result && (
          <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)', animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Guidance Assessment
            </h3>

            {/* Urgency Alert Card */}
            <div
              style={{
                background: getUrgencyStyles(result.urgency).bg,
                border: getUrgencyStyles(result.urgency).border,
                color: getUrgencyStyles(result.urgency).text,
                borderRadius: 'var(--border-radius)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '700', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Urgency Level
                </span>
                <span
                  style={{
                    backgroundColor: getUrgencyStyles(result.urgency).badgeBg,
                    color: getUrgencyStyles(result.urgency).badgeText,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}
                >
                  {result.urgency}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>
                {result.urgency === 'High' 
                  ? 'Urgent: Please seek immediate professional emergency medical care or visit the nearest emergency room.'
                  : result.urgency === 'Medium' 
                    ? 'Moderate: We advise scheduling a physical consultation in the coming 24 to 48 hours.'
                    : 'Routine: Rest, monitor condition, and consult a general physician if symptoms persist over several days.'
                }
              </p>
            </div>

            {/* Recommended Specialist Box */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                Recommended Action:
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <StethoscopeIcon size={20} color="var(--primary-color)" style={{ marginRight: '0.5rem' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  Consult a {result.specialization}
                </span>
              </div>
            </div>

            {/* Explanation text */}
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                Assessment Context:
              </span>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {result.explanation}
              </p>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => navigate(`/doctors?specialization=${result.specialization}`)}
              className="btn"
              style={{ width: '100%', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <StethoscopeIcon size={18} color="#fff" style={{ marginRight: '0.5rem' }} />
              Find {result.specialization} Doctors
            </button>

            {/* Medical Disclaimer Shield Banner */}
            <div
              style={{
                display: 'flex',
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius)'
              }}
            >
              <ShieldIcon size={18} color="var(--text-secondary)" style={{ marginTop: '0.1rem', marginRight: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Disclaimer: This AI Assistant is a preliminary symptom matching tool for educational guidance. It is not an alternative to professional clinical diagnosis or therapy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
