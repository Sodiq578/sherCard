import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiVipCrownLine,
  RiCoinsLine,
  RiUser3Line,
  RiSendPlaneLine,
  RiCloseLine,
  RiHistoryLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine
} from "react-icons/ri";
import "../styles/ChatDetail.css";

function ChatDetail({ currentUser, updateUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showTokenTransfer, setShowTokenTransfer] = useState(false);
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("8989 8989 8989");
  
  // Alert modal states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertAction, setAlertAction] = useState(null);
  const [alertActionText, setAlertActionText] = useState("");

  const messagesEndRef = useRef(null);

  const presetAmounts = [100, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const user = allUsers.find((u) => u.login === userId);
    setChatUser(user);

    // Load chat messages
    if (currentUser && user) {
      const userMessages = currentUser.messages?.filter(
        msg => msg.from === user.login || msg.to === user.login
      ) || [];
      const otherUserMessages = user.messages?.filter(
        msg => msg.from === currentUser.login || msg.to === currentUser.login
      ) || [];
      
      const allMessages = [...userMessages, ...otherUserMessages]
        .sort((a, b) => new Date(a.time) - new Date(b.time));
      
      setMessages(allMessages);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      from: currentUser.login,
      to: chatUser.login,
      text: newMessage,
      time: new Date().toLocaleString("uz-UZ"),
      type: "text",
      read: false
    };

    // Update current user messages
    const updatedCurrentUser = {
      ...currentUser,
      messages: [...(currentUser.messages || []), message]
    };

    // Update other user messages
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedUsers = allUsers.map(u => {
      if (u.login === chatUser.login) {
        return {
          ...u,
          messages: [...(u.messages || []), message]
        };
      }
      return u;
    });

    localStorage.setItem("userData", JSON.stringify(updatedCurrentUser));
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    updateUser(updatedCurrentUser);

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleTokenTransfer = (amount) => {
    const finalAmount = amount || parseInt(tokenAmount);

    if (!finalAmount || finalAmount < 100) {
      showAlertMessage("Iltimos, 100 tokendan kam bo'lmagan summa kiriting!", "error", "Xatolik");
      return;
    }

    if (currentUser.balance < finalAmount) {
      showAlertMessage("Balansingizda yetarli token yo'q!", "error", "Xatolik");
      return;
    }

    const confirmTransfer = () => {
      try {
        // Update current user
        const updatedCurrentUser = {
          ...currentUser,
          balance: currentUser.balance - finalAmount,
          history: [
            ...(currentUser.history || []),
            {
              time: new Date().toLocaleString("uz-UZ"),
              action: `${chatUser.profile?.username} ga token yuborildi`,
              amount: `-${finalAmount.toLocaleString()} token`,
              details: `@${chatUser.profile?.username} | Karta: ${selectedCard}`,
              card: selectedCard
            }
          ],
          messages: [
            ...(currentUser.messages || []),
            {
              id: Date.now(),
              from: currentUser.login,
              to: chatUser.login,
              text: `Sizga ${finalAmount.toLocaleString()} token yuborildi!`,
              time: new Date().toLocaleString("uz-UZ"),
              type: "token",
              amount: finalAmount,
              read: false,
              card: selectedCard
            }
          ]
        };

        // Update other user
        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const updatedUsers = allUsers.map(u => {
          if (u.login === chatUser.login) {
            return {
              ...u,
              balance: (u.balance || 0) + finalAmount,
              history: [
                ...(u.history || []),
                {
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `${currentUser.profile?.username} dan token qabul qilindi`,
                  amount: `+${finalAmount.toLocaleString()} token`,
                  details: `@${currentUser.profile?.username} | Karta: ${selectedCard}`,
                  card: selectedCard
                }
              ],
              messages: [
                ...(u.messages || []),
                {
                  id: Date.now(),
                  from: currentUser.login,
                  to: u.login,
                  text: `Sizga ${finalAmount.toLocaleString()} token yuborildi!`,
                  time: new Date().toLocaleString("uz-UZ"),
                  type: "token",
                  amount: finalAmount,
                  read: false,
                  card: selectedCard
                }
              ]
            };
          }
          return u;
        });

        localStorage.setItem("userData", JSON.stringify(updatedCurrentUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        updateUser(updatedCurrentUser);

        const transferMsg = {
          id: Date.now(),
          from: currentUser.login,
          to: chatUser.login,
          text: `💰 ${finalAmount.toLocaleString()} token yuborildi`,
          time: new Date().toLocaleString("uz-UZ"),
          type: "token",
          amount: finalAmount,
          read: false
        };

        setMessages(prev => [...prev, transferMsg]);
        setShowTokenTransfer(false);
        setTokenAmount("");
        setSelectedCard("8989 8989 8989");

        showAlertMessage(
          `@${chatUser.profile?.username} ga ${finalAmount.toLocaleString()} token muvaffaqiyatli yuborildi!`,
          "success",
          "Muvaffaqiyatli"
        );
      } catch (error) {
        console.error("Token yuborishda xatolik:", error);
        showAlertMessage("Token yuborishda xatolik yuz berdi!", "error", "Xatolik");
      }
    };

    showAlertMessage(
      `@${chatUser.profile?.username} ga ${finalAmount.toLocaleString()} token yuborishni tasdiqlaysizmi?\n\nKarta: ${selectedCard}\nJoriy balans: ${currentUser.balance.toLocaleString()} token\nYuborilgandan keyin: ${(currentUser.balance - finalAmount).toLocaleString()} token`,
      "info",
      "Token yuborish",
      confirmTransfer,
      "Tasdiqlash"
    );
  };

  const userCards = currentUser?.cards?.length > 0 ? currentUser.cards : ["8989 8989 8989"];

  if (!chatUser) {
    return (
      <div className="chat-detail-container">
        <div className="chat-loading">Foydalanuvchi yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="chat-detail-container">
      {/* ALERT MODAL */}
      {showAlert && (
        <div className="chat-alert-modal-overlay">
          <div className={`chat-alert-modal chat-alert-${alertType}`}>
            <div className="chat-alert-header">
              {alertType === "success" && <RiCheckLine className="chat-alert-header-icon" />}
              {alertType === "error" && <RiErrorWarningLine className="chat-alert-header-icon" />}
              {alertType === "info" && <RiInformationLine className="chat-alert-header-icon" />}
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

      {/* HEADER */}
      <div className="chat-detail-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          <RiArrowLeftLine size={24} />
        </button>
        <div className="chat-user-info" onClick={() => navigate(`/user-profile/${chatUser.login}`)} style={{cursor: 'pointer'}}>
          <div className="chat-avatar-container">
            <img
              src={chatUser?.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="User"
              className="chat-detail-avatar"
            />
            {chatUser?.isPremium && (
              <div className="chat-premium-indicator">
                <RiVipCrownLine size={12} />
              </div>
            )}
          </div>
          <div className="chat-user-details">
            <h3 className="chat-user-name">{chatUser?.profile?.name || "Foydalanuvchi"}</h3>
            <p className="chat-user-status">{chatUser?.isPremium ? "⭐ Premium" : "🟢 Online"}</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="token-transfer-btn" onClick={() => setShowTokenTransfer(true)} title="Token yuborish">
            <RiSendPlaneLine size={18} />
            Token Yuborish
          </button>
          <button className="profile-btn" onClick={() => navigate(`/user-profile/${chatUser.login}`)} title="Profil">
            <RiUser3Line size={18} />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.from === currentUser.login ? 'sent' : 'received'} ${msg.type}`}>
            {msg.type === 'token' ? (
              <div className="token-message">
                <RiCoinsLine className="token-icon" />
                <div className="token-content">
                  <p className="token-text">{msg.text}</p>
                  <span className="token-amount">+{msg.amount?.toLocaleString()} token</span>
                </div>
              </div>
            ) : (
              <p>{msg.text}</p>
            )}
            <span className="message-time">{new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* MESSAGE INPUT */}
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Xabar yozing..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="chat-input"
        />
        <button className="send-btn" onClick={handleSendMessage} disabled={!newMessage.trim()}>Yuborish</button>
      </div>

      {/* TOKEN TRANSFER MODAL */}
      {showTokenTransfer && (
        <div className="chat-modal-overlay" onClick={() => setShowTokenTransfer(false)}>
          <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>Token yuborish</h3>
              <button className="chat-modal-close-btn" onClick={() => setShowTokenTransfer(false)}>
                <RiCloseLine size={20} />
              </button>
            </div>

            <div className="chat-user-profile-section">
              <img src={chatUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="" className="chat-user-avatar-large"/>
              <h4>{chatUser.profile?.name || "Foydalanuvchi"}</h4>
              <p>@{chatUser.profile?.username}</p>
            </div>

            <div className="chat-card-selection">
              <label>Yuborish kartasini tanlang</label>
              <div className="chat-card-options">
                {userCards.map((card, index) => (
                  <div key={index} className={`chat-card-option ${selectedCard === card ? 'selected' : ''}`} onClick={() => setSelectedCard(card)}>
                    <div className="chat-card-number">{card}</div>
                    <div className="chat-card-holder">{currentUser.profile?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-token-section">
              <h4>Tayyor summalar:</h4>
              <div className="chat-token-buttons-grid">
                {presetAmounts.map(amount => (
                  <button key={amount} className="chat-token-btn" onClick={() => handleTokenTransfer(amount)}>{amount.toLocaleString()} token</button>
                ))}
              </div>

              <div className="custom-amount-section">
                <input type="number" placeholder="Boshqa summa kiriting" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} className="custom-amount-input" min="100"/>
                <button className="custom-send-btn" onClick={() => handleTokenTransfer()} disabled={!tokenAmount || tokenAmount < 100}>Yuborish</button>
              </div>

              <div className="transfer-info">
                <RiHistoryLine className="info-icon"/>
                <span>O'tkazmalar tarixini ko'rish uchun profilga o'ting</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatDetail;
