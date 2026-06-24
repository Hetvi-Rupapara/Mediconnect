import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Doctors from './pages/Doctors';
import DoctorDetails from './pages/DoctorDetails';
import BookAppointment from './pages/BookAppointment';
import Appointments from './pages/Appointments';
import DoctorDashboard from './pages/DoctorDashboard';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { StethoscopeIcon } from './components/Icons';

/**
 * App Component
 * Handles routing, layout, and session navigation for MediConnect.
 */
function App() {
  // Check session variables
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isDoctor = user && user.role === 'doctor';

  // Handle logout: clear token and user details, and redirect
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Simple redirect to homepage
  };

  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <header>
          <div className="header-container">
            <Link to="/" className="logo">
              <StethoscopeIcon size={24} style={{ marginRight: '0.4rem' }} /> MediConnect
            </Link>
            <nav>
              <ul className="nav-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/doctors">Find Doctors</Link>
                </li>
                {isAuthenticated ? (
                  <>
                    {isDoctor ? (
                      <>
                        <li>
                          <Link to="/doctor/dashboard">Dashboard</Link>
                        </li>
                        <li>
                          <Link to="/profile">Profile</Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link to="/appointments">My Appointments</Link>
                        </li>
                        <li>
                          <Link to="/dashboard">Dashboard</Link>
                        </li>
                        <li>
                          <Link to="/profile">Profile</Link>
                        </li>
                      </>
                    )}
                    <li>
                      <button 
                        onClick={handleLogout} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--text-secondary)', 
                          cursor: 'pointer', 
                          fontWeight: '500',
                          fontSize: '1rem',
                          fontFamily: 'inherit',
                          transition: 'var(--transition)'
                        }}
                        onMouseOver={(e) => e.target.style.color = 'var(--primary-color)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login">Login</Link>
                    </li>
                    <li>
                      <Link to="/register">Register</Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Route Map */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            
            {/* Patient routes */}
            <Route 
              path="/book/:doctorId" 
              element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Doctor routes */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
