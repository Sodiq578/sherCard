// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Backround from "../assets/images/backround.svg";
import "../styles/Login.css";
import Logo from "../assets/images/logo.png";

// === CUSTOM MESSAGE MODAL ===
const MessageModal = ({ isOpen, message, type = "info", onClose }) => {
  if (!isOpen) return null;

  const typeClass = type === "success" ? "success" : type === "error" ? "error" : "info";

  return (
    <div className="message-modal-overlay">
      <div className={`message-modal ${typeClass}`}>
        <div className="message-modal-content">
          <p>{message}</p>
          <button onClick={onClose} className="message-modal-close">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

// === ADMIN MODAL ===
const AdminModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>Admin tasdiqlash</h2>
        <p>Siz ushbu amalni bajarishga ishonchingiz komilmi?</p>
        <div className="admin-modal-buttons">
          <button className="cancel" onClick={onClose}>Bekor qilish</button>
          <button className="confirm" onClick={onConfirm}>Tasdiqlash</button>
        </div>
      </div>
    </div>
  );
};

// === GENERATE USERNAME & CARD ===
const generateUsername = (fullName) => {
  const cleaned = fullName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  const random = Math.floor(Math.random() * 9999);
  return `${cleaned}_${random}`;
};

const generateCardNumber = () => {
  let card = "";
  for (let i = 0; i < 12; i++) {
    card += Math.floor(Math.random() * 10);
  }
  return card;
};

// === MAIN LOGIN COMPONENT ===
const Login = ({ onLogin }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Message Modal State
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

  const navigate = useNavigate();

  // === SHOW MESSAGE ===
  const showMessage = (msg, type = "info") => {
    setMessageModal({ isOpen: true, message: msg, type });
  };

  const closeMessage = () => {
    setMessageModal({ ...messageModal, isOpen: false });
  };

  // === ADMIN HOTKEY: Ctrl + Alt + T ===
  useEffect(() => {
    const handleAdminKey = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleAdminKey);
    return () => window.removeEventListener("keydown", handleAdminKey);
  }, []);

  // === ADMIN CONFIRM ===
  const handleAdminConfirm = () => {
    setIsAdminModalOpen(false);
    const admin = {
      login: "sodiqjon",
      password: "sodiqjon123",
      profile: { name: "Admin", phone: "", email: "", avatar: "", username: "admin" },
      balance: 999999,
      cards: [],
      history: [],
      messages: [],
      isPremium: true,
    };
    onLogin(admin);
    navigate("/admin");
  };

  // === FORM SUBMIT ===
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!login || !password || !fullName || !phone) {
        showMessage("Barcha maydonlarni to'ldiring!", "error");
        return;
      }

      const username = generateUsername(fullName);
      const cardNumber = generateCardNumber();
      const newUser = {
        login,
        password,
        profile: { name: fullName, phone, email: "", avatar: "", username },
        balance: 10000,
        cards: [],
        history: [],
        messages: [],
        isPremium: false,
      };

      localStorage.setItem(`cardNumber_${login}`, cardNumber);
      localStorage.setItem("userData", JSON.stringify(newUser));

      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      if (!allUsers.find(u => u.login === login)) {
        allUsers.push(newUser);
        localStorage.setItem("allUsers", JSON.stringify(allUsers));
      }

      localStorage.setItem(`login_bonus_${login}`, "true");

      showMessage(
        `Tabriklaymiz, ${fullName}!\nSizning nikneymingiz: @${username}\nKarta raqamingiz: ${cardNumber}\n+10,000 UZS bonus hisobingizga o'tkazildi!`,
        "success"
      );

      setTimeout(() => {
        onLogin(newUser);
        navigate("/hello");
      }, 2500);
    } else {
      if (!login || !password) {
        showMessage("Login va parolni kiriting!", "error");
        return;
      }

      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (savedUser && savedUser.login === login && savedUser.password === password) {
        let updatedUser = { ...savedUser };
        const hasReceivedBonus = localStorage.getItem(`login_bonus_${login}`);

        if (!hasReceivedBonus) {
          updatedUser.balance = (updatedUser.balance || 0) + 1000;
          updatedUser.history = [
            ...(updatedUser.history || []),
            {
              time: new Date().toLocaleString("uz-UZ"),
              action: "Kirish bonusi",
              amount: "+1,000 UZS",
            },
          ];
          localStorage.setItem(`login_bonus_${login}`, "true");
          localStorage.setItem("userData", JSON.stringify(updatedUser));
          showMessage("Tabriklaymiz! Kirish uchun +1,000 UZS bonus oldingiz!", "success");
        } else {
          showMessage("Xush kelibsiz, " + savedUser.profile.name + "!", "success");
        }

        setTimeout(() => {
          onLogin(updatedUser);
          navigate("/hello");
        }, hasReceivedBonus ? 1500 : 2500);
      } else {
        showMessage("Login yoki parol xato!", "error");
      }
    }
  };

  return (
    <div className="loginx-app">
      <div className="loginx-background">
        <img src={Backround} alt="Background" className="loginx-bg-image" />
      </div>

      <div className="loginx-content">
        <div className="loginx-logo-container">
          <img src={Logo} alt="Hamyon Logo" className="loginx-logo-img" />
        </div>

        <div className="loginx-form">
          <h2 className="loginx-title">{isRegister ? "Ro'yxatdan o'tish" : "Kirish"}</h2>
          <form onSubmit={handleSubmit} className="loginx-inputs">
            <input
              type="text"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="loginx-input"
              required
            />
            <input
              type="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="loginx-input"
              required
            />
            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Ism Familiya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="loginx-input"
                  required
                />
                <input
                  type="tel"
                  placeholder="+998 ** *** ** **"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="loginx-input"
                  required
                />
              </>
            )}
            <div className="loginx-buttons">
              <button type="submit" className="loginx-btn-primary">
                {isRegister ? "Ro'yxatdan o'tish" : "Kirish"}
              </button>
              <button
                type="button"
                className="loginx-btn-toggle"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            </div>
          </form>
        </div>

        <p className="loginx-footer">© 2025 Sodiqov</p>
      </div>

      {/* Modallar */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onConfirm={handleAdminConfirm}
      />

      <MessageModal
        isOpen={messageModal.isOpen}
        message={messageModal.message}
        type={messageModal.type}
        onClose={closeMessage}
      />
    </div>
  );
};

export default Login;