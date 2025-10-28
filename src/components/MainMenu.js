// components/MainMenu.js
import React, { useState, useEffect } from 'react';
import '../styles/MainMenu.css';

function MainMenu({ user, updateUser }) {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [currentTime, setCurrentTime] = useState('');

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
         
        
      </div>

      <div className="main-content">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="user-info">
            <div className="avatar">
              <img
                src={user.profile?.avatar || '/default-avatar.png'}
                alt="Avatar"
                className="avatar-img"
              />
            </div>
            <div className="greeting">
              <span className="welcome-text">Welcome back,</span>
              <span className="user-name">{displayName}</span>
            </div>
          </div>
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Balance Card */}
        <div className="balance-card-large">
          <div className="balance-display">
            <span className="balance-amount">
              {user.balance.toLocaleString()}
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
          <i className="fas fa-home"></i>
        </button>
        <button className="nav-item">
          <i className="fas fa-wallet"></i>
        </button>
        <button className="nav-item">
          <i className="fas fa-chart-line"></i>
        </button>
        <button className="nav-item">
          <i className="fas fa-cog"></i>
        </button>
      </div>
    </div>
  );
}

export default MainMenu;