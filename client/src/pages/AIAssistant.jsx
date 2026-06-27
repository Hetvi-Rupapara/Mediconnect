import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIIcon, StethoscopeIcon } from '../components/Icons';

/**
 * AIAssistant Component
 * Live AI Healthcare Assistant chatbot interface.
 * Connects directly to the Express backend `/api/ai/chat` endpoint.
 */
function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am MediConnect AI, your healthcare assistant. How can I help you today? Feel free to describe symptoms, ask general healthcare questions, or select one of the suggested prompts below.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ref to handle auto-scrolling to the bottom of the chat container
  const chatBottomRef = useRef(null);

  // Suggested questions list
  const suggestions = [
    'I have a fever and sore throat.',
    'Which doctor should I consult for knee pain?',
    'What is a CBC blood test?',
    'Can I eat before a blood test?',
    'How should I prepare for an MRI?'
  ];

  // Protect route client-side: check login token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Scroll to bottom whenever messages list or loading state changes
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, loading]);

  // Handle clicking a suggestion chip
  const handleSuggestionClick = (question) => {
    setInputText(question);
  };

  // Submit new message to backend
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    // Append user message immediately
    const updatedMessages = [...messages, { sender: 'user', text: trimmedInput }];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: trimmedInput })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reply from assistant');
      }

      // Append AI reply
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      // Append a user-friendly error response from the AI
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I apologize, but I am currently experiencing difficulty reaching the server. Please ensure you are logged in and try again shortly.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      {/* Page Title & Intro */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
        <AIIcon size={26} color="var(--primary-color)" style={{ marginRight: '0.75rem' }} />
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>AI Healthcare Assistant</h2>
      </div>

      {/* Mandatory Safety Disclaimer Banner */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #dbeafe',
          color: '#1e40af',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}
      >
        <span style={{ fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>Medical Disclaimer:</span>
        This AI assistant is intended for general healthcare guidance only. It does not provide medical diagnoses or treatment recommendations. Always consult a qualified healthcare professional for medical advice.
      </div>

      {/* Main Chat Interface Window */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          height: '500px',
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)'
        }}
      >
        {/* Scrollable messages area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    backgroundColor: isUser ? 'var(--primary-color)' : '#f1f5f9',
                    color: isUser ? '#fff' : 'var(--text-primary)',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div
                style={{
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: '#f8fafc',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}
              >
                MediConnect AI is searching references...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Prompts Section */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
            Suggested Questions:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {suggestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(q)}
                disabled={loading}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '15px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#fff',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Type your healthcare question here..."
            className="search-input"
            style={{
              flex: 1,
              height: '50px',
              padding: '0.65rem 0.85rem',
              resize: 'none',
              lineHeight: '1.4',
              fontSize: '0.95rem',
              borderRadius: 'var(--border-radius)'
            }}
            onKeyDown={(e) => {
              // Press Enter (without Shift) to send message
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            className="btn"
            disabled={loading || !inputText.trim()}
            style={{
              padding: '0 1.5rem',
              fontSize: '0.95rem',
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
