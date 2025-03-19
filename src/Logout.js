// src/Logout.js
import React from 'react';

function Logout({ onLogout }) {
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        onLogout && onLogout();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default Logout;