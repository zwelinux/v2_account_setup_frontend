import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ isAuthenticated, user, handleLogoutSuccess }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Buy & Sell Platform</h1>
      </div>
      {isAuthenticated && (
        <div className="header-right">
          <button className="hamburger" onClick={toggleMobileMenu}>
            {showMobileMenu ? '×' : '☰'}
          </button>
          <nav className={`nav ${showMobileMenu ? 'active' : ''}`}>
            <ul>
              <li>
                <Link to="/dashboard" onClick={() => setShowMobileMenu(false)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={() => setShowMobileMenu(false)}>
                  My Profile ({user.username})
                </Link>
              </li>
              <li>
                <Link to="/upload" onClick={() => setShowMobileMenu(false)}>
                  Upload Product
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleLogoutSuccess();
                    setShowMobileMenu(false);
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
