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
  FiAward,
  FiTrendingUp,
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
  const [showCardSelectModal, setShowCardSelectModal] = useState(false);
  const [pendingTopUpAmount, setPendingTopUpAmount] = useState(null);

  // === USERS LOADING ===
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

  // === SEARCH USERS ===
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

  // === UNREAD MESSAGES COUNT ===
  useEffect(() => {
    if (!user || !user.messages) {
      setUnreadCount(0);
      return;
    }
    const unread = user.messages.filter((m) => m.to === user.login && !m.read).length;
    setUnreadCount(unread);
  }, [user]);

  // === ALERT MESSAGE ===
  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  // === VIRTUAL CARD NUMBER ===
  const getVirtualCardNumber = () => {
    const key = `virtual_${user.login}`;
    const saved = localStorage.getItem(key);
    if (saved && saved.length === 12) return saved;
    const newNum = generateNormalCardNumber();
    localStorage.setItem(key, newNum);
    return newNum;
  };

  const generateNormalCardNumber = () => {
    let num = "";
    for (let i = 0; i < 12; i++) num += Math.floor(Math.random() * 10);
    return num;
  };

  const virtualCard = {
    id: "virtual",
    number: getVirtualCardNumber(),
    balance: user.balance || 0,
    type: "virtual",
  };

  const allCards = [
    virtualCard,
    ...(user.cards?.filter((c) => !c.deleted) || []),
  ];

  // === OPEN CARD SELECT MODAL ===
  const openCardSelectModal = (amount) => {
    if (amount < 100) {
      showAlertMessage("Minimal to'ldirish summasi: 100 UZS", "error");
      return;
    }
    setPendingTopUpAmount(amount);
    setShowCardSelectModal(true);
  };

  // === TOP UP TO CARD ===
  const handleTopUpToCard = (cardId) => {
    if (!pendingTopUpAmount || pendingTopUpAmount < 100) return;

    const targetCard = allCards.find(c => c.id === cardId);
    if (!targetCard) {
      showAlertMessage("Karta topilmadi!", "error");
      return;
    }

    let updatedUser = { ...user };

    if (cardId === "virtual") {
      if (user.balance < pendingTopUpAmount) {
        showAlertMessage("Balansda yetarli mablag' yo'q!", "error");
        return;
      }
      updatedUser.balance -= pendingTopUpAmount;
      updatedUser.history = [
        ...(user.history || []),
        { time: new Date().toLocaleString("uz-UZ"), action: "Virtual kartaga o'tkazma", amount: `-${pendingTopUpAmount.toLocaleString()} UZS` },
      ];
      showAlertMessage(`${pendingTopUpAmount.toLocaleString()} UZS virtual kartaga o'tkazildi!`, "success");
    } else {
      updatedUser.cards = user.cards.map(c =>
        c.id === cardId ? { ...c, balance: (c.balance || 0) + pendingTopUpAmount } : c
      );
      updatedUser.history = [
        ...(user.history || []),
        { time: new Date().toLocaleString("uz-UZ"), action: `Kartaga to'ldirish (#${targetCard.number.slice(-4)})`, amount: `+${pendingTopUpAmount.toLocaleString()} UZS` },
      ];
      showAlertMessage(`${pendingTopUpAmount.toLocaleString()} UZS kartaga qo'shildi!`, "success");
    }

    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);
    setShowCardSelectModal(false);
    setPendingTopUpAmount(null);
  };

  const handleTopUp = (amount) => openCardSelectModal(amount);

  // === BUY PREMIUM ===
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
        { time: new Date().toLocaleString("uz-UZ"), action: "Premium obuna sotib olindi", amount: `-${premiumPrice.toLocaleString()} UZS` },
      ],
    };
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);
    setShowPremiumModal(false);
    showAlertMessage("Tabriklaymiz! Siz Premium obunaga ega bo'ldingiz!", "success");
  };

  const handleUserClick = (targetUser) => {
    if (!targetUser || !targetUser.login) {
      showAlertMessage("Foydalanuvchi topilmadi!", "error");
      return;
    }
    if (targetUser.login === user?.login) {
      showAlertMessage("O'zingiz bilan chat qila olmaysiz!", "info");
      return;
    }
    setSearchQuery("");
    setFilteredUsers([]);
    navigate(`/chat/${targetUser.login}`);
  };

  const handleViewProfile = (targetUser, e) => {
    e.stopPropagation();
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
    setShowCustomAmountModal(false);
    openCardSelectModal(amount);
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
        <div
          className="menu-avatar-circle"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="menu-avatar-img" />
          ) : (
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Default Avatar" className="menu-avatar-placeholder-img"/>
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
            <FiStar className="menu-premium-icon" /> Premium
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
              <div key={u.login} className="menu-search-user-item" onClick={() => handleUserClick(u)}>
                <div className="menu-search-user-avatar">
                  <img src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={u.profile?.username} />
                  {u.isPremium && <div className="menu-user-premium-indicator"></div>}
                </div>
                <div className="menu-search-user-info">
                  <p className="menu-search-username">@{u.profile?.username || "noma'lum"} {u.isPremium && <span className="menu-premium-dot">Premium</span>}</p>
                  <p className="menu-search-name">{u.profile?.name || "Foydalanuvchi"}</p>
                </div>
                <button className="menu-search-profile-btn" onClick={(e) => handleViewProfile(u, e)} title="Profilni ko'rish">
                  <FiUser size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BALANCE CARD */}
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
            <FiStar size={16} /> Premium foydalanuvchi
          </div>
        )}
      </div>

      {/* TOP-UP SECTION */}
      <div className="menu-topup-section">
        <h3 className="menu-topup-title"><FiPlusCircle /> Balansni to'ldirish</h3>
        <div className="menu-topup-modern">
          <div className="menu-topup-presets">
            {[5000, 10000, 25000].map((amount) => (
              <button key={amount} className="menu-topup-preset-btn" onClick={() => handleTopUp(amount)}>
                +{amount.toLocaleString()}
              </button>
            ))}
            <button className="menu-topup-preset-btn menu-topup-custom-btn" onClick={openCustomAmountModal}>
              Boshqa summa
            </button>
          </div>
          <p className="menu-topup-hint">Minimal to'ldirish: <strong>100 UZS</strong></p>
        </div>
      </div>

      {/* CHAT ENTRY */}
      <div className="menu-chat-entry" onClick={() => navigate("/chat")}>
        <FiMessageCircle size={20} />
        <span>Chat</span>
        {unreadCount > 0 && <span className="menu-unread-badge">{unreadCount}</span>}
      </div>

      {/* PREMIUM SECTION */}
      {user?.isPremium && (
        <div className="menu-premium-section">
          <div className="menu-premium-header">
            <FiStar className="menu-premium-section-icon" />
            <h3>Premium Imkoniyatlar</h3>
          </div>
          <div className="menu-premium-features-grid">
            <div className="menu-premium-feature"><FiShield className="menu-premium-feature-icon" /><span>Reklamasiz</span></div>
            <div className="menu-premium-feature"><FiAward className="menu-premium-feature-icon" /><span>Maxsus profil</span></div>
            <div className="menu-premium-feature"><FiTrendingUp className="menu-premium-feature-icon" /><span>Birinchilik</span></div>
            <div className="menu-premium-feature"><FiDollarSign className="menu-premium-feature-icon" /><span>O'tkazmalarda foizsiz</span></div>
          </div>
        </div>
      )}

      {/* === CARD SELECT MODAL === */}
      {showCardSelectModal && (
        <div className="card-picker-modal">
          <div className="card-picker-backdrop" onClick={() => { setShowCardSelectModal(false); setPendingTopUpAmount(null); }}></div>
          <div className="card-picker-panel">
            <div className="card-picker-title-bar">
              <h3>Kartani tanlang</h3>
              <button className="card-picker-close-btn" onClick={() => { setShowCardSelectModal(false); setPendingTopUpAmount(null); }}><FiX size={20} /></button>
            </div>
            <div className="card-picker-amount-info">
              To'ldirish summasi: <strong>{pendingTopUpAmount?.toLocaleString()} UZS</strong>
            </div>
            <div className="card-picker-items">
              {allCards.map((card) => (
                <div key={card.id} className="card-picker-option" onClick={() => handleTopUpToCard(card.id)}>
                  <div className="card-picker-preview">
                    <div className="card-mini-preview">
                      <div className="card-mini-number">{card.number.replace(/(\d{4})/g, "$1 ").trim()}</div>
                      <div className="card-mini-balance">{card.balance.toLocaleString()} UZS</div>
                    </div>
                    <div className="card-mini-type">{card.type === "gold" ? "Gold" : card.type === "virtual" ? "Virtual" : "Plastik"}</div>
                  </div>
                  <FiPlusCircle size={20} className="card-picker-add-icon" />
                </div>
              ))}
            </div>
            <div className="card-picker-footer-note">
              {pendingTopUpAmount >= 10000 && user?.isPremium ? <span className="premium-badge-text">Premium: o'tkazma bepul!</span> : <span>Virtual kartadan boshqa kartaga o'tkazma — 1% foiz</span>}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM AMOUNT MODAL */}
      {showCustomAmountModal && (
        <div className="menu-custom-amount-modal">
          <div className="menu-custom-amount-overlay" onClick={() => setShowCustomAmountModal(false)}></div>
          <div className="menu-custom-amount-content">
            <div className="menu-custom-amount-header">
              <h3>Boshqa summa kiriting</h3>
              <button className="menu-close-custom-amount" onClick={() => setShowCustomAmountModal(false)}><FiX size={20} /></button>
            </div>
            <input
              type="number"
              placeholder="Summani kiriting..."
              value={tempCustomAmount}
              onChange={(e) => setTempCustomAmount(e.target.value)}
              className="menu-custom-amount-input"
            />
            <button className="menu-custom-amount-confirm" onClick={handleCustomTopUp}>
              Tasdiqlash
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showPremiumModal && (
        <div className="menu-premium-modal">
          <div className="menu-premium-overlay" onClick={() => setShowPremiumModal(false)}></div>
          <div className="menu-premium-content">
            <h3>Premium obuna sotib olish</h3>
            <p>Premium obuna narxi: <strong>10,000 UZS</strong></p>
            <button className="menu-buy-premium-btn" onClick={handleBuyPremium}>
              Sotib olish
            </button>
            <button className="menu-cancel-premium-btn" onClick={() => setShowPremiumModal(false)}>Bekor qilish</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMenu;
