// src/components/Cards.jsx
import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import "../styles/Cards.css";
import Logo from "../assets/images/logo.png";

function Cards({ user, updateUser }) {
  const navigate = useNavigate();
  const [flippedCards, setFlippedCards] = useState({});
  const [swipedCards, setSwipedCards] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBuyCardModal, setShowBuyCardModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState(null);
  const cardRefs = useRef({});

  // Virtual karta raqami (16 ta)
  const getVirtualCardNumber = () => {
    const key = `virtual_${user.login}`;
    const saved = localStorage.getItem(key);
    if (saved) return saved;

    let card = "8600"; // O‘zbekiston kartalari uchun prefiks
    for (let i = 0; i < 12; i++) {
      card += Math.floor(Math.random() * 10);
    }
    localStorage.setItem(key, card);
    return card;
  };

  // Yangi haqiqiy karta yaratish
  const generatePhysicalCard = (type) => {
   const prices = { 
  silver: 50, 
  gold: 100, 
  platinum: 250 
};

    const price = prices[type];

    if (user.balance < price) {
      alert(`Yetarli mablag‘ yo‘q! Kerak: ${price.toLocaleString()} UZS`);
      return;
    }

    const cardNumber = "8600" + Math.random().toString().slice(2, 14);
    const newCard = {
      id: `card_${Date.now()}`,
      number: cardNumber,
      balance: 0,
      type: "physical",
      cardType: type,
      createdAt: new Date().toLocaleString("uz-UZ"),
    };

    const updatedUser = {
      ...user,
      balance: user.balance - price,
      cards: [...(user.cards || []), newCard],
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: `${type.toUpperCase()} karta sotib olindi`,
          amount: `-${price.toLocaleString()} UZS`,
        },
      ],
    };

    updateUser(updatedUser);
    setShowBuyCardModal(false);
    setSelectedCardType(null);
    alert(`${type.toUpperCase()} karta muvaffaqiyatli sotib olindi!`);
  };

  const virtualCard = {
    id: "virtual",
    number: getVirtualCardNumber(),
    balance: user.balance || 0,
    type: "virtual",
  };

  const allCards = [virtualCard, ...(user.cards || [])];
  const displayName = user.profile?.name || user.login || "Foydalanuvchi";
  const phone = user.profile?.phone || "";
  const totalBalance = allCards.reduce((sum, card) => sum + (card.balance || 0), 0);

  // Karta o‘chirish
  const confirmDelete = (cardId) => setShowDeleteConfirm(cardId);

  const deleteCard = (cardId) => {
    if (cardId === "virtual") {
      localStorage.removeItem(`virtual_${user.login}`);
    } else {
      const updatedUser = {
        ...user,
        cards: user.cards.filter(c => c.id !== cardId),
      };
      updateUser(updatedUser);
    }
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => setShowDeleteConfirm(null);

  // Swipe funksiyalari
  const handleTouchStart = (e, cardId) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const card = cardRefs.current[cardId];
    if (!card) return;

    const handleMove = (moveEvent) => {
      const diffX = moveEvent.touches[0].clientX - startX;
      if (diffX > 50) {
        card.style.transform = `translateX(${diffX}px) rotate(${diffX / 10}deg)`;
        if (diffX > 150) setSwipedCards(prev => ({ ...prev, [cardId]: true }));
      }
    };

    const handleEnd = () => {
      const diffX = e.changedTouches[0].clientX - startX;
      if (diffX > 150) confirmDelete(cardId);
      else card.style.transform = "";
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
  };

  const handleMouseDown = (e, cardId) => {
    const startX = e.clientX;
    const card = cardRefs.current[cardId];
    if (!card) return;

    const handleMove = (moveEvent) => {
      const diffX = moveEvent.clientX - startX;
      if (diffX > 50) {
        card.style.transform = `translateX(${diffX}px) rotate(${diffX / 10}deg)`;
        if (diffX > 150) setSwipedCards(prev => ({ ...prev, [cardId]: true }));
      }
    };

    const handleEnd = () => {
      const diffX = e.clientX - startX;
      if (diffX > 150) confirmDelete(cardId);
      else card.style.transform = "";
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  };

  const toggleFlip = (cardId) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  return (
    <div className="cards-page">
      <div className="cards-container">
        {/* Header */}
        <div className="cards-header">
          <h2>Mening Kartalarim</h2>
          <div className="header-right">
            <p className="total-cards">Jami: {allCards.length} ta</p>
            <button
              className="add-card-btn"
              onClick={() => setShowBuyCardModal(true)}
            >
              + Yangi karta
            </button>
          </div>
        </div>

        {/* Kartalar */}
        <div className="cards-grid">
          {allCards.map((card) => {
            const isFlipped = flippedCards[card.id];
            const isSwiped = swipedCards[card.id];

            return (
              <div
                key={card.id}
                className={`card-item-real ${card.type === "virtual" ? "virtual" : ""}`}
                ref={(el) => (cardRefs.current[card.id] = el)}
                onMouseDown={(e) => handleMouseDown(e, card.id)}
                onTouchStart={(e) => handleTouchStart(e, card.id)}
                style={{
                  transform: isSwiped ? "translateX(200px)" : "",
                  opacity: isSwiped ? 0.7 : 1,
                  transition: showDeleteConfirm ? "none" : "all 0.3s ease",
                }}
              >
                <div
                  className={`card-wrapper-real ${isFlipped ? "flipped" : ""}`}
                  onClick={(e) => {
                    if (!isSwiped) toggleFlip(card.id);
                  }}
                >
                  {/* Old tomon */}
                  <div className="card-side-real card-front-real">
                    <div className="card-top">
                      <img src={Logo} alt="Logo" className="logo-img-small" />
                      {card.cardType && (
                        <span className={`card-badge ${card.cardType}`}>
                          {card.cardType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="card-middle">
                      <div className="card-user-info">
                        <div className="card-name">{displayName}</div>
                        {phone && <div className="card-phone">{phone}</div>}
                      </div>
                      <div className="card-balance-real">
                        {card.balance.toLocaleString()} <img src={Logo} alt="sum" className="balance-logo-small" />
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="card-number">
                        {card.number.replace(/(\d{4})/g, "$1 ").trim()}
                      </div>
                    </div>
                  </div>

                  {/* Orqa tomon */}
                  <div className="card-side-real card-back-real">
                    <div className="qr-container-real">
                      <QRCodeCanvas value={card.number} size={60} bgColor="#fff" fgColor="#000" />
                    </div>
                    <div className="card-number-back">{card.number.slice(-4)}</div>
                  </div>
                </div>

                {isSwiped && !showDeleteConfirm && (
                  <div className="delete-hint">O‘chirish uchun suring</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Jami balans */}
        <div className="total-balance-section">
          <div className="total-balance-card">
            <div className="total-balance-header">
              <img src={Logo} alt="Logo" className="total-balance-logo" />
              <h3>Jami balans</h3>
            </div>
            <div className="total-balance-amount">
              {totalBalance.toLocaleString()} UZS
            </div>
          </div>
        </div>
      </div>

      {/* === YANGI KARTA SOTIB OLISH MODALI === */}
      {showBuyCardModal && (
        <div className="buy-card-overlay" onClick={() => setShowBuyCardModal(false)}>
          <div className="buy-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Yangi karta sotib olish</h3>
              <button className="close-btn" onClick={() => setShowBuyCardModal(false)}>×</button>
            </div>

            <div className="card-options">
              {[
                { type: "silver", price: 50000, color: "#c0c0c0" },
                { type: "gold", price: 100000, color: "#ffd700" },
                { type: "platinum", price: 250000, color: "#e5e4e2" },
              ].map((card) => (
                <div
                  key={card.type}
                  className={`card-option ${selectedCardType === card.type ? "selected" : ""}`}
                  onClick={() => setSelectedCardType(card.type)}
                >
                  <div className="card-preview" style={{ background: card.color }}>
                    <img src={Logo} alt="Logo" className="preview-logo" />
                    <span className="card-type-name">{card.type.toUpperCase()}</span>
                  </div>
                  <div className="card-price">
                    {card.price.toLocaleString()} UZS
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowBuyCardModal(false)}
              >
                Bekor qilish
              </button>
              <button
                className="btn-confirm"
                disabled={!selectedCardType}
                onClick={() => generatePhysicalCard(selectedCardType)}
              >
                Sotib olish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === O‘CHIRISH TASDIQLASH === */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Kartani o‘chirish</h3>
            <p>Bu amalni ortga qaytarib bo‘lmaydi. Davom etasizmi?</p>
            <div className="delete-confirm-buttons">
              <button className="btn-cancel" onClick={cancelDelete}>
                Yo‘q
              </button>
              <button className="btn-confirm" onClick={() => deleteCard(showDeleteConfirm)}>
                Ha, o‘chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cards;