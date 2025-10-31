// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Backround from "../assets/images/backround.svg";
import "../styles/Login.css";
import Logo from "../assets/images/logo.png";

// === ADMIN MODAL KOMPONENTI ===
const AdminModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>🔒 Admin tasdiqlash</h2>
        <p>Siz ushbu amalni bajarishga ishonchingiz komilmi?</p>
        <div className="admin-modal-buttons">
          <button className="cancel" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="confirm" onClick={onConfirm}>
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
};

// === LOGIN KOMPONENTI ===
const Login = ({ onLogin }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const navigate = useNavigate();

  // Admin kirish: Ctrl + Alt + T
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

  // Admin tasdiqlash
  const handleAdminConfirm = () => {
    setIsAdminModalOpen(false);
    onLogin({ login: "sodiqjon", password: "sodiqjon123" });
    navigate("/admin");
  };

  // Admin bekor qilish
  const handleAdminClose = () => {
    setIsAdminModalOpen(false);
  };

  // Foydalanuvchini ro‘yxatdan o‘tkazish yoki kirish
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister && (!login || !password || !fullName || !phone)) {
      alert("Barcha maydonlarni to‘ldiring!");
      return;
    }

    if (!isRegister && (!login || !password)) {
      alert("Login va parolni kiriting!");
      return;
    }

    if (isRegister) {
      // Yangi foydalanuvchi ma'lumotlari
      const newUser = {
        login,
        password,
        profile: {
          name: fullName,
          phone: phone,
          email: "",
          avatar: "",
        },
        balance: 10000, // Boshlang‘ich balans
        cards: [],
        history: [],
      };

      // Tasodifiy karta raqami yaratish
      const generateCardNumber = () => {
        let card = "";
        for (let i = 0; i < 12; i++) {
          card += Math.floor(Math.random() * 10);
        }
        return card;
      };

      const cardNumber = generateCardNumber();
      localStorage.setItem(`cardNumber_${login}`, cardNumber);
      localStorage.setItem("userData", JSON.stringify(newUser));

      alert(`Tabriklaymiz, ${fullName}! Virtual karta yaratildi.`);
      onLogin(newUser);
      navigate("/hello");
    } else {
      // Mavjud foydalanuvchini tekshirish
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (
        savedUser &&
        savedUser.login === login &&
        savedUser.password === password
      ) {
        onLogin(savedUser);
        navigate("/hello");
      } else {
        alert("Login yoki parol xato!");
      }
    }
  };

  return (
    <div className="loginx-app">
      {/* Fon rasmi */}
      <div className="loginx-background">
        <img src={Backround} alt="Background" className="loginx-bg-image" />
      </div>

      {/* Kontent */}
      <div className="loginx-content">
        {/* Logo */}
        <div className="loginx-logo-container">
          <img src={Logo} alt="Hamyon Logo" className="loginx-logo-img" />
        </div>

        {/* Forma */}
        <div className="loginx-form">
          <h2 className="loginx-title">
            {isRegister ? "Ro‘yxatdan o‘tish" : "Kirish"}
          </h2>

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
                {isRegister ? "Ro‘yxatdan o‘tish" : "Kirish"}
              </button>

              <button
                type="button"
                className="loginx-btn-toggle"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Kirish" : "Ro‘yxatdan o‘tish"}
              </button>
            </div>
          </form>
        </div>

        <p className="loginx-footer">© 2025 Sodiqov</p>
      </div>

      {/* Admin modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={handleAdminClose}
        onConfirm={handleAdminConfirm}
      />
    </div>
  );
};

export default Login;
