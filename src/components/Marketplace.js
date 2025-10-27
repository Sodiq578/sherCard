import React, { useState, useEffect } from 'react';
import '../styles/Marketplace.css';

function Marketplace({ user, updateUser }) {
  const [sellCardId, setSellCardId] = useState('');
  const [sellPrice, setSellPrice] = useState(0);
  const [marketCards, setMarketCards] = useState([]);

  useEffect(() => {
    const storedMarket = localStorage.getItem('marketCards');
    if (storedMarket) {
      setMarketCards(JSON.parse(storedMarket));
    }
  }, []);

  const handleSell = () => {
    const card = user.cards.find(c => c.id === sellCardId);
    if (card && sellPrice > 0) {
      const marketCard = {
        ...card,
        seller: user.login,
        price: parseInt(sellPrice),
        listedAt: new Date().toLocaleString()
      };
      
      const newMarketCards = [...marketCards, marketCard];
      setMarketCards(newMarketCards);
      localStorage.setItem('marketCards', JSON.stringify(newMarketCards));

      const updatedUser = {
        ...user,
        cards: user.cards.filter(c => c.id !== sellCardId),
        history: [...user.history, { 
          time: new Date().toLocaleString(), 
          action: 'Karta sotuvga qo\'yildi', 
          amount: sellPrice 
        }],
      };
      updateUser(updatedUser);
      
      alert(`Karta (${sellCardId}) ${sellPrice} ballga sotuvga qo'yildi!`);
      setSellCardId('');
      setSellPrice(0);
    } else {
      alert('Karta topilmadi yoki narx noto\'g\'ri!');
    }
  };

  const handleBuy = (marketCard) => {
    if (user.balance >= marketCard.price) {
      const updatedUser = {
        ...user,
        balance: user.balance - marketCard.price,
        cards: [...user.cards, { 
          id: marketCard.id, 
          balance: marketCard.balance, 
          design: marketCard.design 
        }],
        history: [...user.history, { 
          time: new Date().toLocaleString(), 
          action: 'Karta sotib olindi', 
          amount: marketCard.price 
        }],
      };
      updateUser(updatedUser);

      const newMarketCards = marketCards.filter(c => c.id !== marketCard.id);
      setMarketCards(newMarketCards);
      localStorage.setItem('marketCards', JSON.stringify(newMarketCards));

      alert(`Karta (${marketCard.id}) ${marketCard.price} ballga sotib olindi!`);
    } else {
      alert('Yetarli balans yo\'q!');
    }
  };

  return (
    <div className="marketplace">
      <div className="container">
        <div className="header">
          <h1 className="page-title">Marketplace</h1>
        </div>

        <div className="sell-section">
          <h2 className="section-title">Karta Sotish</h2>
          <div className="sell-form">
            <select 
              value={sellCardId} 
              onChange={(e) => setSellCardId(e.target.value)}
              className="form-select"
            >
              <option value="">Kartani tanlang</option>
              {user.cards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.id} - {card.balance} ball
                </option>
              ))}
            </select>
            <input 
              type="number" 
              value={sellPrice} 
              onChange={(e) => setSellPrice(e.target.value)} 
              placeholder="Narx (ball)" 
              className="form-input"
              min="1" 
              required 
            />
            <button onClick={handleSell} className="sell-btn">Sotuvga qo'yish</button>
          </div>
        </div>

        <div className="market-cards-section">
          <h2 className="section-title">Sotuvdagi Kartalar ({marketCards.length} ta)</h2>
          {marketCards.length > 0 ? (
            <div className="cards-grid">
              {marketCards.map((card, index) => (
                <div key={index} className="market-card">
                  <div className="card-header">
                    <div className="card-id">{card.id}</div>
                    <div className="card-balance">{card.balance} ball</div>
                  </div>
                  <div className="card-info">
                    <div className="card-seller">Sotuvchi: @{card.seller}</div>
                    <div className="card-price">{card.price} ball</div>
                    <div className="card-date">{card.listedAt}</div>
                  </div>
                  <button 
                    onClick={() => handleBuy(card)} 
                    className={`buy-btn ${user.balance >= card.price ? 'active' : 'disabled'}`}
                    disabled={user.balance < card.price}
                  >
                    {user.balance >= card.price ? 'Sotib olish' : 'Balans yetarli emas'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <p>Hozircha sotuvda kartalar yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;