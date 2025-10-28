// components/MainMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainMenu.css';

function MainMenu({ user, updateUser, onLogout }) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (amount > 0) {
      const updatedUser = {
        ...user,
        balance: user.balance + amount,
        history: [
          ...(user.history || []),
          {
            time: new Date().toLocaleString(),
            action: 'Balans to\'ldirildi',
            amount: amount,
          },
        ],
      };
      updateUser(updatedUser);
      alert(`${amount.toLocaleString()} UZS muvaffaqiyatli qo'shildi!`);
      setTopUpAmount('');
    } else {
      alert('Iltimos, 0 dan katta miqdor kiriting!');
    }
  };

  const displayName = user.profile?.name || user.login || 'Foydalanuvchi';

  return (
    <div className="onboarding-container">
      {/* Status Bar */}
      <div className="status-bar">
        <span className="time">{currentTime}</span>
        <div className="status-icons">
          <i className="fas fa-signal"></i>
          <i className="fas fa-wifi"></i>
          <i className="fas fa-battery-full"></i>
        </div>
      </div>

      <div className="main-content">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="user-info">
            <div className="avatar">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="greeting">
              <span className="welcome-text">Welcome back,</span>
              <span className="user-name">{displayName}</span>
            </div>
          </div>
         
        </div>

        {/* Balance Card */}
        <div className="balance-card-large">
          <div className="balance-display">
            <span className="balance-amount">
              {user.balance?.toLocaleString() || 0}
            </span>
            <span className="currency">UZS</span>
          </div>
          <div className="balance-label">Joriy balans</div>
        </div>

        {/* Top Up Section */}
        <div className="topup-card">
          <div className="topup-title">Balans to'ldirish</div>
          <div className="topup-input-wrapper">
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="000"
              className="topup-input"
            />
          </div>
          <button onClick={handleTopUp} className="topup-submit-btn">
            Kirish
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item active">
          Home
        </button>
        <button className="nav-item" onClick={() => navigate('/marketplace')}>
          Wallet
        </button>
        <button className="nav-item" onClick={() => navigate('/history')}>
          Chart
        </button>
        <button className="nav-item" onClick={() => navigate('/profile')}>
          Settings
        </button>
      </div>
    </div>
  );
}

export default MainMenu;