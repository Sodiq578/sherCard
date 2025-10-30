import React, { useState } from 'react';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaPlus, 
  FaCheck, 
  FaTimes,
  FaWallet,
  FaQrcode
} from 'react-icons/fa';
import '../styles/BuyCard.css';

function BuyCard({ user, updateUser }) {
  const [cardBalance, setCardBalance] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const price = 1000; // Karta narxi

  // 12 ta raqamli karta raqami generatsiya
  const generateCardNumber = () => {
    let cardNumber = '8600'; // Uzcard BIN
    for (let i = 0; i < 8; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber.replace(/(\d{4})/g, '$1 ').trim(); // 8600 1234 5678
  };

  const handleBuy = async () => {
    const balance = parseInt(cardBalance);

    if (!balance || balance <= 0) {
      alert('Iltimos, karta balansini to\'g\'ri kiriting!');
      return;
    }

    if (user.balance < price) {
      alert('Yetarli balans yo\'q! Iltimos, balansingizni to\'ldiring.');
      return;
    }

    setIsPurchasing(true);

    // Simulyatsiya: 1.5 sekund kutish
    await new Promise(resolve => setTimeout(resolve, 1500));

    const cardNumber = generateCardNumber();
    const newCard = {
      id: cardNumber.replace(/\s/g, ''), // saqlash uchun bo'shliqsiz
      number: cardNumber,
      balance: balance,
      design: 'gold',
      type: 'real',
      createdAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      balance: user.balance - price,
      cards: [...(user.cards || []), newCard],
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString('uz-UZ'),
          action: 'Yangi karta sotib olindi',
          amount: -price,
          details: `Karta: ${cardNumber}, Balans: ${balance} ball`,
          type: 'purchase'
        }
      ]
    };

    updateUser(updatedUser);
    setCardBalance('');
    setIsPurchasing(false);

    alert(
      `Karta muvaffaqiyatli sotib olindi!\n` +
      `Karta raqami: ${cardNumber}\n` +
      `Karta balansi: ${balance.toLocaleString()} ball\n` +
      `Sarflangan: ${price} ball`
    );
  };

  const canBuy = user.balance >= price && cardBalance > 0;

  return (
    <div className="buy-card-page">
      <div className="buy-card-container">

        {/* Header */}
        <div className="buy-card-header">
          <h1 className="page-title">
            <FaCreditCard className="title-icon" />
            Yangi Karta Sotib Olish
          </h1>
          <div className="user-balance-info">
            <FaWallet className="balance-header-icon" />
            Joriy balans: <strong>{user.balance?.toLocaleString() || 0}</strong> ball
          </div>
        </div>

        <div className="buy-card-content">

          {/* Karta Ko'rinishi */}
          <div className="card-preview-section">
            <h3 className="preview-title">
              <FaQrcode className="preview-icon" />
              Karta ko'rinishi
            </h3>
            <div className="card-preview">
              <div className="preview-card">
                <div className="preview-card-header">
                  <div className="preview-chip"></div>
                  <div className="preview-logo">
                    <FaWallet /> Hamyon
                  </div>
                </div>

                <div className="preview-card-number">
                  {generateCardNumber().replace(/\d{4}(?=.)/g, '**** ')} {/* Maskalangan */}
                </div>

                <div className="preview-card-balance">
                  <FaMoneyBillWave className="preview-balance-icon" />
                  <strong>{parseInt(cardBalance) || 0}</strong> ball
                </div>

                <div className="preview-card-footer">
                  <span className="card-type">VIRTUAL CARD</span>
                  <span className="card-price">Narxi: {price} ball</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forma */}
          <div className="form-section">
            <div className="form-container">
              <h3 className="form-title">
                <FaPlus className="form-title-icon" />
                Karta sozlamalari
              </h3>

              {/* Balans kiritish */}
              <div className="form-group">
                <label className="form-label">
                  <FaMoneyBillWave className="label-icon" />
                  Karta balansi (ball)
                </label>
                <input
                  type="number"
                  value={cardBalance}
                  onChange={(e) => setCardBalance(e.target.value)}
                  placeholder="Misol: 50000"
                  className="form-input"
                  min="1"
                  max="10000000"
                  disabled={isPurchasing}
                />
                <div className="input-hint">
                  Minimal: 1 ball | Maksimal: 10,000,000 ball
                </div>
              </div>

              {/* Narx ma'lumotlari */}
              <div className="price-info-card">
                <div className="price-item">
                  <FaShoppingCart className="price-icon" />
                  <span>Karta narxi:</span>
                  <strong>{price.toLocaleString()} ball</strong>
                </div>
                <div className="price-item">
                  <FaCreditCard className="price-icon" />
                  <span>Karta raqami:</span>
                  <strong>Avto-generatsiya</strong>
                </div>
                <div className="price-item total">
                  <FaMoneyBillWave className="price-icon" />
                  <span>Umumiy to'lov:</span>
                  <strong className="total-price">{price.toLocaleString()} ball</strong>
                </div>
              </div>

              {/* Sotib olish tugmasi */}
              <button
                onClick={handleBuy}
                className={`buy-btn ${canBuy ? 'active' : 'disabled'} ${isPurchasing ? 'loading' : ''}`}
                disabled={!canBuy || isPurchasing}
              >
                {isPurchasing ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sotib olinmoqda...
                  </>
                ) : canBuy ? (
                  <>
                    <FaCheck className="btn-success-icon" />
                    Karta sotib olish
                  </>
                ) : (
                  <>
                    <FaTimes className="btn-error-icon" />
                    Balans yetarli emas
                  </>
                )}
              </button>

              {/* Yetarli emas xabari */}
              {user.balance < price && (
                <div className="insufficient-balance">
                  <p>Karta sotib olish uchun kamida <strong>{price}</strong> ball kerak.</p>
                  <p>Balansingiz: <strong>{user.balance}</strong> ball</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyCard;