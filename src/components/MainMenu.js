import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  FiHome,
  FiCreditCard,
  FiClock,
  FiUser,
  FiPlusCircle,
  FiMessageCircle,
  FiSearch,
  FiStar,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiShield,
  FiAward,
  FiTrendingUp,
  FiInfo,
  FiDollarSign
} from "react-icons/fi";
import Logo from "../assets/images/logo.png";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [tempCustomAmount, setTempCustomAmount] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  useEffect(() => {
    const loadUsers = () => {
      try {
        const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
        setAllUsers(users);
      } catch (err) {
        console.error("allUsers yuklanmadi:", err);
        setAllUsers([]);
      }
    };
    loadUsers();
    const interval = setInterval(loadUsers, 2000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const filtered = allUsers.filter((u) => {
      if (!u || !u.profile) return false;
      const username = u.profile.username || "";
      const name = u.profile.name || "";
      return (
        username.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query)
      );
    });
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers]);

  useEffect(() => {
    if (!user || !user.messages) {
      setUnreadCount(0);
      return;
    }
    const unread = user.messages.filter((m) => m.to === user.login && !m.read).length;
    setUnreadCount(unread);
  }, [user]);

  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleTopUp = (amount) => {
    if (!user || amount <= 0) return;
    
    if (amount < 100) {
      showAlertMessage("Minimal to'ldirish summasi: 100 UZS", "error");
      return;
    }

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + amount,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Balans to'ldirildi",
          amount: `+${amount.toLocaleString()} UZS`,
        },
      ],
    };
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);
    showAlertMessage(`${amount.toLocaleString()} UZS muvaffaqiyatli qo'shildi!`, "success");
    setShowCustomAmountModal(false);
  };

  const handleBuyPremium = () => {
    if (!user) return;
    const premiumPrice = 10000;
    
    if (user.balance < premiumPrice) {
      showAlertMessage(`Premium sotib olish uchun balansingizda kamida ${premiumPrice.toLocaleString()} UZS bo'lishi kerak!`, "error");
      return;
    }
    
    if (user.isPremium) {
      showAlertMessage("Sizda allaqachon Premium obuna aktiv!", "info");
      return;
    }

    const updatedUser = {
      ...user,
      balance: user.balance - premiumPrice,
      isPremium: true,
      premiumSince: new Date().toISOString(),
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Premium obuna sotib olindi",
          amount: `-${premiumPrice.toLocaleString()} UZS`,
        },
      ],
    };
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);
    setShowPremiumModal(false);
    showAlertMessage("Tabriklaymiz! Siz Premium obunaga ega bo'ldingiz! 🎉", "success");
  };

  // Foydalanuvchini chatga o'tkazish
  const handleUserClick = (targetUser) => {
    if (!targetUser || !targetUser.login) {
      showAlertMessage("Foydalanuvchi topilmadi!", "error");
      return;
    }
    
    // O'zim bilan chat qilishni oldini olish
    if (targetUser.login === user?.login) {
      showAlertMessage("O'zingiz bilan chat qila olmaysiz!", "info");
      return;
    }
    
    console.log("Chatga o'tilmoqda:", targetUser.login);
    setSearchQuery("");
    setFilteredUsers([]);
    
    // ChatDetail sahifasiga o'tish
    navigate(`/chat/${targetUser.login}`);
  };

  // Foydalanuvchi profiliga o'tish
  const handleViewProfile = (targetUser, e) => {
    e.stopPropagation(); // Chatga o'tishni oldini olish
    if (!targetUser || !targetUser.login) {
      showAlertMessage("Foydalanuvchi topilmadi!", "error");
      return;
    }
    
    setSearchQuery("");
    setFilteredUsers([]);
    navigate(`/profile/${targetUser.login}`);
  };

  const openCustomAmountModal = () => {
    setTempCustomAmount("");
    setShowCustomAmountModal(true);
  };

  const handleCustomTopUp = () => {
    const amount = parseInt(tempCustomAmount);
    if (!amount || amount < 100) {
      showAlertMessage("Iltimos, 100 UZS dan kam bo'lmagan summa kiriting", "error");
      return;
    }
    handleTopUp(amount);
  };

  const displayName = user?.profile?.name || user?.profile?.username || "Foydalanuvchi";

  return (
    <div className="main-menu-container">
      {/* Alert Modal */}
      {showAlert && (
        <div className={`menu-alert-modal menu-alert-${alertType}`}>
          <div className="menu-alert-content">
            {alertType === "success" && <FiCheck className="menu-alert-icon" />}
            {alertType === "error" && <FiAlertCircle className="menu-alert-icon" />}
            {alertType === "info" && <FiInfo className="menu-alert-icon" />}
            <span className="menu-alert-message">{alertMessage}</span>
          </div>
        </div>
      )}

      {/* === SALOMLASHUV === */}
      <div className="menu-welcome-section">
        <div 
          className="menu-avatar-circle"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="menu-avatar-img" />
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Default Avatar"
              className="menu-avatar-placeholder-img"
            />
          )}
          {user?.isPremium && (
            <div className="menu-premium-badge">
              <FiStar size={14} />
            </div>
          )}
        </div>

        <div className="menu-welcome-texts">
          <span className="menu-welcome-text">Salom,</span>
          <span className="menu-username">
            <span className="menu-username-text">{displayName}</span>
            {user?.isPremium && <span className="menu-premium-tag">PREMIUM</span>}
          </span>
        </div>

        {!user?.isPremium && (
          <button 
            className="menu-premium-button"
            onClick={() => setShowPremiumModal(true)}
          >
            <FiStar className="menu-premium-icon" />
            Premium
          </button>
        )}
      </div>

      {/* === QIDIRUV === */}
      <div className="menu-search-section">
        <div className="menu-search-bar">
          <FiSearch className="menu-search-icon" />
          <input
            type="text"
            placeholder="Username yoki ism bo'yicha qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
        </div>

        {filteredUsers.length > 0 && (
          <div className="menu-search-results">
            {filteredUsers.map((u) => (
              <div
                key={u.login}
                className="menu-search-user-item"
                onClick={() => handleUserClick(u)}
              >
                <div className="menu-search-user-avatar">
                  <img
                    src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt={u.profile?.username}
                  />
                  {u.isPremium && <div className="menu-user-premium-indicator"></div>}
                </div>
                <div className="menu-search-user-info">
                  <p className="menu-search-username">
                    @{u.profile?.username || "noma'lum"}
                    {u.isPremium && <span className="menu-premium-dot">Premium</span>}
                  </p>
                  <p className="menu-search-name">{u.profile?.name || "Foydalanuvchi"}</p>
                </div>
                <button
                  className="menu-search-profile-btn"
                  onClick={(e) => handleViewProfile(u, e)}
                  title="Profilni ko'rish"
                >
                  <FiUser size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === BALANS KARTASI === */}
      <div className="menu-balance-card">
        <div className="menu-balance-top">
          <div className="menu-balance-icon">
            <FiCreditCard size={32} />
          </div>
          <div className="menu-balance-amount">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="Logo" className="menu-topup-logo" />
          </div>
        </div>
        <div className="menu-balance-label">Joriy balans</div>
        {user?.isPremium && (
          <div className="menu-premium-balance-badge">
            <FiStar size={16} />
            Premium foydalanuvchi
          </div>
        )}
      </div>

      {/* === BALANS TO'LDIRISH === */}
      <div className="menu-topup-section">
        <h3 className="menu-topup-title">
          <FiPlusCircle /> Balansni to'ldirish
        </h3>

        <div className="menu-topup-modern">
          <div className="menu-topup-presets">
            {[5000, 10000, 25000].map((amount) => (
              <button
                key={amount}
                className="menu-topup-preset-btn"
                onClick={() => handleTopUp(amount)}
              >
                +{amount.toLocaleString()}
              </button>
            ))}
            <button
              className="menu-topup-preset-btn menu-topup-custom-btn"
              onClick={openCustomAmountModal}
            >
              Boshqa summa
            </button>
          </div>

          <p className="menu-topup-hint">
            Minimal to'ldirish: <strong>100 UZS</strong>
          </p>
        </div>
      </div>

      {/* === CHAT KIRISH === */}
      <div className="menu-chat-entry" onClick={() => navigate("/chat")}>
        <FiMessageCircle size={20} />
        <span>Chat</span>
        {unreadCount > 0 && <span className="menu-unread-badge">{unreadCount}</span>}
      </div>

      {/* === PREMIUM BO'LIMI === */}
      {user?.isPremium && (
        <div className="menu-premium-section">
          <div className="menu-premium-header">
            <FiStar className="menu-premium-section-icon" />
            <h3>Premium Imkoniyatlar</h3>
          </div>
          <div className="menu-premium-features-grid">
            <div className="menu-premium-feature">
              <FiShield className="menu-premium-feature-icon" />
              <span>Reklamasiz</span>
            </div>
            <div className="menu-premium-feature">
              <FiAward className="menu-premium-feature-icon" />
              <span>Maxsus profil</span>
            </div>
            <div className="menu-premium-feature">
              <FiTrendingUp className="menu-premium-feature-icon" />
              <span>Birinchilik</span>
            </div>
            <div className="menu-premium-feature">
              <FiDollarSign className="menu-premium-feature-icon" />
              <span>O'tkazmalarda foizsiz</span>
            </div>
          </div>
        </div>
      )}

      {/* === PASTKI NAVIGATSIYA === */}
      <div className="menu-bottom-nav">
        <button className="menu-nav-item menu-nav-item-active">
          <FiHome size={20} /> <span>Bosh sahifa</span>
        </button>
        <button className="menu-nav-item" onClick={() => navigate("/marketplace")}>
          <FiCreditCard size={20} /> <span>To'lovlar</span>
        </button>
        <button className="menu-nav-item" onClick={() => navigate("/history")}>
          <FiClock size={20} /> <span>Tarix</span>
        </button>
        <button className="menu-nav-item" onClick={() => navigate("/profile")}>
          <FiUser size={20} /> <span>Profil</span>
        </button>
      </div>

      {/* === BOSHQA SUMMA MODAL === */}
      {showCustomAmountModal && (
        <div className="menu-custom-amount-modal">
          <div className="menu-custom-amount-overlay" onClick={() => setShowCustomAmountModal(false)}></div>
          <div className="menu-custom-amount-content">
            <div className="menu-custom-amount-header">
              <h3>Boshqa summa kiriting</h3>
              <button 
                className="menu-close-custom-amount"
                onClick={() => setShowCustomAmountModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="menu-custom-amount-input-group">
              <input
                type="number"
                placeholder="Summani kiriting (UZS)"
                value={tempCustomAmount}
                onChange={(e) => setTempCustomAmount(e.target.value)}
                className="menu-custom-amount-input"
                min="100"
              />
              <div className="menu-custom-amount-presets">
                {[5000, 10000, 20000, 50000].map((amount) => (
                  <button
                    key={amount}
                    className="menu-custom-amount-preset"
                    onClick={() => setTempCustomAmount(amount.toString())}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCustomTopUp}
              className="menu-custom-amount-submit"
              disabled={!tempCustomAmount || parseInt(tempCustomAmount) < 100}
            >
              <FiPlusCircle size={18} />
              {tempCustomAmount ? `${parseInt(tempCustomAmount).toLocaleString()} UZS to'ldirish` : "Summa kiriting"}
            </button>

            <p className="menu-custom-amount-hint">
              Minimal to'ldirish: 100 UZS
            </p>
          </div>
        </div>
      )}

      {/* === PREMIUM MODAL === */}
      {showPremiumModal && (
        <div className="menu-premium-modal">
          <div className="menu-premium-modal-overlay" onClick={() => setShowPremiumModal(false)}></div>
          <div className="menu-premium-modal-content">
            <div className="menu-premium-modal-header">
              <FiStar className="menu-premium-star-icon" />
              <h2>Premium Obuna</h2>
              <button 
                className="menu-close-premium-modal"
                onClick={() => setShowPremiumModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="menu-premium-features-list">
              <h3 className="menu-premium-title">Premium afzalliklar:</h3>
              <div className="menu-premium-feature-item">
                <FiCheck className="menu-premium-feature-check" />
                <span>Maxsus profil ko'rinishi va badge</span>
              </div>
              <div className="menu-premium-feature-item">
                <FiCheck className="menu-premium-feature-check" />
                <span>O'tkazmalarda foizsiz</span>
              </div>
              <div className="menu-premium-feature-item">
                <FiCheck className="menu-premium-feature-check" />
                <span>Boshqa foydalanuvchilardan ajralib turish</span>
              </div>
              <div className="menu-premium-feature-item">
                <FiCheck className="menu-premium-feature-check" />
                <span>Qidiruv natijalarida birinchi o'rinda ko'rinish</span>
              </div>
            </div>

            <div className="menu-premium-price-section">
              <div className="menu-premium-price">
                Narxi: <strong>10,000 UZS</strong>
              </div>
              <div className="menu-premium-balance-info">
                Joriy balans: <strong>{(user?.balance || 0).toLocaleString()} UZS</strong>
              </div>
            </div>

            <button 
              className={`menu-buy-premium-btn ${(!user || user.balance < 10000) ? 'menu-buy-premium-disabled' : ''}`}
              onClick={handleBuyPremium}
              disabled={!user || user.balance < 10000}
            >
              {user?.balance >= 10000 ? (
                <>
                  <FiStar /> Premium sotib olish - 10,000 UZS
                </>
              ) : (
                "Balans yetarli emas"
              )}
            </button>

            {user?.balance < 10000 && (
              <div className="menu-insufficient-balance">
                Premium sotib olish uchun balansingizni to'ldiring
              </div>
            )}

            <div className="menu-premium-note">
              Premium obuna 1 yil muddatga amal qiladi
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMenu;