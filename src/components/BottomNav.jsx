// src/components/BottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiHome,
  HiOutlineHome,
  HiShoppingBag,
  HiOutlineShoppingBag,
  HiShoppingCart,     // YANGI
  HiOutlineShoppingCart, // YANGI
  HiDocumentText,
  HiOutlineDocumentText,
  HiUser,
  HiOutlineUser,
} from 'react-icons/hi';
import '../styles/BottomNav.css';

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      {/* 1. Asosiy */}
      <Link to="/main" className={`nav-item ${isActive('/main') ? 'active' : ''}`}>
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/main') ? <HiHome size={24} /> : <HiOutlineHome size={24} />}
          </div>
          <span className="nav-text">Asosiy</span>
        </div>
        {isActive('/main') && <div className="active-bg" />}
      </Link>

      {/* 2. Market (YANGI) */}
      <Link to="/market" className={`nav-item ${isActive('/market') ? 'active' : ''}`}>
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/market') ? <HiShoppingCart size={24} /> : <HiOutlineShoppingCart size={24} />}
          </div>
          <span className="nav-text">Market</span>
        </div>
        {isActive('/market') && <div className="active-bg" />}
      </Link>

      {/* 3. Sotuv (Marketplace) */}
      <Link to="/marketplace" className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}>
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/marketplace') ? <HiShoppingBag size={24} /> : <HiOutlineShoppingBag size={24} />}
          </div>
          <span className="nav-text">Sotuv</span>
        </div>
        {isActive('/marketplace') && <div className="active-bg" />}
      </Link>

      {/* 4. Kartalar */}
      <Link to="/cards" className={`nav-item ${isActive('/cards') ? 'active' : ''}`}>
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/cards') ? <HiDocumentText size={24} /> : <HiOutlineDocumentText size={24} />}
          </div>
          <span className="nav-text">Kartalar</span>
        </div>
        {isActive('/cards') && <div className="active-bg" />}
      </Link>

      {/* 5. Profil */}
      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/profile') ? <HiUser size={24} /> : <HiOutlineUser size={24} />}
          </div>
          <span className="nav-text">Profil</span>
        </div>
        {isActive('/profile') && <div className="active-bg" />}
      </Link>
    </nav>
  );
}

export default BottomNav;