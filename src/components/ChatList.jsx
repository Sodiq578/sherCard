import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiArrowLeft, 
  FiUser, 
  FiStar, 
  FiSend,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo
} from "react-icons/fi";
import "../styles/ChatList.css";

function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  
  // Token yuborish states
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("");

  // Alert modal states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertAction, setAlertAction] = useState(null);
  const [alertActionText, setAlertActionText] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    
    setCurrentUser(userData);

    // Karta raqamlarini o'rnatish
    if (userData?.cards?.length > 0) {
      const firstCard = typeof userData.cards[0] === 'string' 
        ? userData.cards[0] 
        : userData.cards[0]?.number || "8989 8989 8989";
      setSelectedCard(firstCard);
    } else {
      setSelectedCard("8989 8989 8989");
    }

    // Barcha foydalanuvchilarni olish (o'zini olmaslik)
    const userList = allUsers
      .filter((u) => u.login !== userData.login && u.profile?.username)
      .map((u) => {
        const messages = (userData.messages || []).filter(
          (m) =>
            (m.from === userData.login && m.to === u.login) ||
            (m.from === u.login && m.to === userData.login)
        );
        
        const lastMsg = messages[messages.length - 1];
        const unread = messages.filter(
          (m) => m.to === userData.login && !m.read
        ).length;

        return {
          user: u,
          lastMessage: lastMsg?.text || "Hali xabar yo'q",
          time: lastMsg?.time || "",
          unread,
          messageCount: messages.length
        };
      });

    userList.sort((a, b) => b.messageCount - a.messageCount);
    setChats(userList);
  }, []);

  // Alert funksiyalari
  const showAlertMessage = (message, type = "success", title = "", action = null, actionText = "") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertTitle(title);
    setAlertAction(() => action);
    setAlertActionText(actionText);
    setShowAlert(true);
  };

  const handleAlertAction = () => {
    if (alertAction) alertAction();
    setShowAlert(false);
  };

  const closeAlert = () => setShowAlert(false);

  // Karta raqamlari
  const userCards = React.useMemo(() => {
    if (!currentUser?.cards) return ["8989 8989 8989"];
    
    if (Array.isArray(currentUser.cards)) {
      return currentUser.cards.map(card => {
        if (typeof card === 'string') return card;
        if (card && card.number) return card.number;
        return "8989 8989 8989";
      });
    }
    
    return ["8989 8989 8989"];
  }, [currentUser?.cards]);

  const filteredChats = chats.filter(
    (c) =>
      c.user.profile?.username
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      c.user.profile?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendTokens = (user, e) => {
    if (e) e.stopPropagation(); // tugmani bosganda tarqalmasligi uchun
    setSelectedUser(user);
    setShowSendTokens(true);
  };

  const handleTokenTransfer = () => {
    if (!selectedUser) {
      showAlertMessage("Foydalanuvchi topilmadi!", "error", "Xatolik");
      return;
    }

    const amount = parseInt(tokenAmount);
    if (!amount || amount <= 0 || isNaN(amount)) {
      showAlertMessage("To'g'ri miqdor kiriting!", "error", "Xatolik");
      return;
    }

    if (amount > currentUser.balance) {
      showAlertMessage("Balansingizda yetarli token mavjud emas!", "error", "Xatolik");
      return;
    }

    if (amount < 100) {
      showAlertMessage("Minimal yuborish miqdori: 100 token", "error", "Xatolik");
      return;
    }

    const confirmSend = () => {
      try {
        const updatedCurrentUser = {
          ...currentUser,
          balance: currentUser.balance - amount,
          history: [
            ...(currentUser.history || []),
            {
              time: new Date().toLocaleString("uz-UZ"),
              action: `${selectedUser.profile.username} ga token yuborildi`,
              amount: `-${amount.toLocaleString()} token`,
              details: `@${selectedUser.profile.username} | Karta: ${selectedCard}`,
              card: selectedCard
            }
          ]
        };

        const allUsersData = JSON.parse(localStorage.getItem("allUsers") || "[]");
        let receiverUpdated = false;
        
        const updatedAllUsers = allUsersData.map(u => {
          if (u.login === selectedUser.login) {
            receiverUpdated = true;
            return {
              ...u,
              balance: (u.balance || 0) + amount,
              history: [
                ...(u.history || []),
                {
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `${currentUser.profile.username} dan token qabul qilindi`,
                  amount: `+${amount.toLocaleString()} token`,
                  details: `@${currentUser.profile.username} | Karta: ${selectedCard}`,
                  card: selectedCard
                }
              ],
              messages: [
                ...(u.messages || []),
                {
                  id: Date.now(),
                  from: currentUser.login,
                  to: u.login,
                  text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                  time: new Date().toLocaleString("uz-UZ"),
                  type: "token",
                  amount: amount,
                  read: false,
                  card: selectedCard
                }
              ]
            };
          }
          return u;
        });

        if (!receiverUpdated) {
          const newReceiver = {
            ...selectedUser,
            balance: (selectedUser.balance || 0) + amount,
            history: [
              ...(selectedUser.history || []),
              {
                time: new Date().toLocaleString("uz-UZ"),
                action: `${currentUser.profile.username} dan token qabul qilindi`,
                amount: `+${amount.toLocaleString()} token`,
                details: `@${currentUser.profile.username} | Karta: ${selectedCard}`,
                card: selectedCard
              }
            ],
            messages: [
              ...(selectedUser.messages || []),
              {
                id: Date.now(),
                from: currentUser.login,
                to: selectedUser.login,
                text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                time: new Date().toLocaleString("uz-UZ"),
                type: "token",
                amount: amount,
                read: false,
                card: selectedCard
              }
            ]
          };
          updatedAllUsers.push(newReceiver);
        }

        localStorage.setItem("userData", JSON.stringify(updatedCurrentUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

        setCurrentUser(updatedCurrentUser);

        showAlertMessage(
          `@${selectedUser.profile.username} ga ${amount.toLocaleString()} token muvaffaqiyatli yuborildi!\nKarta: ${selectedCard}`,
          "success",
          "Muvaffaqiyatli"
        );

        setShowSendTokens(false);
        setTokenAmount("");
        setSelectedUser(null);
      } catch (error) {
        console.error("Token yuborishda xatolik:", error);
        showAlertMessage("Token yuborishda xatolik yuz berdi!", "error", "Xatolik");
      }
    };

    showAlertMessage(
      `@${selectedUser.profile.username} ga ${amount.toLocaleString()} token yuborishni tasdiqlaysizmi?\n\nKarta: ${selectedCard}\nJoriy balans: ${currentUser.balance.toLocaleString()} token\nYuborilgandan keyin: ${(currentUser.balance - amount).toLocaleString()} token`,
      "info",
      "Token yuborish",
      confirmSend,
      "Tasdiqlash"
    );
  };

  return (
    <div className="chat-list-container">
      {/* ALERT MODAL */}
      {showAlert && (
        <div className="chat-alert-modal-overlay">
          <div className={`chat-alert-modal chat-alert-${alertType}`}>
            <div className="chat-alert-header">
              {alertType === "success" && <FiCheck className="chat-alert-header-icon" />}
              {alertType === "error" && <FiAlertCircle className="chat-alert-header-icon" />}
              {alertType === "info" && <FiInfo className="chat-alert-header-icon" />}
              <h3 className="chat-alert-title">
                {alertTitle || (alertType === "success" ? "Muvaffaqiyatli" : alertType === "error" ? "Xatolik" : "Ma'lumot")}
              </h3>
            </div>
            <div className="chat-alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="chat-alert-footer">
              {alertAction && (
                <button className="chat-alert-action-btn" onClick={handleAlertAction}>
                  {alertActionText || "Tasdiqlash"}
                </button>
              )}
              <button className="chat-alert-close-btn" onClick={closeAlert}>
                {alertAction ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN YUBORISH MODAL */}
      {showSendTokens && selectedUser && (
        <div className="chat-modal-overlay">
          <div className="chat-modal-content chat-send-tokens-modal">
            <div className="chat-modal-header">
              <h3>Token yuborish</h3>
              <button className="chat-modal-close-btn" onClick={() => setShowSendTokens(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="chat-modal-body">
              <div className="chat-selected-user">
                <div className="chat-selected-user-avatar">
                  <img src={selectedUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="" />
                  {selectedUser.isPremium && <div className="chat-user-premium-indicator"></div>}
                </div>
                <div className="chat-selected-user-info">
                  <h4>@{selectedUser.profile?.username}</h4>
                  <p>{selectedUser.profile?.name || "Foydalanuvchi"}</p>
                </div>
              </div>

              {/* Karta tanlash */}
              <div className="chat-card-selection">
                <label>Yuborish kartasini tanlang</label>
                <div className="chat-card-options">
                  {userCards.map((card, index) => (
                    <div
                      key={index}
                      className={`chat-card-option ${selectedCard === card ? 'selected' : ''}`}
                      onClick={() => setSelectedCard(card)}
                    >
                      <div className="chat-card-number">{card}</div>
                      <div className="chat-card-holder">{currentUser?.profile?.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chat-token-input-section">
                <label>Yuboriladigan token miqdori</label>
                <div className="chat-token-input-wrapper">
                  <input
                    type="number"
                    placeholder="100"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="chat-token-input"
                    min="100"
                    max={currentUser?.balance || 0}
                  />
                  <span className="chat-token-symbol">token</span>
                </div>
                <div className="chat-balance-info">
                  Joriy balans: <strong>{(currentUser?.balance || 0).toLocaleString()} token</strong>
                </div>
                
                {tokenAmount >= 100 && (
                  <div className="chat-amount-preview">
                    <div className="chat-amount-row">
                      <span>Yuboriladi:</span>
                      <strong>{parseInt(tokenAmount || 0).toLocaleString()} token</strong>
                    </div>
                    <div className="chat-amount-row">
                      <span>Qoladi:</span>
                      <strong>{((currentUser?.balance || 0) - parseInt(tokenAmount || 0)).toLocaleString()} token</strong>
                    </div>
                    <div className="chat-amount-row">
                      <span>Karta:</span>
                      <strong>{selectedCard}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="chat-modal-footer">
              <button
                className="chat-primary-btn"
                onClick={handleTokenTransfer}
                disabled={!tokenAmount || tokenAmount < 100 || tokenAmount > (currentUser?.balance || 0)}
              >
                Yuborish ({tokenAmount || 0} token)
              </button>
              <button 
                className="chat-secondary-btn" 
                onClick={() => setShowSendTokens(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft />
        </button>
        <h2>Barcha Foydalanuvchilar</h2>
      </div>

      <div className="chat-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="@username yoki ism bo'yicha qidiruv..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-count">
        Jami: {filteredChats.length} ta foydalanuvchi
      </div>

      <div className="chat-items">
        {filteredChats.length === 0 ? (
          <div className="no-users-found">
            <FiUser size={48} className="no-users-icon" />
            <p>Hech qanday foydalanuvchi topilmadi</p>
            <span>Boshqa kalit so'zlar bilan qidiring</span>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.user.login}
              className="chat-item"
              onClick={() => handleSendTokens(chat.user)}
            >
              <div className="chat-avatar-container">
                <img
                  src={
                    chat.user.profile?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt={chat.user.profile?.username}
                  className="chat-avatar"
                />
                {chat.user.isPremium && (
                  <div className="chat-premium-badge">
                    <FiStar size={12} />
                  </div>
                )}
              </div>

              <div className="chat-info">
                <div className="chat-user-header">
                  <div className="username-section">
                    <p className="chat-username">
                      @{chat.user.profile?.username}
                    </p>
                    {chat.user.isPremium && (
                      <span className="premium-indicator">Premium</span>
                    )}
                  </div>
                  {chat.time && (
                    <span className="chat-time">
                      {new Date(chat.time).toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                
                <p className="chat-lastmsg">
                  {chat.lastMessage}
                </p>
                
                <div className="chat-meta">
                  <span className="message-count">
                    {chat.messageCount} xabar
                  </span>
                  {chat.unread > 0 && (
                    <span className="chat-unread-indicator">
                      {chat.unread} yangi
                    </span>
                  )}
                </div>
              </div>

              <div className="chat-actions">
                <button 
                  className="send-message-btn"
                  onClick={(e) => handleSendTokens(chat.user, e)}
                  title="Token yuborish"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
