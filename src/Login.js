import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, toggleToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://ladyfirst.pythonanywhere.com/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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