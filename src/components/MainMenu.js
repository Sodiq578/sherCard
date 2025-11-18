import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  FiCreditCard,
  FiUser,
  FiPlusCircle,
  FiMessageCircle,
  FiSearch,
  FiStar,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiZap,
  FiAward,
  FiTrendingUp
} from "react-icons/fi";
import Logo from "../assets/images/logo.png";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  // States
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
  const [alertTitle, setAlertTitle] = useState("");

  /* ==================== USERS ==================== */
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

  /* ==================== SEARCH ==================== */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const filtered = allUsers.filter((u) => {
      if (!u?.profile) return false;
      const username = u.profile.username || "";
      const name = u.profile.name || "";
      return username.toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers]);

  /* ==================== UNREAD ==================== */
  useEffect(() => {
    if (!user?.messages) {
      setUnreadCount(0);
      return;
    }
    const unread = user.messages.filter((m) => m.to === user.login && !m.read).length;
    setUnreadCount(unread);
  }, [user]);

  /* ==================== BEAUTIFUL ALERT ==================== */
  const showAlertMessage = (message, type = "success", title = "") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertTitle(title);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  /* ==================== TOKEN CALCULATION ==================== */
  const calculateTokensReceived = (paidAmount) => {
    if (user?.isPremium) {
      return paidAmount;
    } else {
      const commissionRate = 0.02;
      const commission = Math.floor(paidAmount * commissionRate);
      return paidAmount - commission;
    }
  };

  /* ==================== EXTERNAL TOP UP ==================== */
  const startExternalTopUp = (amount) => {
    if (amount < 1000) {
      showAlertMessage("Minimal to'ldirish summasi: 1 000 UZS", "error", "Xatolik");
      return;
    }

    const tokensToAdd = calculateTokensReceived(amount);
    const commission = user?.isPremium ? 0 : amount - tokensToAdd;

    const confirmed = window.confirm(
      `To'lov tasdiqlansinmi?\n\n` +
      `To'lov summasi: ${amount.toLocaleString()} UZS\n` +
      `Balansga qo'shiladi: ${tokensToAdd.toLocaleString()} token\n` +
      `${commission > 0 ? `Komissiya: ${commission.toLocaleString()} UZS (2%)` : "Premium — komissiyasiz!"}`
    );

    if (!confirmed) return;

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + tokensToAdd,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Balans to'ldirildi",
          amount: `+${tokensToAdd.toLocaleString()} token`,
          details: `${amount.toLocaleString()} UZS to'lov${commission > 0 ? ` (komissiya: ${commission.toLocaleString()} UZS)` : ""}`,
        },
      ],
    };

    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);

    showAlertMessage(
      `Tabriklaymiz! +${tokensToAdd.toLocaleString()} token balansingizga qo'shildi!`,
      "success",
      "Muvaffaqiyatli"
    );
  };

  /* ==================== PREMIUM ==================== */
  const handleBuyPremium = () => {
    const price = 10000;
    if (user.balance < price) {
      showAlertMessage(`Premium uchun ${price.toLocaleString()} token yetishmayapti!`, "error", "Xatolik");
      return;
    }
    if (user.isPremium) {
      showAlertMessage("Sizda allaqachon Premium mavjud!", "info", "Ma'lumot");
      return;
    }

    const updated = {
      ...user,
      balance: user.balance - price,
      isPremium: true,
      premiumSince: new Date().toISOString(),
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Premium obuna sotib olindi",
          amount: `-${price.toLocaleString()} token`,
        },
      ],
    };

    localStorage.setItem("userData", JSON.stringify(updated));
    updateUser(updated);
    setShowPremiumModal(false);
    showAlertMessage("Premium muvaffaqiyatli faollashtirildi!", "success", "Tabriklaymiz");
  };

  const displayName = user?.profile?.name || user?.profile?.username || "Foydalanuvchi";

  return (
    <div className="main-menu-container">

      {/* BEAUTIFUL ALERT MODAL */}
      {showAlert && (
        <div className="menu-alert-modal-overlay">
          <div className={`menu-alert-modal menu-alert-${alertType}`}>
            <div className="menu-alert-header">
              {alertType === "success" && <FiCheck className="menu-alert-header-icon" />}
              {alertType === "error" && <FiAlertCircle className="menu-alert-header-icon" />}
              {alertType === "info" && <FiInfo className="menu-alert-header-icon" />}
              <h3 className="menu-alert-title">{alertTitle || (alertType === "success" ? "Muvaffaqiyatli" : alertType === "error" ? "Xatolik" : "Ma'lumot")}</h3>
            </div>
            <div className="menu-alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="menu-alert-footer">
              <button 
                className="menu-alert-close-btn"
                onClick={() => setShowAlert(false)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WELCOME SECTION */}
      <div className="menu-welcome-section">
        <div className="menu-avatar-circle" onClick={() => navigate("/profile")}>
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="menu-avatar-img" />
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Default"
              className="menu-avatar-placeholder-img"
            />
          )}
          {user?.isPremium && <div className="menu-premium-badge"><FiStar size={14} /></div>}
        </div>
        <div className="menu-welcome-texts">
          <span className="menu-welcome-text">Salom,</span>
          <span className="menu-username">
            <span className="menu-username-text">{displayName}</span>
            {user?.isPremium && <span className="menu-premium-tag">PREMIUM</span>}
          </span>
        </div>
        {!user?.isPremium && (
          <button className="menu-premium-button" onClick={() => setShowPremiumModal(true)}>
            <FiStar /> Premium
          </button>
        )}
      </div>

      {/* SEARCH SECTION */}
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
                onClick={() => {
                  setSearchQuery("");
                  setFilteredUsers([]);
                  navigate(`/chat/${u.login}`);
                }}
              >
                <div className="menu-search-user-avatar">
                  <img src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="" />
                  {u.isPremium && <div className="menu-user-premium-indicator"></div>}
                </div>
                <div className="menu-search-user-info">
                  <p className="menu-search-username">
                    @{u.profile?.username} {u.isPremium && <span className="menu-premium-dot">Premium</span>}
                  </p>
                  <p className="menu-search-name">{u.profile?.name || "Foydalanuvchi"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BALANCE CARD */}
      <div className="menu-balance-card">
        <div className="menu-balance-top">
          <div className="menu-balance-icon"><FiCreditCard size={32} /></div>
          <div className="menu-balance-amount">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="Logo" className="menu-topup-logo" />
          </div>
        </div>
        <div className="menu-balance-label">Joriy balans (token)</div>
        {user?.isPremium && (
          <div className="menu-premium-balance-badge">
            <FiStar size={14} />
            Premium foydalanuvchi
          </div>
        )}
      </div>

      {/* TOP UP SECTION */}
      <div className="menu-topup-section">
        <h3 className="menu-topup-title"><FiPlusCircle /> Balansni to'ldirish</h3>
        <div className="menu-topup-modern">
          <div className="menu-topup-presets">
            {[5000, 10000, 20000, 50000, 100000].map((amount) => (
              <button
                key={amount}
                className="menu-topup-preset-btn"
                onClick={() => startExternalTopUp(amount)}
              >
                {amount.toLocaleString()} so'm
              </button>
            ))}
            <button
              className="menu-topup-preset-btn menu-topup-custom-btn"
              onClick={() => setShowCustomAmountModal(true)}
            >
              Boshqa summa
            </button>
          </div>

          <div className="menu-topup-info">
            {user?.isPremium ? (
              <div className="menu-premium-info">
                <FiStar className="menu-premium-info-icon" />
                <span>Premium — 1 so'm = 1 token (komissiyasiz!)</span>
              </div>
            ) : (
              <div className="menu-regular-info">
                <span className="menu-commission-warning">2% komissiya</span>
                <small>Misol: 10 000 so'm → 9 800 token</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHAT ENTRY */}
      <div className="menu-chat-entry" onClick={() => navigate("/chats")}>
        <div className="menu-chat-icon">
          <FiMessageCircle size={24} />
        </div>
        <div className="menu-chat-text">
          <span className="menu-chat-title">Xabarlar</span>
          <span className="menu-chat-subtitle">Barcha suhbatlaringiz</span>
        </div>
        {unreadCount > 0 && (
          <div className="menu-unread-badge">
            {unreadCount}
          </div>
        )}
      </div>

      {/* PREMIUM FEATURES SECTION */}
      {!user?.isPremium && (
        <div className="menu-premium-section">
          <div className="menu-premium-header">
            <FiStar className="menu-premium-section-icon" />
            <h3>Premium Afzalliklar</h3>
          </div>
          <div className="menu-premium-features-grid">
            <div className="menu-premium-feature">
              <FiZap className="menu-premium-feature-icon" />
              <span>Komissiyasiz to'ldirish</span>
            </div>
            <div className="menu-premium-feature">
              <FiShield className="menu-premium-feature-icon" />
              <span>Maxsus badge</span>
            </div>
            <div className="menu-premium-feature">
              <FiAward className="menu-premium-feature-icon" />
              <span>Premium status</span>
            </div>
            <div className="menu-premium-feature">
              <FiTrendingUp className="menu-premium-feature-icon" />
              <span>Yuqori limitlar</span>
            </div>
          </div>
          <button 
            className="menu-premium-section-btn"
            onClick={() => setShowPremiumModal(true)}
          >
            Premium sotib olish
          </button>
        </div>
      )}

      {/* CUSTOM AMOUNT MODAL */}
      {showCustomAmountModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-custom-amount-modal">
            <div className="menu-modal-header">
              <h3>Balansni to'ldirish</h3>
              <button 
                className="menu-modal-close-btn"
                onClick={() => setShowCustomAmountModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="menu-modal-body">
              <input
                type="number"
                placeholder="1000 UZS dan yuqori summa kiriting"
                value={tempCustomAmount}
                onChange={(e) => setTempCustomAmount(e.target.value)}
                className="menu-custom-amount-input"
                min="1000"
              />

              {tempCustomAmount >= 1000 && (
                <div className="menu-amount-preview">
                  <div className="menu-amount-row">
                    <span>To'lov summasi:</span>
                    <strong>{parseInt(tempCustomAmount).toLocaleString()} UZS</strong>
                  </div>
                  <div className="menu-amount-row menu-amount-tokens">
                    <span>Balansga qo'shiladi:</span>
                    <strong style={{ color: user?.isPremium ? "#FFD700" : "#27ae60" }}>
                      {calculateTokensReceived(parseInt(tempCustomAmount)).toLocaleString()} token
                    </strong>
                  </div>
                  {!user?.isPremium && (
                    <div className="menu-amount-row menu-amount-commission">
                      <span>Komissiya:</span>
                      <span>{(tempCustomAmount - calculateTokensReceived(parseInt(tempCustomAmount))).toLocaleString()} UZS (2%)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="menu-modal-footer">
              <button
                className="menu-primary-btn"
                onClick={() => {
                  const amount = parseInt(tempCustomAmount);
                  if (amount && amount >= 1000) {
                    setShowCustomAmountModal(false);
                    setTempCustomAmount("");
                    startExternalTopUp(amount);
                  } else {
                    showAlertMessage("Kamida 1 000 UZS kiriting", "error", "Xatolik");
                  }
                }}
                disabled={!tempCustomAmount || tempCustomAmount < 1000}
              >
                To'lov qilish
              </button>
              <button
                className="menu-secondary-btn"
                onClick={() => setShowCustomAmountModal(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showPremiumModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-premium-modal">
            <div className="menu-modal-header">
              <div className="menu-premium-modal-title">
                <FiStar className="menu-premium-star-icon" />
                <h3>Premium Obuna</h3>
              </div>
              <button 
                className="menu-modal-close-btn"
                onClick={() => setShowPremiumModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="menu-modal-body">
              <div className="menu-premium-features-list">
                <div className="menu-premium-feature-item">
                  <FiCheck className="menu-premium-feature-check" />
                  <span>Komissiyasiz balans to'ldirish</span>
                </div>
                <div className="menu-premium-feature-item">
                  <FiCheck className="menu-premium-feature-check" />
                  <span>Maxsus Premium badge va status</span>
                </div>
                <div className="menu-premium-feature-item">
                  <FiCheck className="menu-premium-feature-check" />
                  <span>Yuqori transfer limitlari</span>
                </div>
                <div className="menu-premium-feature-item">
                  <FiCheck className="menu-premium-feature-check" />
                  <span>Eksklyuziv funksiyalar</span>
                </div>
                <div className="menu-premium-feature-item">
                  <FiCheck className="menu-premium-feature-check" />
                  <span>Birinchilardan xabardor bo'lish</span>
                </div>
              </div>

              <div className="menu-premium-price-section">
                <div className="menu-premium-price">10 000 token</div>
                <div className="menu-premium-balance-info">
                  Joriy balans: {(user?.balance || 0).toLocaleString()} token
                </div>
              </div>

              {user?.balance < 10000 && (
                <div className="menu-insufficient-balance">
                  Yetarli token mavjud emas! Balansingizni to'ldiring.
                </div>
              )}
            </div>

            <div className="menu-modal-footer">
              <button
                className={`menu-primary-btn ${user?.balance < 10000 ? 'menu-btn-disabled' : ''}`}
                onClick={handleBuyPremium}
                disabled={user?.balance < 10000 || user?.isPremium}
              >
                {user?.isPremium ? 'Sizda Premium mavjud' : 'Premium sotib olish'}
              </button>
              <button
                className="menu-secondary-btn"
                onClick={() => setShowPremiumModal(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="menu-bottom-nav">
        <button className="menu-nav-item menu-nav-item-active">
          <FiCreditCard size={20} />
          <span>Asosiy</span>
        </button>
        <button className="menu-nav-item" onClick={() => navigate("/chats")}>
          <FiMessageCircle size={20} />
          <span>Xabarlar</span>
          {unreadCount > 0 && <div className="menu-nav-badge">{unreadCount}</div>}
        </button>
        <button className="menu-nav-item" onClick={() => navigate("/profile")}>
          <FiUser size={20} />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
}

export default MainMenu;