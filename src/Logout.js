import React from 'react';

function Logout({ onLogout }) {
  const handleLogout = async () => {
    try {
      const response = await fetch('https://ladyfirstme.pythonanywhere.com/api/auth/logout/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
      });

      if (response.ok) {
        // ✅ Remove tokens on successful logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
