import React, { useState } from 'react';
import countries from './countries';
import './Register.css';
import { FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';

function Register({ onRegisterSuccess, toggleToLogin }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailMode, setIsEmailMode] = useState(true);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+95');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/auth';

  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  const setEmailMode = (value) => {
    setIsEmailMode(value);
    if (value) {
      setPhoneNumber('');
      setErrors({ identifier: '' });
    } else {
      setEmail('');
      setErrors({ identifier: '' });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});
    setIsLoading(true);

    const identifier = isEmailMode ? email : `${countryCode}${phoneNumber}`;
    if (!identifier) {
      setErrors({ identifier: 'Please enter your email or phone number.' });
      setMessage('Please enter your email or phone number.');
      setIsLoading(false);
      return;
    }

    if (isEmailMode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ identifier: 'Please enter a valid email address.' });
      setMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!isEmailMode && !/^\d{6,15}$/.test(phoneNumber)) {
      setErrors({ identifier: 'Phone number must be 6-15 digits.' });
      setMessage('Phone number must be 6-15 digits.');
      setIsLoading(false);
      return;
    }

    const payload = isEmailMode ? { email } : { phone_number: `${countryCode}${phoneNumber}` };
    console.log('Sending OTP payload:', payload);
    try {
      const response = await fetch(`${API_BASE_URL}/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          setErrors(json);
          setMessage(json.error || 'Failed to send OTP.');
        } else {
          setMessage('Error: Server returned an unexpected response.');
        }
        setIsLoading(false);
        return;
      }

      const json = await response.json();
      setMessage('OTP sent successfully! Check your email or phone.');
      setStep(2);
      setIsLoading(false);
    } catch (error) {
      setMessage('Error: Unable to connect to the server.');
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});
    setIsLoading(true);

    if (!username) {
      setErrors({ username: 'Username is required.' });
      setMessage('Username is required.');
      setIsLoading(false);
      return;
    }
    if (username.length < 3) {
      setErrors({ username: 'Username must be at least 3 characters.' });
      setMessage('Username must be at least 3 characters.');
      setIsLoading(false);
      return;
    }
    if (!otp) {
      setErrors({ otp: 'Please enter the OTP code.' });
      setMessage('Please enter the OTP code.');
      setIsLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'OTP must be exactly 6 digits.' });
      setMessage('OTP must be exactly 6 digits.');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters.' });
      setMessage('Password must be at least 8 characters.');
      setIsLoading(false);
      return;
    }
    if (/^\d+$/.test(password)) {
      setErrors({ password: 'Password cannot be entirely numeric.' });
      setMessage('Password cannot be entirely numeric.');
      setIsLoading(false);
      return;
    }
    if (password.toLowerCase() === username.toLowerCase()) {
      setErrors({ password: 'Password cannot be the same as your username.' });
      setMessage('Password cannot be the same as your username.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirm_password: 'Passwords do not match.' });
      setMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const payload = {
      code: otp,
      username,
      password,
      confirm_password: confirmPassword,
      ...(isEmailMode ? { email } : { phone_number: `${countryCode}${phoneNumber}` }),
    };
    console.log('Verifying OTP payload:', payload);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          setErrors(json);
          setMessage(json.password || json.error || 'Invalid OTP or registration failed.');
        } else {
          setMessage('Error: Server returned an unexpected response.');
        }
        setIsLoading(false);
        return;
      }

      const json = await response.json();
      localStorage.setItem('access_token', json.access);
      localStorage.setItem('refresh_token', json.refresh);
      setMessage('Account created successfully!');
      setEmail('');
      setPhoneNumber('');
      setCountryCode('+95');
      setOtp('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setStep(1);
      setTimeout(() => {
        onRegisterSuccess && onRegisterSuccess();
      }, 2000);
      setIsLoading(false);
    } catch (error) {
      setMessage('Error: Unable to connect to the server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form
        className="register-form"
        onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP}
      >
        <h2>Create Account (Step {step} of 2)</h2>

        {step === 1 && (
          <div className="form-step">
            <div className="login-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isEmailMode}
                className={`toggle-btn ${isEmailMode ? 'active' : ''}`}
                onClick={() => setEmailMode(true)}
              >
                Email
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isEmailMode}
                className={`toggle-btn ${!isEmailMode ? 'active' : ''}`}
                onClick={() => setEmailMode(false)}
              >
                Phone Number
              </button>
            </div>
            {isEmailMode ? (
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
                  aria-describedby={errors.identifier ? 'email-error' : undefined}
                />
                {errors.identifier && <p id="email-error" className="error-text">{errors.identifier}</p>}
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
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    className={errors.identifier ? 'input-error' : ''}
                    aria-describedby={errors.identifier ? 'phone-error' : undefined}
                  />
                </div>
                {errors.identifier && <p id="phone-error" className="error-text">{errors.identifier}</p>}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={errors.username ? 'input-error' : ''}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && <p id="username-error" className="error-text">{errors.username}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="otp">OTP Code</label>
              <input
                type="text"
                id="otp"
                placeholder="Enter the OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                pattern="\d{6}"
                maxLength="6"
                className={errors.otp ? 'input-error' : ''}
                aria-describedby={errors.otp ? 'otp-error' : undefined}
              />
              {errors.otp && <p id="otp-error" className="error-text">{errors.otp}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="password">
                <FaLock className="input-icon" /> Password
                <span className="helper-text"> (min 8 characters, not entirely numeric, not same as username)</span>
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={errors.password ? 'input-error' : ''}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <p id="password-error" className="error-text">{errors.password}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <input
                type="password"
                id="confirm_password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={errors.confirm_password ? 'input-error' : ''}
                aria-describedby={errors.confirm_password ? 'confirm-password-error' : undefined}
              />
              {errors.confirm_password && <p id="confirm-password-error" className="error-text">{errors.confirm_password}</p>}
            </div>
            <div className="button-group">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setStep(1);
                  setMessage('');
                  setErrors({});
                }}
              >
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Verify OTP & Register'}
              </button>
            </div>
          </div>
        )}

        {message && <p className={message.includes('Error') ? 'error-text' : 'message'}>{message}</p>}

        {step === 1 && (
          <p className="toggle-text">
            Already have an account?{" "}
            <span className="toggle-link" onClick={toggleToLogin}>
              Login here.
            </span>
          </p>
        )}
      </form>
    </div>
  );
}

export default Register;