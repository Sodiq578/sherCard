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

    let activeIndex = Array.from(items).findIndex(
      (item) => location.pathname === item.querySelector('a')?.getAttribute('href')
    );

    if (activeIndex === -1) activeIndex = 0; // default 0

    const activeItem = items[activeIndex];
    const indicator = indicatorRef.current;
    if (indicator && activeItem) {
      const itemRect = activeItem.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      indicator.style.left = `${itemRect.left - menuRect.left}px`;
      indicator.style.width = `${itemRect.width}px`;
    }
  };

  useEffect(() => {
    updateIndicator();

    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  return (
    <nav className="bottom-nav">
      <ul className="menu bottom-nav-menu" ref={menuRef}>
        <div className="indicator" ref={indicatorRef}></div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <li key={item.to} className="nav-item">
              <Link to={item.to} className={isActive ? 'active' : ''}>
                <span className="icon">
                  <Icon size={26} />
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
