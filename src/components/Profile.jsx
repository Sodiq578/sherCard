// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiCamera, FiDollarSign, FiCreditCard, FiClock,
  FiEdit2, FiSave, FiX, FiLogOut
} from 'react-icons/fi';
import CardGenerator from './CardGenerator';
import '../styles/Profile.css';

function Profile({ user, updateUser, onLogout }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Profilni yuklash
  useEffect(() => {
    if (user && user.profile) {
      setName(user.profile.name || user.login);
      setPhone(user.profile.phone || '');
      setEmail(user.profile.email || '');
      setAvatar(user.profile.avatar || '');
    }
  }, [user]);

  const toggleCardFlip = () => setIsCardFlipped(!isCardFlipped);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        name,
        phone,
        email,
        avatar,
      },
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
        </div>

        {/* Virtual Karta */}
        <div className="card-section">
          <h3>Virtual Kartangiz</h3>
          <div className="card-container">
            <div
              className={`card-wrapper ${isCardFlipped ? 'flipped' : ''}`}
              onClick={toggleCardFlip}
            >
              <CardGenerator user={user} />
            </div>
            <small className="flip-hint">Kartani aylantirish uchun bosing</small>
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
            <div className="stat-value">{user.cards?.length || 1}</div>
            <div className="stat-label">Karta</div>
          </div>
          <div className="stat-item">
            <FiClock className="stat-icon" />
            <div className="stat-value">{user.history?.length || 0}</div>
            <div className="stat-label">Tarix</div>
          </div>
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