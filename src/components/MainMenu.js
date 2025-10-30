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

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  const handleTopUp = (amount) => {
    const updatedUser = {
      ...user,
      balance: user.balance + amount,
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

  const displayName = user.profile?.name || user.login || "Foydalanuvchi";

  return (
    <div className="menu-container">
      {/* Salomlashuv */}
      <div className="welcome-section">
        <div className="avatar-circle">
          {user.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
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
            {user.balance?.toLocaleString() || 0}{" "}
            <img src={Logo} alt="Logo" className="balance-logo" />
          </div>
        </div>
        <div className="balance-label">Joriy balans</div>
      </div>

      {/* Balansni to‘ldirish */}
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
          {[
            {
              name: "Evos",
              logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Evos_logo.png",
            },
            {
              name: "Bellissimo",
              logo: "https://bellissimo.uz/images/logo_new.svg",
            },
            {
              name: "KFC",
              logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/KFC_logo.svg",
            },
            {
              name: "McDonald's",
              logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/McDonald%27s_logo.svg",
            },
            {
              name: "Korzinka",
              logo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Korzinka_logo.svg",
            },
            {
              name: "Chopar Pizza",
              logo: "https://static.tildacdn.com/tild3864-3935-4665-b837-343230396133/choparlogo.svg",
            },
            {
              name: "FeedUp",
              logo: "https://feedup.uz/_nuxt/img/logo.2e4ff10.svg",
            },
            {
              name: "Lavash House",
              logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Lavash_House_logo.png",
            },
          ].map((shop, i) => (
            <div key={i} className="shop-card">
              <img src={shop.logo} alt={shop.name} />
              <p>{shop.name}</p>
            </div>
          ))}
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
