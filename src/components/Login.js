import React, { useState } from 'react';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login && password) {
      const userData = { login, password, balance: 0, cards: [], history: [] };
      onLogin(userData);
    } else {
      alert('Login va parol kiriting!');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (login && password) {
      const userData = { login, password, balance: 0, cards: [], history: [] };
      onLogin(userData);
      alert('Royxatdan o\'tish muvaffaqiyatli!');
    } else {
      alert('Login va parol kiriting!');
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? 'Royxatdan o\'tish' : 'Kirish'}</h2>
      <form onSubmit={isRegister ? handleRegister : handleSubmit}>
        <input 
          type="text" 
          value={login} 
          onChange={(e) => setLogin(e.target.value)} 
          placeholder="Login" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Parol" 
          required 
        />
        <button type="submit">
          {isRegister ? 'Royxatdan o\'tish' : 'Kirish'}
        </button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className="toggle-btn">
        {isRegister ? 'Kirish' : 'Royxatdan o\'tish'}
      </button>
    </div>
  );
}

export default Login;