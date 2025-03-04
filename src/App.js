import React, { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import Logout from './Logout';
import ProductUpload from './ProductUpload';
import MyProductsList from './MyProductsList';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshProducts, setRefreshProducts] = useState(0);

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

  // Call this function after a successful product upload to refresh the list.
  const refreshProductList = () => {
    setRefreshProducts(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <h1>Buy & Sell Platform</h1>
      {isAuthenticated ? (
        <>
          <h2>Welcome, {user?.username}!</h2>
          <p>You are logged in.</p>
          <Logout onLogout={handleLogoutSuccess} />
          <ProductUpload onUploadSuccess={refreshProductList} />
          <MyProductsList refresh={refreshProducts} />
        </>
      ) : (
        <>
          {showRegister ? (
            <Register onRegisterSuccess={toggleToLogin} toggleToLogin={toggleToLogin} />
          ) : (
            <Login onLogin={handleLoginSuccess} toggleToRegister={toggleToRegister} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
