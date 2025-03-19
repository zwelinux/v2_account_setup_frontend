import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, toggleToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();

      if (response.ok) {
        // ✅ Store tokens in localStorage
        localStorage.setItem('access_token', json.access);
        localStorage.setItem('refresh_token', json.refresh);

        setMessage("Logged in successfully!");

        // ✅ Fetch user details immediately after login
        fetchUserData(json.access);

        onLogin(); // Notify parent component that login was successful.
      } else {
        setMessage(json.detail || "Login failed");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // ✅ Fetch user details using the access token
  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // ✅ Send token in Authorization header
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("User data:", userData);
      } else {
        setMessage("Failed to fetch user details");
      }
    } catch (error) {
      setMessage("Error fetching user: " + error.message);
    }
  };

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
        <button type="submit">Login</button>
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
