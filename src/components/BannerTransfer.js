import React, { useState } from 'react';
import '../styles/BannerTransfer.css';

function BannerTransfer({ user }) {
  const [amount, setAmount] = useState(0);

  const handleBannerTransfer = () => {
    if (user.balance >= amount && amount > 0) {
      const updatedUser = {
        ...user,
        balance: user.balance - parseInt(amount),
        history: [...user.history, { 
          time: new Date().toLocaleString(), 
          action: 'Banner orqali yuborildi', 
          amount: amount 
        }],
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert(`${amount} ball admin hisobiga yuborildi!`);
      setAmount(0);
      window.location.reload();
    } else {
      alert('Yetarli balans yo\'q yoki miqdor noto\'g\'ri!');
    }
  };

  const bannerHistory = user.history.filter(h => h.action === 'Banner orqali yuborildi');

  return (
    <div className="banner-transfer">
      <h2>Banner orqali yuborish</h2>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        placeholder="Miqdor" 
        min="1" 
        required 
      />
      <button onClick={handleBannerTransfer} className="banner-btn">Yuborish</button>
      <div className="history-section">
        <h3>Banner Tarixi:</h3>
        {bannerHistory.length > 0 ? (
          <ul className="banner-history-list">
            {bannerHistory.map((item, index) => (
              <li key={index} className="banner-history-item">
                {item.time} - {item.amount} ball
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-history">Hozircha banner tarixi yo'q</p>
        )}
      </div>
    </div>
  );
}

export default BannerTransfer;