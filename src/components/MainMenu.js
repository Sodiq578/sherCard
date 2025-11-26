import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  RiWallet3Line,
  RiChat3Line,
  RiUser3Line,
  RiSearchLine,
  RiSendPlaneLine,
  RiAddCircleLine,
  RiGiftLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiArrowLeftLine,
  RiVipCrownLine,
  RiStarSFill,
} from "react-icons/ri";
import Logo from "../assets/images/logo.png";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  // ==================== STATES ====================
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modallar
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Token yuborish
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [sendTokenSearch, setSendTokenSearch] = useState("");
  const [filteredSendUsers, setFilteredSendUsers] = useState([]);

  // To'ldirish
  const [tempCustomAmount, setTempCustomAmount] = useState("");

  // Universal Alert
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
    title: "",
    action: null,
    actionText: "",
  });

  // ==================== KARTA LOGIKASI (ENG MUHIM!) ====================
  const getUserCards = () => {
    if (!user?.cards || user.cards.length === 0) {
      return [{
        number: "8989 8989 8989",
        holder: user?.profile?.name || "Foydalanuvchi"
      }];
    }

    return user.cards.map(card => {
      if (typeof card === "string") {
        return { number: card, holder: user?.profile?.name || "Foydalanuvchi" };
      }
      return {
        number: card.number || card.cardNumber || "**** **** **** ****",
        holder: card.holder || user?.profile?.name || "Foydalanuvchi"
      };
    });
  };

  const userCards = getUserCards();
  const [selectedCard, setSelectedCard] = useState(userCards[0]);

  // ==================== ALERT FUNKSIYALARI ====================
  const showAlert = (message, type = "success", title = "", action = null, actionText = "OK") => {
    setAlert({
      show: true,
      message,
      type,
      title: title || (type === "success" ? "Muvaffaqiyatli" : type === "error" ? "Xatolik" : "Diqqat"),
      action,
      actionText
    });
  };

  const closeAlert = () => setAlert({ ...alert, show: false });
  const handleAlertAction = () => {
    if (alert.action) alert.action();
    closeAlert();
  };

  // ==================== FOYDALANUVCHILAR YUKLASH ====================
  useEffect(() => {
    const loadUsers = () => {
      try {
        const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
        setAllUsers(users);
      } catch (err) {
        console.error("allUsers yuklashda xato:", err);
      }
    };
    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  // ==================== O'QILMAGAN XABARLAR ====================
  useEffect(() => {
    const unread = user?.messages?.filter(m => m.to === user.login && !m.read).length || 0;
    setUnreadCount(unread);
  }, [user]);

  // ==================== QIDIRUV (Token yuborish) ====================
  useEffect(() => {
    if (!sendTokenSearch.trim()) {
      setFilteredSendUsers([]);
      return;
    }
    const query = sendTokenSearch.toLowerCase();
    const filtered = allUsers.filter(u => {
      if (!u.profile || u.login === user.login) return false;
      const username = (u.profile.username || "").toLowerCase();
      const name = (u.profile.name || "").toLowerCase();
      return username.includes(query) || name.includes(query);
    });
    setFilteredSendUsers(filtered);
  }, [sendTokenSearch, allUsers, user.login]);

  // ==================== TOKEN HISOBLASH ====================
  const calculateTokens = (uzs) => user?.isPremium ? uzs : Math.floor(uzs * 0.98);

  // ==================== TOKEN YUBORISH ====================
  const handleSendTokens = () => {
    const amount = parseInt(tokenAmount);
    if (!selectedUser) return showAlert("Foydalanuvchi tanlanmadi!", "error");
    if (!amount || amount < 100) return showAlert("Minimal 100 token!", "error");
    if (amount > user.balance) return showAlert("Balans yetarli emas!", "error");

    const confirmSend = () => {
      try {
        const sender = {
          ...user,
          balance: user.balance - amount,
          history: [...(user.history || []), {
            time: new Date().toLocaleString("uz-UZ"),
            action: `Token yuborildi → @${selectedUser.profile.username}`,
            amount: `-${amount.toLocaleString()} token`,
            details: `Karta: ${selectedCard.number}`
          }]
        };

        const updatedAllUsers = allUsers.map(u =>
          u.login === selectedUser.login
            ? {
                ...u,
                balance: (u.balance || 0) + amount,
                history: [...(u.history || []), {
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `Token qabul qilindi ← @${user.profile.username}`,
                  amount: `+${amount.toLocaleString()} token`,
                  details: `Karta: ${selectedCard.number}`
                }],
                messages: [...(u.messages || []), {
                  id: Date.now() + Math.random(),
                  from: user.login,
                  to: u.login,
                  text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                  time: new Date().toLocaleString("uz-UZ"),
                  type: "token",
                  amount,
                  read: false,
                  card: selectedCard.number
                }]
              }
            : u
        );

        localStorage.setItem("userData", JSON.stringify(sender));
        localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));
        updateUser(sender);
        setAllUsers(updatedAllUsers);

        showAlert(`@${selectedUser.profile.username} ga ${amount.toLocaleString()} token yuborildi!`, "success");
        setShowSendTokens(false);
        setSelectedUser(null);
        setTokenAmount("");
        setSendTokenSearch("");
      } catch (err) {
        showAlert("Xatolik yuz berdi!", "error");
      }
    };

    showAlert(
      `@${selectedUser.profile.username} ga ${amount.toLocaleString()} token yuborilsinmi?\n\nQoladi: ${(user.balance - amount).toLocaleString()} token`,
      "info",
      "Tasdiqlash",
      confirmSend,
      "Yuborish"
    );
  };

  // ==================== PREMIUM SOTIB OLISH ====================
  const handleBuyPremium = () => {
    if (user.isPremium) return showAlert("Sizda allaqachon Premium bor!", "info");
    if (user.balance < 10000) return showAlert("10 000 token yetarli emas!", "error");

    const confirm = () => {
      const updated = {
        ...user,
        balance: user.balance - 10000,
        isPremium: true,
        premiumSince: new Date().toISOString(),
        history: [...(user.history || []), {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Premium obuna sotib olindi",
          amount: "-10 000 token"
        }]
      };
      localStorage.setItem("userData", JSON.stringify(updated));
      updateUser(updated);
      setShowPremiumModal(false);
      showAlert("Tabriklaymiz! Premium faollashtirildi!", "success");
    };

    showAlert("10 000 token evaziga Premium sotib olasizmi?", "info", "Tasdiqlash", confirm, "Sotib olish");
  };

  // ==================== BALANS TO'LDIRISH ====================
  const startTopUp = (amount) => {
    if (amount < 1000) return showAlert("Minimal 1 000 UZS", "error");
    const tokens = calculateTokens(amount);
    const commission = user.isPremium ? 0 : amount - tokens;

    const confirm = () => {
      const updated = {
        ...user,
        balance: user.balance + tokens,
        history: [...(user.history || []), {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Balans to'ldirildi",
          amount: `+${tokens.toLocaleString()} token`,
          details: `${amount.toLocaleString()} UZS${commission > 0 ? ` (komissiya: ${commission} UZS)` : ""}`
        }]
      };
      localStorage.setItem("userData", JSON.stringify(updated));
      updateUser(updated);
      showAlert(`+${tokens.toLocaleString()} token qo'shildi!`, "success");
      setShowCustomAmountModal(false);
      setTempCustomAmount("");
    };

    showAlert(
      `To'lov: ${amount.toLocaleString()} UZS\nQo'shiladi: ${tokens.toLocaleString()} token${commission > 0 ? `\nKomissiya: ${commission} UZS (2%)` : ""}`,
      "info",
      "To'lovni tasdiqlash",
      confirm,
      "To'lash"
    );
  };

  // ==================== NAVIGATION ====================
  const handleNavigation = (path) => {
    navigate(path);
  };

  // ==================== MA'LUMOTLAR ====================
  const displayName = user?.profile?.name || user?.profile?.username || "Foydalanuvchi";
  const username = user?.profile?.username || "username";

  return (
    <div className="main-menu-container">

      {/* UNIVERSAL ALERT */}
      {alert.show && (
        <div className="menu-alert-modal-overlay" onClick={closeAlert}>
          <div className={`menu-alert-modal menu-alert-${alert.type}`} onClick={e => e.stopPropagation()}>
            <div className="menu-alert-header">
              {alert.type === "success" && <RiCheckLine className="menu-alert-header-icon" />}
              {alert.type === "error" && <RiErrorWarningLine className="menu-alert-header-icon" />}
              {alert.type === "info" && <RiInformationLine className="menu-alert-header-icon" />}
              <h3>{alert.title}</h3>
            </div>
            <div className="menu-alert-body">
              <p style={{ whiteSpace: "pre-line" }}>{alert.message}</p>
            </div>
            <div className="menu-alert-footer">
              {alert.action && (
                <button className="menu-alert-action-btn" onClick={handleAlertAction}>
                  {alert.actionText}
                </button>
              )}
              <button className="menu-alert-close-btn" onClick={closeAlert}>
                {alert.action ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN YUBORISH MODAL */}
      {showSendTokens && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-send-tokens-modal">
            <div className="menu-modal-header">
              <div className="menu-send-tokens-title">
                <button className="menu-back-btn" onClick={() => selectedUser ? setSelectedUser(null) : setShowSendTokens(false)}>
                  <RiArrowLeftLine />
                </button>
                <h3>{selectedUser ? "Token yuborish" : "Kimga yuborasiz?"}</h3>
              </div>
              <button className="menu-modal-close-btn" onClick={() => setShowSendTokens(false)}>
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {!selectedUser ? (
                <>
                  <div className="menu-search-bar">
                    <RiSearchLine className="menu-search-icon" />
                    <input
                      type="text"
                      placeholder="Username yoki ism kiriting..."
                      value={sendTokenSearch}
                      onChange={(e) => setSendTokenSearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {filteredSendUsers.length > 0 ? (
                    filteredSendUsers.map(u => (
                      <div key={u.login} className="menu-search-user-item" onClick={() => setSelectedUser(u)}>
                        <div className="menu-search-user-avatar">
                          <img src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
                          {u.isPremium && <div className="menu-user-premium-indicator" />}
                        </div>
                        <div className="menu-search-user-info">
                          <p className="menu-search-username">
                            @{u.profile?.username} {u.isPremium && <span className="menu-premium-dot">Premium</span>}
                          </p>
                          <p className="menu-search-name">{u.profile?.name || "Foydalanuvchi"}</p>
                        </div>
                      </div>
                    ))
                  ) : sendTokenSearch && <div className="menu-no-results">Hech narsa topilmadi</div>}
                </>
              ) : (
                <>
                  <div className="menu-selected-user">
                    <div className="menu-selected-user-avatar">
                      <img src={selectedUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
                      {selectedUser.isPremium && <div className="menu-user-premium-indicator" />}
                    </div>
                    <h4>@{selectedUser.profile?.username}</h4>
                    <p>{selectedUser.profile?.name || "Foydalanuvchi"}</p>
                  </div>

                  <div className="menu-card-selection">
                    <label>Karta tanlang</label>
                    <div className="menu-card-options">
                      {userCards.map((card, i) => (
                        <div
                          key={i}
                          className={`menu-card-option ${selectedCard.number === card.number ? "selected" : ""}`}
                          onClick={() => setSelectedCard(card)}
                        >
                          <div className="menu-card-number">{card.number}</div>
                          <div className="menu-card-holder">{card.holder}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="menu-token-input-section">
                    <label>Token miqdori</label>
                    <div className="menu-token-input-wrapper">
                      <input
                        type="number"
                        placeholder="100"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        min="100"
                      />
                      <span className="menu-token-symbol">
                        <img src={Logo} alt="token" className="ultra-token-sm" />
                      </span>
                    </div>
                    <div className="menu-balance-info">
                      Joriy balans: <strong>{user.balance.toLocaleString()} token</strong>
                    </div>
                    {tokenAmount >= 100 && (
                      <div className="menu-amount-preview">
                        <div>Yuboriladi: <strong>{parseInt(tokenAmount).toLocaleString()} token</strong></div>
                        <div>Qoladi: <strong>{(user.balance - parseInt(tokenAmount)).toLocaleString()} token</strong></div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {selectedUser && (
              <div className="menu-modal-footer">
                <button
                  className="menu-primary-btn"
                  onClick={handleSendTokens}
                  disabled={!tokenAmount || parseInt(tokenAmount) < 100 || parseInt(tokenAmount) > user.balance}
                >
                  Yuborish ({tokenAmount || 0} token)
                </button>
                <button className="menu-secondary-btn" onClick={() => setSelectedUser(null)}>Ortga</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="ultra-header">
        <div className="ultra-avatar" onClick={() => navigate("/profile")}>
          <img src={user?.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
        </div>
        <div className="ultra-username">@{username}</div>
        {user?.isPremium && <div className="ultra-premium-badge"><RiVipCrownLine /></div>}
      </div>

      {/* BALANS KARTASI */}
      <div className="ultra-card-wrapper">
        <div className="ultra-card">
          <div className="ultra-card-username">@{username}</div>
          <div className="ultra-card-balance">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="token" className="ultra-token-lg" />
          </div>
          <div className="ultra-card-number">{selectedCard.number}</div>
        </div>
      </div>

      {/* TEZ AMALLAR */}
      <div className="ultra-actions">
        <button className="ultra-action" onClick={() => setShowSendTokens(true)}>
          <div className="ultra-icon"><RiSendPlaneLine size={32} /></div>
          <span>Ball yuborish</span>
        </button>
        <button className="ultra-action" onClick={() => setShowCustomAmountModal(true)}>
          <div className="ultra-icon blue"><RiAddCircleLine size={32} /></div>
          <span>To'ldirish</span>
        </button>
        <button className="ultra-action" onClick={() => setShowPremiumModal(true)}>
          <div className="ultra-icon pink"><RiGiftLine size={32} /></div>
          <span>Premium</span>
        </button>
      </div>

      {/* BALANS TO'LDIRISH MODAL */}
      {showCustomAmountModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content">
            <div className="menu-modal-header">
              <h3>Balans to'ldirish</h3>
              <button className="menu-modal-close-btn" onClick={() => setShowCustomAmountModal(false)}>
                <RiCloseLine />
              </button>
            </div>
            <div className="menu-modal-body">
              <input
                type="number"
                placeholder="1000 UZS dan yuqori"
                value={tempCustomAmount}
                onChange={(e) => setTempCustomAmount(e.target.value)}
                className="menu-custom-amount-input"
                autoFocus
              />
              {tempCustomAmount >= 1000 && (
                <div className="menu-amount-preview">
                  <div>To'lov: <strong>{parseInt(tempCustomAmount).toLocaleString()} UZS</strong></div>
                  <div>Qo'shiladi: <strong style={{ color: user.isPremium ? "#FFD700" : "#27ae60" }}>
                    {calculateTokens(parseInt(tempCustomAmount)).toLocaleString()} token
                  </strong></div>
                  {!user.isPremium && <div className="menu-amount-commission">Komissiya: 2%</div>}
                </div>
              )}
            </div>
            <div className="menu-modal-footer">
              <button
                className="menu-primary-btn"
                onClick={() => startTopUp(parseInt(tempCustomAmount))}
                disabled={tempCustomAmount < 1000}
              >
                To'lash
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
                <RiStarSFill className="menu-premium-star-icon" />
                <h3>Premium Obuna</h3>
              </div>
              <button className="menu-modal-close-btn" onClick={() => setShowPremiumModal(false)}>
                <RiCloseLine />
              </button>
            </div>
            <div className="menu-modal-body">
              <div className="menu-premium-price-section">
                <div className="menu-premium-price">10 000 token</div>
                <div>Joriy balans: {(user?.balance || 0).toLocaleString()} token</div>
              </div>
              <button
                className={`menu-primary-btn ${user.balance < 10000 ? "menu-btn-disabled" : ""}`}
                onClick={handleBuyPremium}
                disabled={user.balance < 10000 || user.isPremium}
              >
                {user.isPremium ? "Premium faol" : "Sotib olish"}
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
}

export default MainMenu;