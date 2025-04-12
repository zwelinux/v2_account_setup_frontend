import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSortDown, FaPowerOff } from 'react-icons/fa';
import './Header.css';

function Header({ isAuthenticated, user, handleLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <header className="header">
      {/* Left: Logo and Subtitle */}
      <div className="header-left">
        <h1>Ladyfirst.me</h1>
        <p className="subtitle">Your one-stop marketplace for buying and selling</p>
      </div>

      {/* Right: Navigation and Hamburger */}
      {isAuthenticated && (
        <div className="header-right">
          <button className="hamburger" onClick={toggleMobileMenu}>
            <FaSortDown size={30} />
          </button>
          <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul>
              <li><Link to="/dashboard" onClick={toggleMobileMenu}>Dashboard</Link></li>
              <li><Link to="/profile" onClick={toggleMobileMenu}>Own</Link></li>
              <li><Link to="/upload" onClick={toggleMobileMenu}>Sell</Link></li>
              <li><Link to="/seller/dashboard">Tickets</Link></li>
              <li><Link to={`/profile/${user.username}`} onClick={toggleMobileMenu}>Profile</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">Orders</Link></li>
              <li><Link to="/inbox">Inbox</Link></li>
              <li>
                <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="logout-button">
                  <FaPowerOff />
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
