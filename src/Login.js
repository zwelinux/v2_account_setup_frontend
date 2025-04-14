// src/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import countries from './countries';
import './Login.css';

// Import icons from react-icons
import { FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';

function Login({ onLogin, toggleToRegister }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [countryCode, setCountryCode] = useState('+95'); // Default to Myanmar
  const [errors, setErrors] = useState({}); // For validation feedback

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{6,15}$/;

  // Define the base API URL
  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://ladyfirstme.pythonanywhere.com/api/auth'
    : 'http://localhost:8000/api/auth';

  // Sort countries alphabetically by name
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    if (!isEmailLogin) {
      if (value && !/^\d*$/.test(value)) {
        setErrors({ ...errors, identifier: 'Phone number must contain only digits.' });
        setError('Phone number must contain only digits.');
        return;
      }
      setIdentifier(`${countryCode}${value}`);
      setErrors({ ...errors, identifier: '' });
      setError('');
    } else {
      setIdentifier(value);
      if (value && !emailRegex.test(value)) {
        setErrors({ ...errors, identifier: 'Please enter a valid email address.' });
      } else {
        setErrors({ ...errors, identifier: '' });
      }
    }
  };

  const handleCountryCodeChange = (e) => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);
    const phoneNumber = identifier.replace(/^\+\d+/, '');
    setIdentifier(`${newCountryCode}${phoneNumber}`);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length < 6) {
      setErrors({ ...errors, password: 'Password must be at least 6 characters.' });
    } else {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (isEmailLogin) {
      if (!emailRegex.test(identifier)) {
        setErrors({ ...errors, identifier: 'Please enter a valid email address.' });
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      const phoneNumber = identifier.replace(countryCode, '');
      if (!phoneRegex.test(phoneNumber)) {
        setErrors({ ...errors, identifier: 'Please enter a valid phone number (6-15 digits).' });
        setError('Please enter a valid phone number (6-15 digits).');
        return;
      }
    }

    if (password.length < 6) {
      setErrors({ ...errors, password: 'Password must be at least 6 characters.' });
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const payload = isEmailLogin
        ? { email: identifier, password }
        : { phone_number: identifier, password };

      console.log('Login Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/login/`, {
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
        setError(json.error || 'Login failed');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    }
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
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
        setError('Failed to fetch user details');
      }
    } catch (error) {
      setError('Error fetching user: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login to Your Account</h2>
        <div className="login-toggle">
          <button
            type="button"
            className={`toggle-btn ${isEmailLogin ? 'active' : ''}`}
            onClick={() => setIsEmailLogin(true)}
          >
            Email
          </button>
          <button
            type="button"
            className={`toggle-btn ${!isEmailLogin ? 'active' : ''}`}
            onClick={() => setIsEmailLogin(false)}
          >
            Phone Number
          </button>
        </div>

        <div className="form-step">
          {isEmailLogin ? (
            <div className="input-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" /> Email
                <span className="helper-text"> (e.g., user@example.com)</span>
              </label>
              <input
                type="text"
                id="email"
                placeholder="Enter your email"
                value={identifier}
                onChange={handleIdentifierChange}
                required
                className={errors.identifier ? 'input-error' : ''}
              />
            </div>
          ) : (
            <div className="input-group phone-input-group">
              <label htmlFor="phone_number">
                <FaPhone className="input-icon" /> Phone Number
                <span className="helper-text"> (e.g., 123456789)</span>
                <span className="tooltip">Must be 6-15 digits</span>
              </label>
              <div className="phone-input-wrapper">
                <select value={countryCode} onChange={handleCountryCodeChange}>
                  {sortedCountries.map((country) => (
                    <option key={country.code} value={country.phone}>
                      {country.phone} ({country.name})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="phone_number"
                  placeholder="Enter phone number"
                  value={identifier.replace(countryCode, '')}
                  onChange={handleIdentifierChange}
                  required
                  className={errors.identifier ? 'input-error' : ''}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Password
              <span className="helper-text"> (minimum 6 characters)</span>
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
              className={errors.password ? 'input-error' : ''}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">Login</button>

        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}

        <p className="toggle-text">
          Don't have an account?{' '}
          <span className="toggle-link" onClick={toggleToRegister}>
            Create one.
          </span>
        </p>
        <p className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;