// Cards.jsx
import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/Cards.css";
import Logo from "../assets/images/logo.png";

function Cards({ user }) {
  const [flippedCards, setFlippedCards] = useState({});
  const [swipedCards, setSwipedCards] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const cardRefs = useRef({});

  const toggleFlip = (cardId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

// Virtual karta raqamini yaratish (16 ta raqam)
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
    type: "virtual",
  };

  const allCards = [virtualCard, ...(user.cards || [])];

  const displayName = user.profile?.name || user.login || "Foydalanuvchi";
  const phone = user.profile?.phone || "";

  // Jami balans
  const totalBalance = allCards.reduce((sum, card) => sum + (card.balance || 0), 0);

  // O'chirish tasdiqlash
  const confirmDelete = (cardId) => {
    setShowDeleteConfirm(cardId);
  };

  const deleteCard = (cardId) => {
    if (cardId === "virtual") {
      localStorage.removeItem(`cardNumber_${user.login}`);
    } else {
      // Haqiqiy kartalarni o'chirish (masalan, API yoki state orqali)
      // Bu yerda faqat UI dan olib tashlaymiz
    }
    setSwipedCards((prev) => ({ ...prev, [cardId]: false }));
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    // Kartani orqaga qaytarish
    setSwipedCards((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id]) updated[id] = false;
      });
      return updated;
    });
  };

  // Swipe boshlanishi
  const handleTouchStart = (e, cardId) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const card = cardRefs.current[cardId];
    if (!card) return;

    const handleMove = (moveEvent) => {
      const currentX = moveEvent.touches[0].clientX;
      const diffX = currentX - startX;

      if (diffX > 50) {
        card.style.transform = `translateX(${diffX}px) rotate(${diffX / 10}deg)`;
        if (diffX > 150) {
          setSwipedCards((prev) => ({ ...prev, [cardId]: true }));
        }
      }
    };

    const handleEnd = (endEvent) => {
      const endX = endEvent.changedTouches[0].clientX;
      const diffX = endX - startX;

      if (diffX > 150) {
        confirmDelete(cardId);
      } else {
        card.style.transform = "";
      }

      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
  };

  // Mouse uchun (desktop)
  const handleMouseDown = (e, cardId) => {
    const startX = e.clientX;
    const card = cardRefs.current[cardId];
    if (!card) return;

    const handleMove = (moveEvent) => {
      const diffX = moveEvent.clientX - startX;
      if (diffX > 50) {
        card.style.transform = `translateX(${diffX}px) rotate(${diffX / 10}deg)`;
        if (diffX > 150) {
          setSwipedCards((prev) => ({ ...prev, [cardId]: true }));
        }
      }
    };

    const handleEnd = () => {
      const diffX = e.clientX - startX;
      if (diffX > 150) {
        confirmDelete(cardId);
      } else {
        card.style.transform = "";
      }
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  };

  return (
    <div className="cards-page">
      <div className="cards-container">
        {/* Header */}
        <div className="cards-header">
          <h2>Mening Kartalarim</h2>
          <p className="total-cards">Jami: {allCards.length} ta</p>
        </div>

        {/* Kartalar */}
        <div className="cards-grid">
          {allCards.map((card, i) => {
            const isFlipped = flippedCards[card.id];
            const cardNumber = card.number || card.id;
            const isSwiped = swipedCards[card.id];

            return (
              <div
                key={card.id}
                className="card-item-real"
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
                        {cardNumber.replace(/(\d{4})/g, "$1 ").trim()}
                      </div>
                     
                    </div>
                  </div>

                  {/* Orqa tomon */}
                  <div className="card-side-real card-back-real">
                    <div className="qr-container-real">
                      <QRCodeCanvas value={cardNumber} size={50} bgColor="#fff" fgColor="#000" />
                    </div>
                    <div className="card-number-back">{cardNumber.slice(-4)}</div>
                  </div>
                </div>

                {/* O'chirish ko'rsatkichi */}
                {isSwiped && !showDeleteConfirm && (
                  <div className="delete-hint">O'chirish uchun suring →</div>
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
              {totalBalance.toLocaleString()} so'm
            </div>
          </div>
        </div>
      </div>

      {/* Tasdiqlash oynasi */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Kartani o'chirish</h3>
            <p>Bu kartani o'chirishni xohlaysizmi?</p>
            <div className="delete-confirm-buttons">
              <button className="btn-cancel" onClick={cancelDelete}>
                Yo'q
              </button>
              <button className="btn-confirm" onClick={() => deleteCard(showDeleteConfirm)}>
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cards;