// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './Profile'; // For internal profile editing (My Products)
import UploadProduct from './UploadProduct';
import UserProfile from './UserProfile';  // Public profile page for sharing
import ProductDetail from './ProductDetail'; // Product detail page
import './App.css';

// Import icons from react-icons
import { FaShareAlt, FaSignOutAlt } from 'react-icons/fa';

function AppContent() {
  // useNavigate hook can only be used inside a component that is within Router
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

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
        navigate('/'); // Redirect to login page or root after logout
      } else {
        console.error('Logout failed.');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleToLogin = () => {
    setShowRegister(false);
  };

  const toggleToRegister = () => {
    setShowRegister(true);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Buy & Sell Platform</h1>
        {isAuthenticated && (
          <nav>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/profile">My Products</Link></li>
              <li><Link to="/upload">Upload Product</Link></li>
              <li>
                {/* Share icon linking to the public profile page */}
                <Link to={`/profile/${user.username}`}>
                  <FaShareAlt title="Share Profile" size={20} />
                </Link>
              </li>
              <li>
                {/* Logout icon as a button */}
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FaSignOutAlt title="Logout" size={20} />
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main>
        {isAuthenticated ? (
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadProduct />} />
            {/* Internal profile for editing */}
            <Route path="/profile" element={<Profile />} />
            {/* Public profile page for sharing */}
            <Route path="/profile/:username" element={<UserProfile />} />
            {/* Product detail page */}
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : (
          <>
            {showRegister ? (
              <Register onRegisterSuccess={toggleToLogin} toggleToLogin={toggleToLogin} />
            ) : (
              <Login onLogin={handleLoginSuccess} toggleToRegister={toggleToRegister} />
            )}
          </>
        )}
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
