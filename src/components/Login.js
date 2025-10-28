// components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Backround from '../assets/images/backround.svg';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // YANGI: Ism
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  // MAXFIY ADMIN KIRISH: Ctrl + Alt + T
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

    if (!login || !password || (isRegister && !name)) {
      alert('Barcha maydonlarni to\'ldiring!');
      return;
    }

    const userData = {
      login,
      password,
      name: isRegister ? name : login // Ro'yxatda ism saqlanadi
    };
    onLogin(userData);
  };

  return (
    <div className="loginx-app">
      <div className="loginx-background">
        <img src={Backround} alt="Background" className="loginx-bg-image" />
      </div>

      <div className="loginx-content">
        <div className="loginx-logo">logoX</div>

        <div className="loginx-form">
          <h2 className="loginx-title">
            {isRegister ? "Ro'yxatdan o'tish" : 'Kirish'}
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

            {/* YANGI: Ism maydoni (faqat ro'yxatda) */}
            {isRegister && (
              <input
                type="text"
                placeholder="Ismingiz (masalan: Ali Akbarov)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="loginx-input"
                required
              />
            )}

            <div className="loginx-buttons">
              <button type="submit" className="loginx-btn-primary">
                {isRegister ? "Ro'yxatdan o'tish" : 'Kirish'}
              </button>
              <button
                type="button"
                className="loginx-btn-toggle"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Kirish' : "Ro'yxatdan o'tish"}
              </button>
            </div>
          </form>
        </div>

        <p className="loginx-footer">Ro'yxatdan o'tish</p>
      </div>
    </div>
  );
};

export default Login;