// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCamera, FiDollarSign, FiCreditCard, FiClock,
  FiEdit2, FiSave, FiX, FiLogOut, FiArrowUpRight, FiArrowDownLeft,
  FiUser, FiMail, FiPhone, FiChevronRight
} from 'react-icons/fi';
import '../styles/Profile.css';
import Logo from '../assets/images/logo.png';

function Profile({ user, updateUser, onLogout }) {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [cardsCount, setCardsCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Profilni yuklash
  useEffect(() => {
    if (user?.profile) {
      setName(user.profile.name || user.login);
      setPhone(user.profile.phone || '');
      setEmail(user.profile.email || '');
      setAvatar(user.profile.avatar || '');
    }
    
    setCardsCount((user?.cards?.length || 0) + 1); // +1 virtual karta uchun
  }, [user]);

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      alert("Ism va telefon to'ldirilishi shart!");
      return;
    }

    const updatedUser = {
      ...user,
      profile: { ...user.profile, name, phone, email, avatar },
    };
    updateUser(updatedUser);
    setIsEditing(false);
    alert('Profil muvaffaqiyatli yangilandi!');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Rasm hajmi 2MB dan oshmasin!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Haqiqatan ham chiqmoqchimisiz?')) {
      onLogout();
      navigate('/');
    }
  };

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  if (!user) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profil</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">
          {isEditing ? (
            <>Bekor qilish</>
          ) : (
            <>Tahrirlash</>
          )}
        </button>
      </div>

      <div className="profile-card">
        {/* === AVATAR === */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <label htmlFor="avatar-upload" className="camera-icon">
                <FiCamera />
              </label>
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="avatar-input"
          />
          <h2 className="user-name">{name}</h2>
          <p className="user-username">@{user.profile?.username || 'username'}</p>
          <div className="user-balance-badge">
            {user.balance?.toLocaleString() || 0} UZS
            <img src={Logo} alt="Logo" className="balance-logo" />
          </div>
        </div>

        {/* === FORMA === */}
        <div className="profile-form">
          <div className="input-group">
            <label><FiUser /> To'liq ism</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              placeholder="Ism Familiya"
            />
          </div>

          <div className="input-group">
            <label><FiPhone /> Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              placeholder="+998 ** *** ** **"
            />
          </div>

          <div className="input-group">
            <label><FiMail /> Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
              placeholder="email@example.com"
            />
          </div>

          {isEditing && (
            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">
                Saqlash
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">
                Bekor qilish
              </button>
            </div>
          )}
        </div>

        {/* === STATISTIKA === */}
        <div className="stats-grid">
          <div className="stat-item">
            <FiDollarSign className="stat-icon" />
            <div className="stat-value">{user.balance?.toLocaleString() || 0}</div>
            <div className="stat-label">Balans</div>
          </div>
          <div className="stat-item">
            <FiCreditCard className="stat-icon" />
            <div className="stat-value">{cardsCount}</div>
            <div className="stat-label">Kartalar</div>
          </div>
          <div className="stat-item" onClick={toggleHistory} style={{ cursor: 'pointer' }}>
            <FiClock className="stat-icon" />
            <div className="stat-value">{user.history?.length || 0}</div>
            <div className="stat-label">Tarix</div>
            <FiChevronRight className="chevron-icon" />
          </div>
        </div>

        {/* === KARTALAR TUGMASI === */}
        <button onClick={() => navigate('/cards')} className="cards-btn">
          Kartalarimni ko'rish
        </button>

        {/* === TARIX (OCHILADIGAN) === */}
        <div className={`history-section ${showHistory ? 'expanded' : ''}`}>
          <div className="history-header" onClick={toggleHistory}>
            <h3>Oxirgi amallar</h3>
            <FiChevronRight className={`chevron ${showHistory ? 'rotated' : ''}`} />
          </div>

          {showHistory && (
            <div className="history-content">
              {user.history && user.history.length > 0 ? (
                <div className="history-list">
                  {user.history
                    .slice()
                    .reverse()
                    .map((item, i) => {
                      const isPositive = item.amount?.toString().startsWith('+') || 
                                       item.action?.includes('to‘ldirildi') || 
                                       item.action?.includes('keldi');
                      return (
                        <div key={i} className="history-item">
                          <div className="history-icon">
                            {isPositive ? (
                              <FiArrowDownLeft className="in" />
                            ) : (
                              <FiArrowUpRight className="out" />
                            )}
                          </div>
                          <div className="history-info">
                            <p className="history-type">
                              {item.action || item.type || 'Amal'}
                            </p>
                            <p className="history-date">
                              {item.time || item.date || new Date().toLocaleString()}
                            </p>
                          </div>
                          <div className={`history-amount ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? '+' : ''}
                            {Math.abs(parseInt(item.amount) || 0).toLocaleString()} UZS
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="no-history">Hozircha hech qanday amal yo'q.</p>
              )}
            </div>
          )}
        </div>

        {/* === CHIQISH === */}
        <button onClick={handleLogout} className="logout-btn">
          Chiqish
        </button>
      </div>
    </div>
  );
}

export default Profile;