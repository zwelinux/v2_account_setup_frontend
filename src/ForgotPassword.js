// src/ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Reset link sent to your email. Check your inbox.');
      } else {
        setError(data.error || 'Failed to send reset link.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p>
          <button type="button" onClick={() => navigate('/')}>Back to Login</button>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;