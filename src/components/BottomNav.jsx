import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link to="/main" className={`nav-item ${location.pathname === '/main' ? 'active' : ''}`}>
        <div className="nav-icon">🏠</div>
        <span className="nav-text">Asosiy</span>
      </Link>
      
      <Link to="/marketplace" className={`nav-item ${location.pathname === '/marketplace' ? 'active' : ''}`}>
        <div className="nav-icon">🏪</div>
        <span className="nav-text">Sotuv</span>
      </Link>
      
      <Link to="/buy-card" className={`nav-item ${location.pathname === '/buy-card' ? 'active' : ''}`}>
        <div className="nav-icon">💳</div>
        <span className="nav-text">Karta</span>
      </Link>
      
      <Link to="/cards" className={`nav-item ${location.pathname === '/cards' ? 'active' : ''}`}>
        <div className="nav-icon">📋</div>
        <span className="nav-text">Kartalar</span>
      </Link>
      
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <div className="nav-icon">👤</div>
        <span className="nav-text">Profil</span>
      </Link>
    </nav>
  );
}

export default BottomNav;