// src/components/MainMenu.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  FiHome,
  FiCreditCard,
  FiClock,
  FiUser,
  FiPlusCircle,
  FiShoppingBag,
} from "react-icons/fi";
import Logo from "../assets/images/logo.png";
import { getShops } from "../data/shops";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  const handleTopUp = (amount) => {
    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + amount,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString(),
          action: "Balans to‘ldirildi",
          amount,
        },
      ],
    };
    updateUser(updatedUser);
    alert(`${amount.toLocaleString()} UZS qo‘shildi!`);
  };

  const displayName = user?.profile?.name || user?.login || "Foydalanuvchi";
  const shops = getShops();

  return (
    <div className="menu-container">
      {/* Salomlashuv */}
      <div className="welcome-section">
        <div className="avatar-circle">
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="avatar-img" />
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Default Avatar"
              className="avatar-placeholder-img"
            />
          )}
        </div>
        <div className="welcome-texts">
          <span className="welcome">Salom,</span>
          <span className="username">{displayName}</span>
        </div>
      </div>

      {/* Balans */}
      <div className="balance-card">
        <div className="balance-top">
          <div className="balance-icon">
            <FiCreditCard size={32} />
          </div>
          <div className="balance-amount">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="Logo" className="balance-logo" />
          </div>
        </div>
        <div className="balance-label">Joriy balans</div>
      </div>

      {/* Balans to‘ldirish */}
      <div className="topup-section">
        <h3>
          <FiPlusCircle /> Balansni to‘ldirish
        </h3>
        <div className="topup-options">
          {[500, 1000, 5000, 10000].map((amount) => (
            <button
              key={amount}
              className="topup-btn"
              onClick={() => handleTopUp(amount)}
            >
              +{amount.toLocaleString()}{" "}
              <img src={Logo} alt="Logo" className="topup-logo" />
            </button>
          ))}
        </div>
      </div>

      {/* Do‘konlar */}
      <div className="shops-section">
        <h3>
          <FiShoppingBag /> Tokenlar bilan yegulik olsa bo‘ladigan joylar
        </h3>
        <div className="shops-grid">
          {Array.isArray(shops) && shops.length > 0 ? (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="shop-card"
                onClick={() => navigate(`/shop/${shop.id}`)}
              >
                <img src={shop.logo} alt={shop.name} className="shop-logo-img" />
                <p>{shop.name}</p>
              </div>
            ))
          ) : (
            <p className="no-shops">Do‘konlar yuklanmoqda...</p>
          )}
        </div>
      </div>

      {/* Navigatsiya */}
      <div className="bottom-nav">
        <button className="nav-item active">
          <FiHome size={20} /> <span>Bosh sahifa</span>
        </button>
        <button className="nav-item" onClick={() => navigate("/marketplace")}>
          <FiCreditCard size={20} /> <span>To‘lovlar</span>
        </button>
        <button className="nav-item" onClick={() => navigate("/history")}>
          <FiClock size={20} /> <span>Tarix</span>
        </button>
        <button className="nav-item" onClick={() => navigate("/profile")}>
          <FiUser size={20} /> <span>Profil</span>
        </button>
      </div>
    </div>
  );
}

export default MainMenu;