// components/Profile.js
import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

function Profile({ user, updateUser }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (user && user.profile) {
      setName(user.profile.name || '');
      setPhone(user.profile.phone || '');
      setEmail(user.profile.email || '');
      setAvatar(user.profile.avatar || '');
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      profile: {
        name: name || user.login, // Agar ism bo'sh bo'lsa, login ishlatiladi
        phone,
        email,
        avatar,
      },
    };

    updateUser(updatedUser);
    alert('Profil muvaffaqiyatli yangilandi!');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <p className="loading-text">Yuklanmoqda...</p>;
  }

  // YANGI: Ism yoki login
  const displayName = user.profile?.name || user.login;

  return (
    <div className="profile">
      <div className="container">
        <div className="header">
          <h1 className="page-title">Profil</h1>
        </div>

        <div className="profile-card">
          <div className="user-info">
            <div className="avatar-section">
              <div className="avatar-container">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="avatar-image" />
                ) : (
                  <div className="avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  Camera
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                />
              </div>
              <h2>{displayName}</h2>
              <p className="user-role">Foydalanuvchi</p>
            </div>
          </div>

          <div className="profile-form">
            <div className="input-group">
              <label>Ism</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismingiz"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 ** *** ****"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="form-input"
              />
            </div>

            <button onClick={handleSave} className="save-btn">
              Saqlash
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">Money</div>
              <div className="stat-content">
                <div className="stat-number">
                  {user.balance ? user.balance.toLocaleString() : 0}
                </div>
                <div className="stat-label">Ball</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">Credit Card</div>
              <div className="stat-content">
                <div className="stat-number">
                  {user.cards ? user.cards.length : 0}
                </div>
                <div className="stat-label">Karta</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">History</div>
              <div className="stat-content">
                <div className="stat-number">
                  {user.history ? user.history.length : 0}
                </div>
                <div className="stat-label">Tarix</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;