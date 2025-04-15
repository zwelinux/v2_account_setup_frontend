import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import countries from './countries';
import './ForgotPassword.css';

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [isEmail, setIsEmail] = useState(true);
  const [countryCode, setCountryCode] = useState(countries[0].phone);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputTypeChange = (e) => {
    setIsEmail(e.target.value === 'email');
    setIdentifier('');
    setPhoneNumber('');
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    let finalIdentifier = identifier;

    if (isEmail) {
      if (!identifier) {
        setError('Please enter your email address.');
        setIsLoading(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }
    } else {
      if (!phoneNumber) {
        setError('Please enter your phone number.');
        setIsLoading(false);
        return;
      }
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      if (digitsOnly.length < 7) {
        setError('Phone number must be at least 7 digits long (excluding country code).');
        setIsLoading(false);
        return;
      }
      finalIdentifier = `${countryCode}${digitsOnly}`;
    }

    const payload = isEmail ? { email: finalIdentifier } : { phone_number: finalIdentifier };
    console.log('[DEV] Sending forgot password request:', payload);  // Log payload for debugging

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setError(data.error || 'Failed to send reset link.');
        } else {
          setError('Error: Server returned an unexpected response.');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setMessage(data.message);
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-type-toggle" role="radiogroup" aria-label="Choose reset method">
          <label>
            <input
              type="radio"
              value="email"
              checked={isEmail}
              onChange={handleInputTypeChange}
              aria-checked={isEmail}
            />
            Email
          </label>
          <label>
            <input
              type="radio"
              value="phone"
              checked={!isEmail}
              onChange={handleInputTypeChange}
              aria-checked={!isEmail}
            />
            Phone Number
          </label>
        </div>

        {isEmail ? (
          <div className="input-group">
            <label htmlFor="email">Enter your email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              aria-describedby={error ? 'email-error' : undefined}
            />
          </div>
        ) : (
          <div className="input-group phone-input-container">
            <label htmlFor="phone_number">Enter your phone number</label>
            <div className="phone-input-wrapper">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="country-code-select"
                aria-label="Select country code"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.phone}>
                    {country.name} ({country.phone})
                  </option>
                ))}
              </select>
              <input
                type="text"
                id="phone_number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="phone-number-input"
                aria-describedby={error ? 'phone-error' : undefined}
              />
            </div>
          </div>
        )}

        {error && <p id={isEmail ? 'email-error' : 'phone-error'} className="error">{error}</p>}
        {message && <p className="message">{message}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p>
          <button type="button" onClick={() => navigate('/')}>Back to Login</button>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;