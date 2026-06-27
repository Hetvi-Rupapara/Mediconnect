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
import AIAssistant from './pages/AIAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import { StethoscopeIcon, HomeIcon, UserIcon, CalendarIcon, AIIcon, DashboardIcon } from './components/Icons';

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
                {isAuthenticated ? (
                  <>
                    {isDoctor ? (
                      <>
                        <li>
                          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <HomeIcon size={16} style={{ marginRight: '0.3rem' }} /> Home
                          </Link>
                        </li>
                        <li>
                          <Link to="/doctor/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
                            <DashboardIcon size={16} style={{ marginRight: '0.3rem' }} /> Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
                            <UserIcon size={16} style={{ marginRight: '0.3rem' }} /> Profile
                          </Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <HomeIcon size={16} style={{ marginRight: '0.3rem' }} /> Home
                          </Link>
                        </li>
                        <li>
                          <Link to="/doctors" style={{ display: 'flex', alignItems: 'center' }}>
                            <StethoscopeIcon size={16} style={{ marginRight: '0.3rem' }} /> Find Doctors
                          </Link>
                        </li>
                        <li>
                          <Link to="/appointments" style={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarIcon size={16} style={{ marginRight: '0.3rem' }} /> My Appointments
                          </Link>
                        </li>
                        <li>
                          <Link to="/ai-assistant" style={{ display: 'flex', alignItems: 'center' }}>
                            <AIIcon size={16} style={{ marginRight: '0.3rem' }} /> AI Assistant
                          </Link>
                        </li>
                        <li>
                          <Link to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
                            <UserIcon size={16} style={{ marginRight: '0.3rem' }} /> Profile
                          </Link>
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
                         onMouseOver={(e) => e.target.style.color = 'var(--danger-color)'}
                         onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <HomeIcon size={16} style={{ marginRight: '0.3rem' }} /> Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/doctors" style={{ display: 'flex', alignItems: 'center' }}>
                        <StethoscopeIcon size={16} style={{ marginRight: '0.3rem' }} /> Find Doctors
                      </Link>
                    </li>
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
              path="/ai-assistant" 
              element={
                <ProtectedRoute>
                  <AIIcon size={18} style={{ display: 'none' }} />
                  <AIAssistant />
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
