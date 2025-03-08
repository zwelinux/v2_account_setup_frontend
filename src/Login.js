import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, toggleToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://ladyfirst.pythonanywhere.com/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()  // Ensure CSRF token is included
        },
        credentials: 'include',  // Sends cookies for session authentication
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();
      if (response.ok) {
        setMessage("Logged in successfully!");
        onLogin(); // Notify parent component that login was successful.
      } else {
        setMessage(json.error || "Login failed");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper function to get CSRF token from cookies.
   */
  function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach((cookie) => {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith('csrftoken=')) {
          cookieValue = trimmedCookie.split('=')[1];
        }
      });
    }
    return cookieValue;
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        {message && <p className="message">{message}</p>}
        <p className="toggle-text">
          Don't have an account?{" "}
          <span className="toggle-link" onClick={toggleToRegister}>
            Create one.
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
