// src/components/BottomNav.jsx
import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiHome,
  HiOutlineHome,
  HiShoppingCart,
  HiOutlineShoppingCart,
  HiShoppingBag,
  HiOutlineShoppingBag,
} from 'react-icons/hi';
import '../styles/BottomNav.css';

const menuItems = [
  { to: '/main', label: 'Asosiy', icon: HiOutlineHome, activeIcon: HiHome },
  { to: '/market', label: 'Market', icon: HiOutlineShoppingCart, activeIcon: HiShoppingCart },
  { to: '/marketplace', label: 'Sotuv', icon: HiOutlineShoppingBag, activeIcon: HiShoppingBag },
];

function BottomNav() {
  const location = useLocation();
  const indicatorRef = useRef(null);
  const menuRef = useRef(null);

  const updateIndicator = () => {
    const items = menuRef.current?.querySelectorAll('.nav-item');
    if (!items || items.length === 0) return;

    const activeIndex = Array.from(items).findIndex(
      (item) => item.getAttribute('href') === location.pathname
    );

    if (activeIndex === -1) return;

    const firstItem = items[0];
    const activeItem = items[activeIndex];

    const gap =
      activeIndex > 0
        ? items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().right
        : 0;

    const itemWidth = activeItem.offsetWidth;
    const leftOffset = firstItem.getBoundingClientRect().left;

    const indicator = indicatorRef.current;
    if (indicator) {
      indicator.style.setProperty('--item', activeIndex);
      indicator.style.setProperty('--gap', `${gap}px`);
      indicator.style.setProperty('--item-width', `${itemWidth}px`);
    }
  };

  useEffect(() => {
    updateIndicator();
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location]);

  return (
    <nav className="bottom-nav">
      <div className="indicator" ref={indicatorRef}></div>
      <ul className="menu bottom-nav-menu" ref={menuRef}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                href={item.to} // for JS calculation
              >
                <span className="icon">
                  <Icon size={24} />
                </span>
                <span className="text">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
