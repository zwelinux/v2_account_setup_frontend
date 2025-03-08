// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './Profile'; // For internal profile editing (My Products)
import UploadProduct from './UploadProduct';
import UserProfile from './UserProfile';  // Public profile page for sharing
import ProductDetail from './ProductDetail'; // Product detail page
import Header from './Header';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/user/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLoginSuccess = () => {
    checkUser();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        navigate('/'); // Redirect to login page after logout
      } else {
        console.error('Logout failed.');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleToLogin = () => setShowRegister(false);
  const toggleToRegister = () => setShowRegister(true); // 💡 Added back


  if (loading) {
    return <p>Loading...</p>; // Prevents flickering issues
  }

  return (
    <div className="app-container">
      <Header isAuthenticated={isAuthenticated} user={user} handleLogout={handleLogout} />
      <main>
        <Routes>
          {/* Publicly accessible profile page */}
          <Route path="/profile/:username" element={<UserProfile />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Private routes */}
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadProduct />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              {/* Login & Register for unauthenticated users */}
              <Route
                path="/"
                element={showRegister ? (
                  <Register onRegisterSuccess={toggleToLogin} toggleToLogin={toggleToLogin} />
                ) : (
                  <Login onLogin={handleLoginSuccess} toggleToRegister={toggleToRegister} />
                )}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;