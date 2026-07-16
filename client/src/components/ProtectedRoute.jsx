import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Prevents unauthorized users from accessing sensitive page views.
 * Verifies that the user has a valid JWT token.
 * Optionally verifies the required user role.
 */
function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userObj = localStorage.getItem('user');

  // If there is no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a role is required, verify it matches the user's role
  if (role && userObj) {
    try {
      const user = JSON.parse(userObj);
      if (user.role !== role) {
        // Redirect to appropriate dashboard based on actual role
        return user.role === 'doctor' 
          ? <Navigate to="/doctor/dashboard" replace /> 
          : <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  // Render the protected children components if authenticated
  return children;
}

export default ProtectedRoute;
