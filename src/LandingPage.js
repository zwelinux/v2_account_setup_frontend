// ✅ src/LandingPage.js
import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="hero-banner">
        <img
          src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Superstar Collection"
        />
        <div className="hero-text">
          <h1>Refresh Wardrobe</h1>
          <p>A streetwear staple, from the basketball court to the street</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
