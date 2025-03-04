// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './Profile';
import UploadProduct from './UploadProduct';
import ProductDetail from './ProductDetail';
import './App.css';

function App() {
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

  const handleLogoutSuccess = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleToLogin = () => {
    setShowRegister(false);
  };

  const toggleToRegister = () => {
    setShowRegister(true);
  };

  return (
    <Router>
      <div className="app-container">
        <header>
          <h1>Buy & Sell Platform</h1>
          {isAuthenticated && (
            <nav>
              <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/profile">My Profile ({user.username})</Link></li>
                <li><Link to="/upload">Upload Product</Link></li>
                <li>
                  <button onClick={handleLogoutSuccess}>Logout</button>
                </li>
              </ul>
            </nav>
          )}
        </header>

        <main>
          {isAuthenticated ? (
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<UploadProduct />} />
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
    </Router>
  );
}

export default App;
