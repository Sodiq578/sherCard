// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Backround from '../assets/images/backround.svg';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  // Admin kirish
  useEffect(() => {
    const handleAdminKey = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        onLogin({ login: 'sodiqjon', password: 'sodiqjon123' });
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleAdminKey);
    return () => window.removeEventListener('keydown', handleAdminKey);
  }, [onLogin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister && (!login || !password || !fullName || !phone)) {
      alert("Barcha maydonlarni to'ldiring!");
      return;
    }

    if (!isRegister && (!login || !password)) {
      alert("Login va parolni kiriting!");
      return;
    }

    if (isRegister) {
      // Yangi foydalanuvchi uchun ma'lumotlar
      const newUser = {
        login,
        password,
        profile: {
          name: fullName,
          phone: phone,
          email: '',
          avatar: ''
        }
      };

      // Virtual karta raqamini yaratish
      const generateCardNumber = () => {
        let card = '';
        for (let i = 0; i < 12; i++) {
          card += Math.floor(Math.random() * 10);
        }
        return card;
      };

      const cardNumber = generateCardNumber();
      localStorage.setItem(`cardNumber_${login}`, cardNumber);

      alert(`Tabriklaymiz, ${fullName}! Virtual karta yaratildi.`);
      onLogin(newUser);
      navigate('/hello');
    } else {
      // Mavjud foydalanuvchini tekshirish
      const savedUser = JSON.parse(localStorage.getItem("userData"));
      if (savedUser && savedUser.login === login && savedUser.password === password) {
        onLogin(savedUser);
        navigate('/hello');
      } else {
        alert("Login yoki parol xato!");
      }
    }
  };

  return (
    <div className="loginx-app">
      <div className="loginx-background">
        <img src={Backround} alt="Background" className="loginx-bg-image" />
      </div>

      <div className="loginx-content">
        <div className="loginx-logo">Mahalla Obodligi</div>

        <div className="loginx-form">
          <h2 className="loginx-title">
            {isRegister ? "Ro'yxatdan o'tish" : "Kirish"}
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

        <p className="loginx-footer">© 2025 Mahalla Obodligi</p>
      </div>
    </div>
  );
};

export default Login;