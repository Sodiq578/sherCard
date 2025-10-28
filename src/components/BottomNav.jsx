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
  HiOutlineUser 
} from 'react-icons/hi';
import '../styles/BottomNav.css';

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/main" className={`nav-item ${isActive('/main') ? 'active' : ''}`}>
        {isActive('/main') ? <HiHome size={24} /> : <HiOutlineHome size={24} />}
        <span className="indicator"></span>
      </Link>

      <Link to="/marketplace" className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}>
        {isActive('/marketplace') ? <HiShoppingBag size={24} /> : <HiOutlineShoppingBag size={24} />}
        <span className="indicator"></span>
      </Link>

      <Link to="/buy-card" className={`nav-item ${isActive('/buy-card') ? 'active' : ''}`}>
        {isActive('/buy-card') ? <HiCreditCard size={24} /> : <HiOutlineCreditCard size={24} />}
        <span className="indicator"></span>
      </Link>

      <Link to="/cards" className={`nav-item ${isActive('/cards') ? 'active' : ''}`}>
        {isActive('/cards') ? <HiDocumentText size={24} /> : <HiOutlineDocumentText size={24} />}
        <span className="indicator"></span>
      </Link>

      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        {isActive('/profile') ? <HiUser size={24} /> : <HiOutlineUser size={24} />}
        <span className="indicator"></span>
      </Link>
    </nav>
  );
}

export default BottomNav;