// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './Profile';
import UploadProduct from './UploadProduct';
import UserProfile from './UserProfile';
import ProductDetail from './ProductDetail';
import Header from './Header';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Logout Function
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/');
      } else {
        console.error('Logout failed.');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  // ✅ Refresh Access Token
  const refreshToken = useCallback(async () => {
    const refresh_token = localStorage.getItem('refresh_token');

    if (!refresh_token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refresh_token }),
      });

      if (response.ok) {
        const json = await response.json();
        localStorage.setItem('access_token', json.access);
        await checkUser(); // ✅ Fetch user again with the new token
      } else {
        handleLogout(); // ✅ Logout if refresh fails
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleLogout();
    }
  }, [handleLogout]); // ✅ Dependency added

  // ✅ Fetch Authenticated User
  const checkUser = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        await refreshToken();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [refreshToken]); // ✅ Dependency added

  // ✅ Check user session on mount
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // ✅ Handle successful login
  const handleLoginSuccess = () => {
    checkUser();
  };

  const toggleToLogin = () => setShowRegister(false);
  const toggleToRegister = () => setShowRegister(true);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app-container">
      <Header isAuthenticated={isAuthenticated} user={user} handleLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/profile/:username" element={<UserProfile />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadProduct />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
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
