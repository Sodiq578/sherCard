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

  /* ==================== ALERT ==================== */
  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  /* ==================== TOKEN HISOBLASH (YANGI LOGIKA) ==================== */
  const calculateTokensReceived = (paidAmount) => {
    if (user?.isPremium) {
      return paidAmount; // Premium → 1 so'm = 1 token
    } else {
      const commissionRate = 0.02; // 2%
      const commission = Math.floor(paidAmount * commissionRate);
      return paidAmount - commission;
    }
  };

  /* ==================== TASHQI TO'LDIRISH (ASOSIY YANGI FUNKSIYA) ==================== */
  const startExternalTopUp = (amount) => {
    if (amount < 1000) {
      showAlertMessage("Minimal to'ldirish summasi: 1 000 UZS", "error");
      return;
    }

    const tokensToAdd = calculateTokensReceived(amount);
    const commission = user?.isPremium ? 0 : amount - tokensToAdd;

    // Demo uchun confirm. Real loyihada bu yerda Payme/Click link ochiladi
    const confirmed = window.confirm(
      `To'lov tasdiqlansinmi?\n\n` +
      `To'lov summasi: ${amount.toLocaleString()} UZS\n` +
      `Balansga qo'shiladi: ${tokensToAdd.toLocaleString()} token\n` +
      `${commission > 0 ? `Komissiya: ${commission.toLocaleString()} UZS (2%)` : "Premium — komissiyasiz!"}`
    );

    if (!confirmed) return;

    // To'lov muvaffaqiyatli deb hisoblaymiz
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
      "success"
    );
  };

  /* ==================== PREMIUM ==================== */
  const handleBuyPremium = () => {
    const price = 10000;
    if (user.balance < price) {
      showAlertMessage(`Premium uchun ${price.toLocaleString()} token yetishmayapti!`, "error");
      return;
    }
    if (user.isPremium) {
      showAlertMessage("Sizda allaqachon Premium mavjud!", "info");
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
    showAlertMessage("Premium muvaffaqiyatli faollashtirildi!", "success");
  };

  const displayName = user?.profile?.name || user?.profile?.username || "Foydalanuvchi";

  return (
    <div className="main-menu-container">

      {/* ALERT */}
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

      {/* WELCOME */}
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

      {/* SEARCH */}
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

      {/* BALANS */}
      <div className="menu-balance-card">
        <div className="menu-balance-top">
          <div className="menu-balance-icon"><FiCreditCard size={32} /></div>
          <div className="menu-balance-amount">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="Logo" className="menu-topup-logo" />
          </div>
        </div>
        <div className="menu-balance-label">Joriy balans (token)</div>
      </div>

      {/* YANGI TO'LDIRISH BO'LIMI */}
      <div className="menu-topup-section">
        <h3  className="menu-topup-title"><FiPlusCircle /> Balansni to'ldirish</h3>
        <div className="menu-topup-modern">
          <div className="menu-topup-presets">
            {[5000, 10000, 20000, 50000, 100000].map((a) => (
              <button
                key={a}
                className="menu-topup-preset-btn"
                onClick={() => startExternalTopUp(a)}
              >
                {a.toLocaleString()} so'm
              </button>
            ))}
            <button
              className="menu-topup-preset-btn menu-topup-custom-btn"
              onClick={() => setShowCustomAmountModal(true)}
            >
              Boshqa summa
            </button>
          </div>

          <div className="menu-topup-info" style={{ marginTop: "16px", textAlign: "center" }}>
            {user?.isPremium ? (
              <p style={{ color: "#FFD700", fontWeight: "bold", fontSize: "15px" }}>
                Premium — 1 so'm = 1 token (komissiyasiz!)
              </p>
            ) : (
              <p style={{ color: "#e74c3c" }}>
                2% komissiya<br />
                <small>Misol: 10 000 so'm → 9 800 token</small>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM AMOUNT MODAL */}
      {showCustomAmountModal && (
        <div className="menu-custom-amount-modal">
          <div className="menu-custom-amount-overlay" onClick={() => setShowCustomAmountModal(false)} />
          <div className="menu-custom-amount-content">
            <div className="menu-custom-amount-header">
              <h3>Boshqa summa</h3>
              <button onClick={() => setShowCustomAmountModal(false)}><FiX size={20} /></button>
            </div>

            <input
              type="number"
              placeholder="1000 UZS dan yuqori"
              value={tempCustomAmount}
              onChange={(e) => setTempCustomAmount(e.target.value)}
              className="menu-custom-amount-input"
            />

            {tempCustomAmount >= 1000 && (
              <div style={{ padding: "14px", background: "#f9f9f9", borderRadius: "10px", margin: "12px 0", fontSize: "14px" }}>
                <div>To'lov summasi: <strong>{parseInt(tempCustomAmount).toLocaleString()} UZS</strong></div>
                <div style={{ marginTop: "8px" }}>
                  Balansga qo'shiladi:{' '}
                  <strong style={{ color: user?.isPremium ? "#FFD700" : "#27ae60", fontSize: "18px" }}>
                    {calculateTokensReceived(parseInt(tempCustomAmount)).toLocaleString()} token
                  </strong>
                </div>
                {!user?.isPremium && (
                  <div style={{ color: "#e74c3c", marginTop: "6px" }}>
                    Komissiya: {(tempCustomAmount - calculateTokensReceived(parseInt(tempCustomAmount))).toLocaleString()} UZS (2%)
                  </div>
                )}
              </div>
            )}

            <button
              className="menu-custom-amount-confirm"
              onClick={() => {
                const amt = parseInt(tempCustomAmount);
                if (amt && amt >= 1000) {
                  setShowCustomAmountModal(false);
                  setTempCustomAmount("");
                  startExternalTopUp(amt);
                } else {
                  showAlertMessage("Kamida 1 000 UZS kiriting", "error");
                }
              }}
            >
              To'lov qilish
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showPremiumModal && (
        <div className="menu-premium-modal">
          <div className="menu-premium-overlay" onClick={() => setShowPremiumModal(false)} />
          <div className="menu-premium-content">
            <h3>Premium obuna</h3>
            <p>Narxi: <strong>10 000 token</strong></p>
            <p style={{ fontSize: "14px", color: "#666", margin: "10px 0" }}>
              Premium bilan komissiyasiz to'ldirish va boshqa imtiyozlar!
            </p>
            <button className="menu-buy-premium-btn" onClick={handleBuyPremium}>
              Sotib olish
            </button>
            <button className="menu-cancel-premium-btn" onClick={() => setShowPremiumModal(false)}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMenu;