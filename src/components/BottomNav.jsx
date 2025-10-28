// src/components/BottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiHome,
  HiOutlineHome,
  HiShoppingBag,
  HiOutlineShoppingBag,
  HiCreditCard,
  HiOutlineCreditCard,
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
      <Link
        to="/main"
        className={`nav-item ${isActive('/main') ? 'active' : ''}`}
      >
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/main') ? <HiHome size={24} /> : <HiOutlineHome size={24} />}
          </div>
          <span className="nav-text">Asosiy</span>
        </div>
        {isActive('/main') && <div className="active-bg" />}
      </Link>

      {/* 2. Sotuv */}
      <Link
        to="/marketplace"
        className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}
      >
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/marketplace') ? (
              <HiShoppingBag size={24} />
            ) : (
              <HiOutlineShoppingBag size={24} />
            )}
          </div>
          <span className="nav-text">Sotuv</span>
        </div>
        {isActive('/marketplace') && <div className="active-bg" />}
      </Link>

      {/* 3. Karta */}
      <Link
        to="/buy-card"
        className={`nav-item ${isActive('/buy-card') ? 'active' : ''}`}
      >
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/buy-card') ? (
              <HiCreditCard size={24} />
            ) : (
              <HiOutlineCreditCard size={24} />
            )}
          </div>
          <span className="nav-text">Karta</span>
        </div>
        {isActive('/buy-card') && <div className="active-bg" />}
      </Link>

      {/* 4. Kartalar */}
      <Link
        to="/cards"
        className={`nav-item ${isActive('/cards') ? 'active' : ''}`}
      >
        <div className="nav-content">
          <div className="nav-icon">
            {isActive('/cards') ? (
              <HiDocumentText size={24} />
            ) : (
              <HiOutlineDocumentText size={24} />
            )}
          </div>
          <span className="nav-text">Kartalar</span>
        </div>
        {isActive('/cards') && <div className="active-bg" />}
      </Link>

      {/* 5. Profil */}
      <Link
        to="/profile"
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
      >
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