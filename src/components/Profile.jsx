import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCamera, FiDollarSign, FiCreditCard, FiClock,
  FiEdit2, FiSave, FiX, FiLogOut, FiArrowUpRight, FiArrowDownLeft
} from 'react-icons/fi';
import '../styles/Profile.css';
import Logo from '../assets/images/logo.png';

function Profile({ user, updateUser, onLogout }) {
  const navigate = useNavigate(); // 🟢 navigate funksiyasi qo‘shildi

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Profilni yuklash
  useEffect(() => {
    if (user && user.profile) {
      setName(user.profile.name || user.login);
      setPhone(user.profile.phone || '');
      setEmail(user.profile.email || '');
      setAvatar(user.profile.avatar || '');
    }
  }, [user]);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      profile: { ...user.profile, name, phone, email, avatar },
    };
    updateUser(updatedUser);
    setIsEditing(false);
    alert('Profil maʼlumotlari yangilandi!');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Chiqishni xohlaysizmi?')) onLogout();
  };

  if (!user) return <div className="loading">Yuklanmoqda...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profil</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">
          {isEditing ? (
            <>
              <FiX className="btn-icon" /> Bekor qilish
            </>
          ) : (
            <>
              <FiEdit2 className="btn-icon" /> Tahrirlash
            </>
          )}
        </button>
      </div>

      <div className="profile-card">
        {/* Avatar */}
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
            disabled={!isEditing}
          />
          <h2 className="user-name">{name}</h2>
          <p className="user-role">Foydalanuvchi</p>
          <div className="user-balance-badge">
            {user.balance?.toLocaleString() || 0}
            <img src={Logo} alt="Logo" className="balance-logo" />
          </div>
        </div>

        {/* Profil formasi */}
        <div className="profile-form">
          <div className="input-group">
            <label>To'liq ism</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="input-group">
            <label>Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 ** *** ****"
              disabled={!isEditing}
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="form-actions">
              <button onClick={handleSave} className="save-btn">
                <FiSave /> Saqlash
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">
                <FiX /> Bekor qilish
              </button>
            </div>
          )}
        </div>

        {/* Statistika */}
        <div className="stats-grid">
          <div className="stat-item">
            <FiDollarSign className="stat-icon" />
            <div className="stat-value">{user.balance?.toLocaleString() || 0}</div>
            <div className="stat-label">Ball</div>
          </div>

          <div className="stat-item">
            <FiCreditCard className="stat-icon" />
            <div className="stat-value">{user.cards?.length || 0}</div>
            <div className="stat-label">Karta</div>
          </div>

          <div className="stat-item">
            <FiClock className="stat-icon" />
            <div className="stat-value">{user.history?.length || 0}</div>
            <div className="stat-label">Tarix</div>
          </div>
        </div>

        {/* Kartalar sahifasiga o‘tish tugmasi */}
        <button onClick={() => navigate('/cards')} className="cards-btn">
          Kartalarimni ko‘rish
        </button>

        {/* === OXIRGI TARIX BO‘LIMI === */}
        <div className="history-section">
          <h3>Oxirgi amallar</h3>
          {user.history && user.history.length > 0 ? (
            <div className="history-list">
              {user.history
                .slice(-5)
                .reverse()
                .map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-icon">
                      {item.type === 'to‘lov' || item.type === 'chiqarish' ? (
                        <FiArrowUpRight className="out" />
                      ) : (
                        <FiArrowDownLeft className="in" />
                      )}
                    </div>
                    <div className="history-info">
                      <p className="history-type">{item.type}</p>
                      <p className="history-date">{item.date}</p>
                    </div>
                    <div
                      className={`history-amount ${
                        item.type === 'to‘lov' || item.type === 'chiqarish'
                          ? 'negative'
                          : 'positive'
                      }`}
                    >
                      {item.amount > 0 ? '+' : ''}
                      {item.amount} UZS
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-history">Hozircha hech qanday amal yo‘q.</p>
          )}
        </div>

        {/* Chiqish */}
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Chiqish
        </button>
      </div>
    </div>
  );
}

export default Profile;
