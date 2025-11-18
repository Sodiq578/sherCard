import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  FiCreditCard,
  FiUser,
  FiPlusCircle,
  FiSearch,
  FiStar,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiXCircle,
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

  // YANGI CHIROYLI ALERT MODAL
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "success", // success, error, info, warning
    confirmButton: false,
    onConfirm: null,
  });

  const showAlert = (message, type = "success", title = "", confirmButton = false, onConfirm = null) => {
    setAlert({
      show: true,
      title: title || (type === "success" ? "Muvaffaqiyat!" : type === "error" ? "Xatolik!" : "Eslatma"),
      message,
      type,
      confirmButton,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });
    setTimeout(() => {
      setAlert({
        show: false,
        title: "",
        message: "",
        type: "success",
        confirmButton: false,
        onConfirm: null,
      });
    }, 300);
  };

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

  /* ==================== TOKEN HISOBLASH ==================== */
  const calculateTokensReceived = (paidAmount) => {
    if (user?.isPremium) {
      return paidAmount;
    } else {
      const commissionRate = 0.02;
      const commission = Math.floor(paidAmount * commissionRate);
      return paidAmount - commission;
    }
  };

  /* ==================== TASHQI TO'LDIRISH ==================== */
  const startExternalTopUp = (amount) => {
    if (amount < 1000) {
      showAlert("Minimal to'ldirish summasi: 1 000 UZS", "error");
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

    showAlert(`Tabriklaymiz! +${tokensToAdd.toLocaleString()} token balansingizga qo'shildi!`, "success");
  };

  /* ==================== PREMIUM ==================== */
  const handleBuyPremium = () => {
    const price = 10000;
    if (user.balance < price) {
      showAlert(`Premium uchun ${price.toLocaleString()} token yetishmayapti!`, "error");
      return;
    }
    if (user.isPremium) {
      showAlert("Sizda allaqachon Premium mavjud!", "info");
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
    showAlert("Premium muvaffaqiyatli faollashtirildi!", "success", "Tabriklaymiz!");
  };

  const displayName = user?.profile?.name || user?.profile?.username || "Foydalanuvchi";

  return (
    <div className="main-menu-container">

      {/* YANGI CHIROYLI ALERT MODAL */}
      {alert.show && (
        <div className="beautiful-alert-backdrop" onClick={closeAlert}>
          <div className={`beautiful-alert-modal beautiful-alert-${alert.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="beautiful-alert-icon">
              {alert.type === "success" && <FiCheck size={42} />}
              {alert.type === "error" && <FiXCircle size={42} />}
              {alert.type === "info" && <FiInfo size={42} />}
              {alert.type === "warning" && <FiAlertCircle size={42} />}
            </div>
            <h3 className="beautiful-alert-title">{alert.title}</h3>
            <p className="beautiful-alert-message">{alert.message}</p>
            <div className="beautiful-alert-buttons">
              {alert.confirmButton ? (
                <>
                  <button className="beautiful-alert-btn beautiful-alert-btn-cancel" onClick={closeAlert}>
                    Bekor qilish
                  </button>
                  <button
                    className="beautiful-alert-btn beautiful-alert-btn-confirm"
                    onClick={() => {
                      alert.onConfirm?.();
                      closeAlert();
                    }}
                  >
                    Tasdiqlash
                  </button>
                </>
              ) : (
                <button className="beautiful-alert-btn beautiful-alert-btn-ok" onClick={closeAlert}>
                  OK
                </button>
              )}
            </div>
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

      {/* TO'LDIRISH BO'LIMI */}
      <div className="menu-topup-section">
        <h3 className="menu-topup-title"><FiPlusCircle /> Balansni to'ldirish</h3>
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

          <div className="menu-topup-info">
            {user?.isPremium ? (
              <p className="premium-hint">
                Premium — 1 so'm = 1 token (komissiyasiz!)
              </p>
            ) : (
              <p className="normal-hint">
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
              <div className="custom-preview-box">
                <div>To'lov summasi: <strong>{parseInt(tempCustomAmount).toLocaleString()} UZS</strong></div>
                <div className="token-receive">
                  Balansga qo'shiladi:{' '}
                  <strong className={user?.isPremium ? "premium-token" : "normal-token"}>
                    {calculateTokensReceived(parseInt(tempCustomAmount)).toLocaleString()} token
                  </strong>
                </div>
                {!user?.isPremium && (
                  <div className="commission-text">
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
                  showAlert("Kamida 1 000 UZS kiriting", "error");
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
            <button className="menu-close-premium-modal" onClick={() => setShowPremiumModal(false)}>
              <FiX size={18} />
            </button>
            <h3><FiStar /> Premium obuna</h3>
            <p className="premium-price">Narxi: <strong>10 000 token</strong></p>
            <div className="premium-benefits">
              <div className="benefit"><FiCheck /> Komissiyasiz to'ldirish</div>
              <div className="benefit"><FiCheck /> Eksklyuziv badge</div>
              <div className="benefit"><FiCheck /> Tezroq javoblar</div>
              <div className="benefit"><FiCheck /> Cheksiz xabarlar</div>
            </div>
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