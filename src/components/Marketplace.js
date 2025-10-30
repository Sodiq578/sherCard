import React, { useState, useEffect } from 'react';
import { 
  FaShoppingCart, 
  FaCreditCard, 
  FaUser, 
  FaClock, 
  FaTag, 
  FaCheck, 
  FaTimes,
  FaStore,
  FaMoneyBillWave
} from 'react-icons/fa';
import '../styles/Marketplace.css';

function Marketplace({ user, updateUser }) {
  const [sellCardId, setSellCardId] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [marketCards, setMarketCards] = useState([]);
  const [isSelling, setIsSelling] = useState(false);
  const [isBuying, setIsBuying] = useState({});

  // localStorage dan yuklash
  useEffect(() => {
    const stored = localStorage.getItem('marketCards');
    if (stored) {
      setMarketCards(JSON.parse(stored));
    }
  }, []);

  // localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('marketCards', JSON.stringify(marketCards));
  }, [marketCards]);

  const handleSell = async () => {
    const card = user.cards?.find(c => c.id === sellCardId);
    const price = parseInt(sellPrice);

    if (!card) {
      alert('Karta topilmadi!');
      return;
    }
    if (!price || price <= 0) {
      alert('Iltimos, to\'g\'ri narx kiriting!');
      return;
    }

    setIsSelling(true);

    // Simulyatsiya
    await new Promise(resolve => setTimeout(resolve, 1200));

    const marketCard = {
      ...card,
      seller: user.login,
      price: price,
      listedAt: new Date().toLocaleString('uz-UZ'),
      listedTimestamp: Date.now()
    };

    const newMarketCards = [...marketCards, marketCard];
    setMarketCards(newMarketCards);

    const updatedUser = {
      ...user,
      cards: user.cards.filter(c => c.id !== sellCardId),
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString('uz-UZ'),
          action: 'Karta sotuvga qo\'yildi',
          amount: price,
          details: `Karta: ${sellCardId}`,
          type: 'sell'
        }
      ]
    };

    updateUser(updatedUser);
    setSellCardId('');
    setSellPrice('');
    setIsSelling(false);

    alert(`Karta ${sellCardId} ${price} ballga sotuvga qo'yildi!`);
  };

  const handleBuy = async (marketCard) => {
    if (user.balance < marketCard.price) {
      alert('Yetarli balans yo\'q!');
      return;
    }

    setIsBuying(prev => ({ ...prev, [marketCard.id]: true }));

    // Simulyatsiya
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newCard = {
      id: marketCard.id,
      number: marketCard.number || marketCard.id,
      balance: marketCard.balance,
      design: marketCard.design || 'default',
      type: marketCard.type || 'real'
    };

    const updatedUser = {
      ...user,
      balance: user.balance - marketCard.price,
      cards: [...(user.cards || []), newCard],
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString('uz-UZ'),
          action: 'Marketplacedan karta sotib olindi',
          amount: -marketCard.price,
          details: `Sotuvchi: @${marketCard.seller}`,
          type: 'buy'
        }
      ]
    };

    updateUser(updatedUser);

    const newMarketCards = marketCards.filter(c => c.id !== marketCard.id);
    setMarketCards(newMarketCards);
    setIsBuying(prev => ({ ...prev, [marketCard.id]: false }));

    alert(`Karta muvaffaqiyatli sotib olindi!\nSotuvchi: @${marketCard.seller}\nNarx: ${marketCard.price} ball`);
  };

  const selectedCard = user.cards?.find(c => c.id === sellCardId);

  return (
    <div className="marketplace-page">
      <div className="marketplace-container">

        {/* Header */}
        <div className="marketplace-header">
          <h1 className="page-title">
            <FaStore className="title-icon" />
            Marketplace
          </h1>
          <div className="user-info">
            <FaUser className="user-icon" />
            @{user.login} | 
            <FaMoneyBillWave className="balance-icon" />
            {user.balance?.toLocaleString() || 0} ball
          </div>
        </div>

        {/* Sotish bo'limi */}
        <div className="sell-section">
          <div className="section-card">
            <h2 className="section-title">
              <FaShoppingCart className="section-icon" />
              Karta Sotish
            </h2>

            <div className="sell-form">
              <div className="form-group">
                <label className="form-label">
                  <FaCreditCard className="label-icon" />
                  Kartani tanlang
                </label>
                <select
                  value={sellCardId}
                  onChange={(e) => setSellCardId(e.target.value)}
                  className="form-select"
                  disabled={isSelling}
                >
                  <option value="">— Karta tanlang —</option>
                  {user.cards?.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.number || card.id} — {card.balance.toLocaleString()} ball
                    </option>
                  ))}
                </select>
              </div>

              {selectedCard && (
                <div className="selected-card-preview">
                  <div className="preview-label">Tanlangan karta:</div>
                  <div className="preview-card-mini">
                    <div className="mini-card-id">{selectedCard.number || selectedCard.id}</div>
                    <div className="mini-card-balance">{selectedCard.balance.toLocaleString()} ball</div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <FaTag className="label-icon" />
                  Narx (ball)
                </label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Misol: 5000"
                  className="form-input"
                  min="1"
                  disabled={isSelling}
                />
              </div>

              <button
                onClick={handleSell}
                className={`sell-btn ${selectedCard && sellPrice > 0 && !isSelling ? 'active' : 'disabled'}`}
                disabled={!selectedCard || sellPrice <= 0 || isSelling}
              >
                {isSelling ? (
                  <>
                    <div className="loading-spinner"></div>
                    Qo'yilmoqda...
                  </>
                ) : (
                  <>
                    <FaCheck className="btn-icon" />
                    Sotuvga qo'yish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sotuvdagi kartalar */}
        <div className="market-cards-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaStore className="section-icon" />
              Sotuvdagi Kartalar
            </h2>
            <span className="card-count">({marketCards.length} ta)</span>
          </div>

          {marketCards.length > 0 ? (
            <div className="cards-grid">
              {marketCards.map((card) => {
                const canBuy = user.balance >= card.price;
                const buying = isBuying[card.id];

                return (
                  <div key={card.id} className="market-card-item">
                    <div className="card-preview">
                      <div className="card-front">
                        <div className="card-chip"></div>
                        <div className="card-logo">Hamyon</div>
                        <div className="card-number">
                          {(card.number || card.id).replace(/(\d{4})/g, '$1 ').trim()}
                        </div>
                        <div className="card-balance">
                          <FaMoneyBillWave />
                          {card.balance.toLocaleString()} ball
                        </div>
                      </div>
                    </div>

                    <div className="card-details">
                      <div className="detail-item">
                        <FaUser className="detail-icon" />
                        <span>@{card.seller}</span>
                      </div>
                      <div className="detail-item price">
                        <FaTag className="detail-icon" />
                        <strong>{card.price.toLocaleString()} ball</strong>
                      </div>
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span>{card.listedAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(card)}
                      className={`buy-btn ${canBuy ? 'active' : 'disabled'} ${buying ? 'loading' : ''}`}
                      disabled={!canBuy || buying}
                    >
                      {buying ? (
                        <>
                          <div className="loading-spinner"></div>
                          Sotib olinmoqda...
                        </>
                      ) : canBuy ? (
                        <>
                          <FaCheck className="btn-icon" />
                          Sotib olish
                        </>
                      ) : (
                        <>
                          <FaTimes className="btn-icon" />
                          Balans yetarli emas
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">Marketplace</div>
              <p>Hozircha sotuvda kartalar yo'q</p>
              <small>Birinchi bo'lib o'z kartangizni qo'ying!</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;