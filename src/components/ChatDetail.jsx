// src/components/ChatDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import "../styles/ChatDetail.css";

function ChatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("userData"));
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const user = allUsers.find(u => u.login === id);
    setRecipient(user);

    const chatMsgs = (currentUser.messages || []).filter(
      m => (m.from === currentUser.login && m.to === id) || (m.from === id && m.to === currentUser.login)
    );
    setMessages(chatMsgs);

    // O'qilgan deb belgilash
    const updatedMessages = currentUser.messages.map(m =>
      m.to === currentUser.login && m.from === id ? { ...m, read: true } : m
    );
    const updatedUser = { ...currentUser, messages: updatedMessages };
    localStorage.setItem("userData", JSON.stringify(updatedUser));

    // allUsers ni yangilash
    const updatedAll = allUsers.map(u =>
      u.login === currentUser.login ? updatedUser : u
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedAll));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const currentUser = JSON.parse(localStorage.getItem("userData"));
    const msg = {
      text: newMessage,
      from: currentUser.login,
      to: id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    // Joriy foydalanuvchi
    const updatedCurrent = {
      ...currentUser,
      messages: [...(currentUser.messages || []), msg],
    };
    localStorage.setItem("userData", JSON.stringify(updatedCurrent));

    // Qabul qiluvchi
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedAll = allUsers.map(u =>
      u.login === id
        ? { ...u, messages: [...(u.messages || []), { ...msg, read: false }] }
        : u
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedAll));

    setMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  return (
    <div className="chat-detail-container">
      <div className="chat-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft />
        </button>
        <img
          src={recipient?.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
          alt=""
          className="chat-detail-avatar"
        />
        <div>
          <p className="chat-detail-username">@{recipient?.profile?.username}</p>
          <p className="chat-detail-name">{recipient?.profile?.name}</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.from === JSON.parse(localStorage.getItem("userData")).login ? "sent" : "received"}`}
          >
            <p>{m.text}</p>
            <span className="message-time">{m.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Xabar yozing..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>
          <FiSend />
        </button>
      </div>
    </div>
  );
}

export default ChatDetail;