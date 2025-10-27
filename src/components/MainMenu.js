import React, { useState } from 'react';
import '../styles/MainMenu.css';

function MainMenu({ user, onLogout, updateUser }) {
  const [topUpAmount, setTopUpAmount] = useState(0);

  const handleTopUp = () => {
    if (topUpAmount > 0) {
      const updatedUser = {
        ...user,
        balance: user.balance + parseInt(topUpAmount),
        history: [...user.history, { 
          time: new Date().toLocaleString(), 
          action: 'Balans to\'ldirildi', 
          amount: topUpAmount 
        }],
      };
      updateUser(updatedUser);
      alert(`${topUpAmount} ball qo'shildi!`);
      setTopUpAmount(0);
    } else {
      alert('Miqdorni 0 dan katta kiriting!');
    }
  };

  return (
    <div className="main-menu">
      <div className="container">
        <div className="header">
          <h1 className="welcome">Xush kelibsiz, {user.login}!</h1>
          <button onClick={onLogout} className="logout-btn">Chiqish</button>
        </div>

        <div className="balance-card">
          <div className="balance-info">
            <span className="balance-label">Joriy balans</span>
            <span className="balance-amount">{user.balance.toLocaleString()} ball</span>
          </div>
        </div>

        <div className="topup-card">
          <h3 className="section-title">Balans to'ldirish</h3>
          <div className="topup-form">
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Miqdorni kiriting"
              className="topup-input"
              min="1"
            />
            <button onClick={handleTopUp} className="topup-btn">To'ldirish</button>
          </div>
        </div>
 
      </div>
    </div>
  );
}

export default MainMenu;