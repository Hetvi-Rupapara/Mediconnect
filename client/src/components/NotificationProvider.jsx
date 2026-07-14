import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Notification Context
const NotificationContext = createContext();

// Custom hook to use notifications
export const useNotification = () => useContext(NotificationContext);

// Provider Component
export function NotificationProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { message, type, onConfirm, onCancel, onClose, isConfirm }
  const [loadingMessage, setLoadingMessage] = useState(null);

  const showNotification = (message, type = 'success', onClose = null) => {
    setDialog({ message, type, isConfirm: false, onClose });
  };

  const showConfirm = (message, onConfirm, onCancel = null) => {
    setDialog({ message, isConfirm: true, onConfirm, onCancel });
  };

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
  };

  const hideLoading = () => {
    setLoadingMessage(null);
  };

  const handleClose = () => {
    const callback = dialog?.onClose;
    setDialog(null);
    if (callback) callback();
  };

  const handleConfirm = () => {
    const callback = dialog?.onConfirm;
    setDialog(null);
    if (callback) callback();
  };

  const handleCancel = () => {
    const callback = dialog?.onCancel;
    setDialog(null);
    if (callback) callback();
  };

  // Keyboard navigation hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!dialog) return;
      if (e.key === 'Escape') {
        if (dialog.isConfirm) {
          handleCancel();
        } else {
          handleClose();
        }
      } else if (e.key === 'Enter') {
        if (dialog.isConfirm) {
          handleConfirm();
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog]);

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm, showLoading, hideLoading }}>
      {children}
      {dialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          animation: 'mcFadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '90%',
            maxWidth: '420px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            animation: 'mcScaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Header Icon */}
            <div style={{ marginBottom: '1.25rem' }}>
              {dialog.isConfirm ? (
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary-color)', fontSize: '1.75rem', fontWeight: 'bold' }}>
                  ?
                </div>
              ) : dialog.type === 'success' ? (
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', fontSize: '1.75rem' }}>
                  ✔
                </div>
              ) : (
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', fontSize: '1.75rem' }}>
                  ⚠
                </div>
              )}
            </div>

            {/* Header Title */}
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              MediConnect
            </h3>

            {/* Message Body */}
            <p style={{ margin: '0 0 1.75rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {dialog.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              {dialog.isConfirm ? (
                <>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      border: '1px solid #cbd5e1',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--primary-color)',
                      color: '#ffffff',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={handleClose}
                  style={{
                    minWidth: '120px',
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff',
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer'
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loadingMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: 'mcFadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            width: '90%',
            maxWidth: '320px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            animation: 'mcScaleUp 0.25s ease-out'
          }}>
            {/* Spinning Indicator */}
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid rgba(2, 132, 199, 0.1)',
              borderTop: '4px solid var(--primary-color)',
              borderRadius: '50%',
              animation: 'mcSpinner 1s linear infinite',
              marginBottom: '1.25rem'
            }} />
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              MediConnect
            </h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      {/* Embedded CSS for custom dialog animations */}
      <style>{`
        @keyframes mcFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mcScaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes mcSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}
