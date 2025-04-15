// src/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import countries from './countries';
import './Login.css';
import { FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';

function Login({ onLogin, toggleToRegister }) {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+95');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [errors, setErrors] = useState({});

  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://ladyfirstme.pythonanywhere.com/api/auth'
    : 'http://localhost:8000/api/auth';

  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setErrors({});

    const identifier = isEmailLogin ? email : `${countryCode}${phoneNumber}`;
    if (!identifier) {
      setErrors({ identifier: 'Please enter your email or phone number.' });
      setError('Please enter your email or phone number.');
      return;
    }

    if (isEmailLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ identifier: 'Please enter a valid email address.' });
      setError('Please enter a valid email address.');
      return;
    }

    if (!isEmailLogin && !/^\d{6,15}$/.test(phoneNumber)) {
      setErrors({ identifier: 'Phone number must be 6-15 digits.' });
      setError('Phone number must be 6-15 digits.');
      return;
    }

    if (!password) {
      setErrors({ password: 'Password is required.' });
      setError('Password is required.');
      return;
    }

    try {
      const payload = isEmailLogin
        ? { email, password }
        : { phone_number: `${countryCode}${phoneNumber}`, password };

      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (response.ok) {
        localStorage.setItem('access_token', json.access);
        localStorage.setItem('refresh_token', json.refresh);
        setMessage('Logged in successfully!');
        setEmail('');
        setPhoneNumber('');
        setPassword('');
        setCountryCode('+95');
        onLogin();
      } else {
        setError(json.error || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Error: Unable to connect to the server.');
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
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={errors.identifier ? 'input-error' : ''}
              />
              {errors.identifier && <p className="error-text">{errors.identifier}</p>}
            </div>
          ) : (
            <div className="input-group phone-input-group">
              <label htmlFor="phone_number">
                <FaPhone className="input-icon" /> Phone Number
                <span className="helper-text"> (e.g., 123456789)</span>
                <span className="tooltip">Must be 6-15 digits</span>
              </label>
              <div className="phone-input-wrapper">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
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
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className={errors.identifier ? 'input-error' : ''}
                />
              </div>
              {errors.identifier && <p className="error-text">{errors.identifier}</p>}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
        </div>

        <button type="submit" className="btn-primary">Login</button>

        {message && <p className="message">{message}</p>}
        {error && <p className="error-text">{error}</p>}

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