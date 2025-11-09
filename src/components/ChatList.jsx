import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiArrowLeft, FiUser, FiStar, FiSend } from "react-icons/fi";
import "../styles/ChatList.css";

function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    
    setCurrentUser(userData);

    // Barcha foydalanuvchilarni olish (o'zini olmaslik)
    const userList = allUsers
      .filter((u) => u.login !== userData.login && u.profile?.username)
      .map((u) => {
        // Xabarlarni olish
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

    // Xabarlari ko'p bo'lgan foydalanuvchilar birinchi bo'lib chiqadi
    userList.sort((a, b) => b.messageCount - a.messageCount);
    setChats(userList);
  }, []);

  const filteredChats = chats.filter(
    (c) =>
      c.user.profile?.username
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      c.user.profile?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (user) => {
    // Foydalanuvchi profiliga o'tish
    navigate(`/profile/${user.login}`);
  };

  const handleSendMessage = (user, e) => {
    e.stopPropagation(); // Profilga o'tishni oldini olish
    // Bu yerda yangi xabar yozish funksiyasini qo'shishingiz mumkin
    // Hozircha faqat profilga o'tadi
    navigate(`/profile/${user.login}`);
  };

  return (
    <div className="chat-list-container">
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
              onClick={() => handleUserClick(chat.user)}
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

              <button 
                className="send-message-btn"
                onClick={(e) => handleSendMessage(chat.user, e)}
                title="Xabar yuborish"
              >
                <FiSend size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;