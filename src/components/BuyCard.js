import React, { useState } from 'react';
import '../styles/BuyCard.css';

function BuyCard({ user, updateUser }) {
  const [cardBalance, setCardBalance] = useState(0);
  const price = 1000;

  const generateCardNumber = () => {
    let cardNumber = '';
    for (let i = 0; i < 12; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber;
  };

  const handleBuy = () => {
    if (user.balance >= price) {
      const cardNumber = generateCardNumber();
      const newCard = {
        id: cardNumber,
        balance: parseInt(cardBalance),
        design: 'default',
        createdAt: new Date().toLocaleString()
      };

      const updatedUser = {
        ...user,
        balance: user.balance - price,
        cards: [...user.cards, newCard],
        history: [...user.history, { 
          time: new Date().toLocaleString(), 
          action: 'Karta sotib olingan', 
          amount: price,
          cardNumber: cardNumber
        }],
      };
      updateUser(updatedUser);
      alert(`Karta sotib olindi!\nKarta raqami: ${cardNumber}\nBalans: ${cardBalance} ball`);
      setCardBalance(0);
    } else {
      alert('Yetarli balans yo\'q! Balansni to\'ldiring.');
    }
  };

  return (
    <div className="buy-card">
      <div className="container">
        <div className="header">
          <h1 className="page-title">Karta sotib olish</h1>
        </div>

        <div className="card-preview-section">
          <div className="card-preview">
            <div className="card-chip"></div>
            <div className="card-number">**** **** ****</div>
            <div className="card-balance">{cardBalance || 0} ball</div>
            <div className="card-type">VIRTUAL CARD</div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Karta balansi</label>
            <input 
              type="number" 
              value={cardBalance} 
              onChange={(e) => setCardBalance(e.target.value)} 
              placeholder="Karta balansini kiriting" 
              className="form-input"
              min="0" 
              max="1000000"
            />
          </div>
          
          <div className="price-card">
            <div className="price-item">
              <span>Karta narxi:</span>
              <strong>{price} ball</strong>
            </div>
            <div className="price-item">
              <span>Karta raqami:</span>
              <strong>Avtomatik generatsiya</strong>
            </div>
          </div>

          <button 
            onClick={handleBuy} 
            className={`buy-btn ${user.balance >= price ? 'active' : 'disabled'}`}
            disabled={user.balance < price}
          >
            {user.balance >= price ? 'Karta sotib olish' : 'Balans yetarli emas'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BuyCard;