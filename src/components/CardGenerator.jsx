// src/components/CardGenerator.jsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Logo from '../assets/images/logo.png';

const CardGenerator = ({ user }) => {
  // 12 xonali karta raqamini yaratish
  const generateCardNumber = () => {
    let card = '';
    for (let i = 0; i < 12; i++) {
      card += Math.floor(Math.random() * 10);
    }
    return card;
  };

  // LocalStorage'dan karta raqamini olish yoki yangisini yaratish
  const getCardNumber = () => {
    const savedCard = localStorage.getItem(`cardNumber_${user.login}`);
    if (savedCard) {
      return savedCard;
    } else {
      const newCard = generateCardNumber();
      localStorage.setItem(`cardNumber_${user.login}`, newCard);
      return newCard;
    }
  };

  const cardNumber = getCardNumber();
  const displayName = user.profile?.name || user.login || 'Foydalanuvchi';
  const phone = user.profile?.phone || '';

  return (
    <div className="card-generator-container">
      {/* Old tomon */}
      <div className="card-side card-front">
        <div className="card-background-front">
          <div className="geometric-pattern-front"></div>
        </div>
        <div className="card-logo"></div>
        <div className="card-content">
          <div className="card-user-info">
            <div className="card-login">{user.login}</div>
            <div className="card-phone">{phone}</div>
          </div>
          <div className="card-number-display">
            {cardNumber.replace(/(.{4})/g, '$1 ')}
          </div>
        </div>
      </div>

      {/* Orqa tomon */}
      <div className="card-side card-back">
        <div className="card-background-back">
          <div className="geometric-pattern-back"></div>
        </div>
        <div className="card-logo-back">H</div>
        <div className="qr-section">
          <div className="qr-container">
            <QRCodeCanvas 
              value={cardNumber} 
              size={80}
              bgColor="#FFC400"
              fgColor="#000000"
              level="M"
            />
          </div>
          <div className="hamyon-text">hamyon</div>
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;