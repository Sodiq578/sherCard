import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCoins,
  FaStar,
  FaUser,
  FaMoon,
  FaSun,
  FaTimes,
  FaCreditCard,
  FaPhone,
  FaHistory,
} from "react-icons/fa";
import "../styles/ChatDetail.css";

function ChatDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [chatUser, setChatUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const user = allUsers.find((u) => u.login === userId);
    setChatUser(user);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const handleSendToken = (amount) => {
    const currentUser = JSON.parse(localStorage.getItem("userData"));
    const finalAmount = amount || parseInt(transferAmount);

    if (!finalAmount || finalAmount < 100) {
      alert("Iltimos, 100 UZS dan kam bo‘lmagan summa kiriting!");
      return;
    }

    if (currentUser.balance < finalAmount) {
      alert("Balansingizda yetarli mablag‘ yo‘q!");
      return;
    }

    // Pul o‘tkazish jarayoni
    const updatedCurrentUser = {
      ...currentUser,
      balance: currentUser.balance - finalAmount,
      history: [
        ...(currentUser.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: `Pul o'tkazildi: @${chatUser.profile?.username}`,
          amount: `-${finalAmount.toLocaleString()} UZS`,
        },
      ],
    };

    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedUsers = allUsers.map((u) => {
      if (u.login === userId) {
        return {
          ...u,
          balance: (u.balance || 0) + finalAmount,
          history: [
            ...(u.history || []),
            {
              time: new Date().toLocaleString("uz-UZ"),
              action: `Pul qabul qilindi: @${currentUser.profile?.username}`,
              amount: `+${finalAmount.toLocaleString()} UZS`,
            },
          ],
        };
      }
      return u;
    });

    localStorage.setItem("userData", JSON.stringify(updatedCurrentUser));
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));

    const transferMsg = {
      type: "info",
      content: `${finalAmount.toLocaleString()} UZS muvaffaqiyatli o'tkazildi`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, transferMsg]);
    setShowCustomAmount(false);
    setTransferAmount("");
  };

  if (!chatUser)
    return (
      <div className="chat-detail-container">
        <p>Foydalanuvchi topilmadi...</p>
      </div>
    );

  return (
    <div className={`chat-detail-container ${theme}`}>
      {/* HEADER */}
      <div className="chat-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>

        <div
          className="chat-user-info"
          onClick={() => setShowUserInfo(true)}
          style={{ cursor: "pointer" }}
        >
          <div className="chat-avatar-container">
            <img
              src={
                chatUser?.profile?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="User"
              className="chat-detail-avatar"
            />
            {chatUser?.isPremium && (
              <div className="chat-premium-indicator">
                <FaStar size={12} />
              </div>
            )}
          </div>
          <div className="chat-user-details">
            <h3 className="chat-user-name">
              {chatUser?.profile?.name || chatUser?.profile?.username}
            </h3>
            <p className="chat-user-status">
              {chatUser?.isPremium ? "⭐ Premium" : "🟢 Online"}
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            className="token-transfer-btn"
            onClick={() => setShowUserInfo(true)}
            title="Pul o'tkazish"
          >
            💸 Pul o‘tkazish
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>

      {/* CHAT HUDUDI */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            <p>{msg.content}</p>
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* FOYDALANUVCHI MA’LUMOTLARI MODALI */}
      {showUserInfo && (
        <div
          className="chat-user-modal-overlay"
          onClick={() => setShowUserInfo(false)}
        >
          <div
            className="chat-user-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-user-modal-header">
              <h3>Pul o'tkazish</h3>
              <button
                className="chat-close-modal-btn"
                onClick={() => setShowUserInfo(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="chat-user-profile-section">
              <img
                src={
                  chatUser.profile?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt=""
                className="chat-user-avatar-large"
              />
              <h4>{chatUser.profile?.name || "Foydalanuvchi"}</h4>
              <p>@{chatUser.profile?.username}</p>
            </div>

            <div className="chat-token-section">
              {!showCustomAmount ? (
                <>
                  <h4>Tayyor summalar:</h4>
                  <div className="chat-token-buttons-grid">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        className="chat-token-btn"
                        onClick={() => handleSendToken(amount)}
                      >
                        {amount.toLocaleString()} UZS
                      </button>
                    ))}
                  </div>
                  <button
                    className="custom-amount-btn"
                    onClick={() => setShowCustomAmount(true)}
                  >
                    Boshqa summa
                  </button>
                </>
              ) : (
                <div className="custom-amount-section">
                  <input
                    type="number"
                    placeholder="Summani kiriting"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="custom-amount-input"
                    min="100"
                  />
                  <div className="custom-amount-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowCustomAmount(false);
                        setTransferAmount("");
                      }}
                    >
                      Bekor qilish
                    </button>
                    <button
                      className="confirm-btn"
                      onClick={() => handleSendToken()}
                    >
                      O‘tkazish
                    </button>
                  </div>
                </div>
              )}
              <div className="transfer-info">
                <FaHistory className="info-icon" />
                <span>O‘tkazmalar tarixini ko‘rish uchun profilga o‘ting</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatDetail;
