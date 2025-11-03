import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import "../styles/ChatList.css";

function ChatList() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("userData"));
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");

    const chatList = allUsers
      .filter(u => u.login !== currentUser.login && u.profile?.username)
      .map(u => {
        const messages = (currentUser.messages || []).filter(
          m => (m.from === currentUser.login && m.to === u.login) ||
               (m.from === u.login && m.to === currentUser.login)
        );
        const lastMsg = messages[messages.length - 1];
        const unread = messages.filter(m => m.to === currentUser.login && !m.read).length;

        return {
          user: u,
          lastMessage: lastMsg?.text || "Hali xabar yo'q",
          time: lastMsg?.time || "",
          unread,
        };
      });

    setChats(chatList);
  }, []);

  const filteredChats = chats.filter(c =>
    c.user.profile?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-list-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft />
        </button>
        <h2>Chatlar</h2>
      </div>

      <div className="chat-search">
        <FiSearch />
        <input
          type="text"
          placeholder="@username bo‘yicha qidiruv..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="chat-items">
        {filteredChats.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: "20px" }}>
            Hech kim topilmadi
          </p>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.user.login}
              className="chat-item"
              onClick={() => navigate(`/chat/${chat.user.login}`)}
            >
              <img
                src={chat.user.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt=""
                className="chat-avatar"
              />
              <div className="chat-info">
                <p className="chat-username">@{chat.user.profile?.username}</p>
                <p className="chat-lastmsg">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && <span className="chat-unread">{chat.unread}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
