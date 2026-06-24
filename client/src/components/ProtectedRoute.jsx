import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Prevents unauthorized users from accessing sensitive page views.
 * If the user has a token in localStorage, it renders the child element.
 * Otherwise, it redirects the user to the /login page.
 */
function ProtectedRoute({ children }) {
  // Check if the JWT token is present in browser local storage
  const token = localStorage.getItem('token');

  // If there is no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected children components if authenticated
  return children;
}

export default ProtectedRoute;
