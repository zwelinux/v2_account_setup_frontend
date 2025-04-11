// frontend/src/Login.js
import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, toggleToRegister }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const payload = isEmailLogin
        ? { email: identifier, password }
        : { phone_number: identifier, password };

      console.log('Login Payload:', payload);

      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      console.log('Login Response:', json);

      if (response.ok) {
        localStorage.setItem('access_token', json.access);
        localStorage.setItem('refresh_token', json.refresh);
        setMessage('Logged in successfully!');
        fetchUserData(json.access);
        onLogin();
      } else {
        setMessage(json.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
      } else {
        setMessage('Failed to fetch user details');
      }
    } catch (error) {
      setMessage('Error fetching user: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="login-toggle">
          <span
            className={`login-option ${isEmailLogin ? 'active' : ''}`}
            onClick={() => setIsEmailLogin(true)}
          >
            Email
          </span>
          <span
            className={`login-option ${!isEmailLogin ? 'active' : ''}`}
            onClick={() => setIsEmailLogin(false)}
          >
            Phone Number
          </span>
        </div>
        <input
          type="text"
          placeholder={isEmailLogin ? 'Email' : 'Phone Number'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {message && <p className="message">{message}</p>}
        <p className="toggle-text">
          Don't have an account?{' '}
          <span className="toggle-link" onClick={toggleToRegister}>
            Create one.
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;