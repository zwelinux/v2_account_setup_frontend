// src/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShareAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

function Header({ isAuthenticated, user, handleLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <header className="header">
      <div className="header-left">
        <h1>Buy & Sell Platform</h1>
        <p className="subtitle">Your one-stop marketplace for buying and selling</p>
      </div>
      {isAuthenticated && (
        <div className="header-right">
          <button className="hamburger" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
          <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul>
              <li>
                <Link to="/dashboard" onClick={toggleMobileMenu}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={toggleMobileMenu}>
                  My Products
                </Link>
              </li>
              <li>
                <Link to="/upload" onClick={toggleMobileMenu}>
                  Upload Product
                </Link>
              </li>
              <li>
                <Link to={`/profile/${user.username}`} onClick={toggleMobileMenu}>
                  <FaShareAlt title="Share Profile" size={20} />
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FaSignOutAlt title="Logout" size={20} />
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
