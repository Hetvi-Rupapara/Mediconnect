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
import Account from './pages/Account';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ProtectedRoute from './components/ProtectedRoute';
import { StethoscopeIcon, HomeIcon, UserIcon, CalendarIcon, AIIcon, DashboardIcon, EmailIcon } from './components/Icons';

/**
 * App Component
 * Handles routing, global layout, and session navigation for MediConnect.
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Bar */}
        <header>
          <div className="header-container">
            <Link to="/" className="logo-brand">
              <div className="logo-img-container">
                <img 
                  src="/logo.png" 
                  alt="MediConnect Logo" 
                />
              </div>
              <span className="logo-text">MediConnect</span>
            </Link>
            <nav>
              <ul className="nav-links">
                {isAuthenticated ? (
                  <>
                    {isDoctor ? (
                      <>
                        <li>
                          <Link to="/">Home</Link>
                        </li>
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
                          <Link to="/">Home</Link>
                        </li>
                        <li>
                          <Link to="/doctors">Find Doctors</Link>
                        </li>
                        <li>
                          <Link to="/appointments">My Appointments</Link>
                        </li>
                        <li>
                          <Link to="/ai-assistant">AI Assistant</Link>
                        </li>
                        <li>
                          <Link to="/profile">Profile</Link>
                        </li>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="/doctors">Find Doctors</Link>
                    </li>
                    <li>
                      <Link to="/contact-us">Contact Us</Link>
                    </li>
                    <li className="nav-dropdown-container">
                      <Link to="/account" className="nav-dropdown-trigger">
                        Account
                      </Link>
                      <ul className="nav-dropdown-menu">
                        <li>
                          <Link to="/login">Login</Link>
                        </li>
                        <li>
                          <Link to="/register">Register</Link>
                        </li>
                      </ul>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Route Map */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/account" element={<Account />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
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

        {/* Global Footer */}
        <footer style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', paddingBottom: '2.5rem', marginTop: '4rem', backgroundColor: '#f8fafc' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Column 1: Quick Links */}
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link></li>
                <li><Link to="/doctors" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Find Doctors</Link></li>
                <li><Link to="/contact-us" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact Us</Link></li>
              </ul>
            </div>
            {/* Column 2: Services */}
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/doctors" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Book Appointment</Link></li>
                <li><Link to="/ai-assistant" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>AI Assistant</Link></li>
              </ul>
            </div>
            {/* Column 3: Legal */}
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="container" style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              © {new Date().getFullYear()} MediConnect. All rights reserved.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '700px', margin: '0.5rem auto 0 auto', lineHeight: '1.5' }}>
              <strong>Medical Disclaimer:</strong> MediConnect is an educational demonstration application. 
              The information and AI-based suggestions provided are for educational and tracking purposes only 
              and should not be used as professional medical diagnosis or treatment. For urgent health matters, 
              always contact a licensed doctor or emergency healthcare response services.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
