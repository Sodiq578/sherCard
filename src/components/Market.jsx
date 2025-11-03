// src/components/Market.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getShops } from "../data/shops";
import ValyutaLogo from "../assets/images/logo.png";
import CardIcon from "../assets/images/card.png";
import MarketIcon from "../assets/images/market.png";
import "../styles/Market.css";

function Market({ user, updateUser }) {
  const navigate = useNavigate();
  const shops = getShops();

  // Virtual karta raqamini yaratish yoki olish
  const getCardNumber = (key) => {
    const saved = localStorage.getItem(`cardNumber_${key}`);
    if (saved) return saved;
    let card = "";
    for (let i = 0; i < 16; i++) {
      card += Math.floor(Math.random() * 10);
    }
    localStorage.setItem(`cardNumber_${key}`, card);
    return card;
  };

  const virtualCard = {
    id: "virtual",
    number: getCardNumber(user.login),
    balance: user.balance || 0,
  };

  const displayName = user.profile?.name || user.login || "Foydalanuvchi";

  // Chegirmadagi mahsulotlar
  const promotions = [
    { id: 1, name: "Pitsa 1+1", price: 1000, image: "https://via.placeholder.com/120?text=Pitsa" },
    { id: 2, name: "Burger + Cola", price: 800, image: "https://via.placeholder.com/120?text=Burger" },
    { id: 3, name: "Shaurma", price: 600, image: "https://via.placeholder.com/120?text=Shaurma" },
    { id: 4, name: "Kola 1L", price: 500, image: "https://via.placeholder.com/120?text=Kola" },
    { id: 5, name: "Salat", price: 700, image: "https://via.placeholder.com/120?text=Salat" },
    { id: 6, name: "Kofe", price: 400, image: "https://via.placeholder.com/120?text=Kofe" },
  ];

  // Sotib olish funksiyasi
  const handleBuy = (item) => {
    if ((user.balance || 0) < item.price) {
      alert("Balans yetarli emas!");
      return;
    }
    const updatedUser = {
      ...user,
      balance: (user.balance || 0) - item.price,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString(),
          action: `Sotib olindi: ${item.name}`,
          amount: -item.price,
        },
      ],
    };
    updateUser(updatedUser);
    alert(`${item.name} muvaffaqiyatli sotib olindi!`);
  };

  // Format card number for display
  const formatCardNumber = (number) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="market-page">
      <div className="market-container">

        {/* Header */}
        <div className="market-header">
          <h2>Market</h2>
          <div className="balance-display">
            <img src={ValyutaLogo} alt="sum" className="balance-logo-small" />
            <span>{(user?.balance || 0).toLocaleString()}</span>
          </div>
        </div>

 

        {/* Kartalar va Market tugmalari */}
        <section className="action-buttons">
          <div className="action-grid">
            <div onClick={() => navigate("/cards")} className="action-item">
              <img src={CardIcon} alt="Kartalar" className="action-icon" />
              <p>Kartalar</p>
            </div>
            <div onClick={() => navigate("/marketplace")} className="action-item">
              <img src={MarketIcon} alt="Do'konlar" className="action-icon" />
              <p>Do'konlar</p>
            </div>
          </div>
        </section>

        {/* Chegirmadagi mahsulotlar */}
        <section className="promotions-section">
          <div className="section-header">
            <h3>Chegirmadagi mahsulotlar</h3>
            <button className="view-all-btn">Barchasi</button>
          </div>
          <div className="promotions-grid">
            {promotions.map((item) => (
              <div key={item.id} className="promo-card-small">
                <img src={item.image} alt={item.name} className="promo-img-small" />
                <div className="promo-info-small">
                  <h4>{item.name}</h4>
                  <p className="price-small">{item.price.toLocaleString()} so'm</p>
                  <button className="buy-btn-small" onClick={() => handleBuy(item)}>
                    Sotib olish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Market;