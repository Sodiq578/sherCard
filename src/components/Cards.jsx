// src/components/Cards.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import "../styles/Cards.css";
import Logo from "../assets/images/logo.png";
import CardFrontImage from "../assets/images/card.png";
import CardBackImage from "../assets/images/cardback.png";

function Cards({ user, updateUser }) {
  const navigate = useNavigate();

  // ---- holatlar ----
  const [flippedCards, setFlippedCards] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBuyCardModal, setShowBuyCardModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
  const [previewNormalNumber, setPreviewNormalNumber] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCardNumber, setCopiedCardNumber] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showActionsFor, setShowActionsFor] = useState(null);

  // ---- yordamchi funksiyalar ----
  const generateNormalCardNumber = () => {
    let num = "";
    for (let i = 0; i < 12; i++) num += Math.floor(Math.random() * 10);
    return num;
  };

  useEffect(() => {
    if (showBuyCardModal) {
      setIsGenerating(true);
      setTimeout(() => {
        setPreviewNormalNumber(generateNormalCardNumber());
        setIsGenerating(false);
      }, 800);
    }
  }, [showBuyCardModal]);

  const getVirtualCardNumber = () => {
    const key = `virtual_${user.login}`;
    const saved = localStorage.getItem(key);
    if (saved && saved.length === 12) return saved;
    const newNum = generateNormalCardNumber();
    localStorage.setItem(key, newNum);
    return newNum;
  };

  const generatePhysicalCard = () => {
    const price = 2000;
    if (user.balance < price) {
      alert(`Yetarli mablag' yo'q! Kerak: ${price.toLocaleString()} UZS`);
      return;
    }
    const newCard = {
      id: `card_${Date.now()}`,
      number: previewNormalNumber,
      balance: 0,
      type: "physical",
      createdAt: new Date().toLocaleString("uz-UZ"),
      deleted: false,
    };
    const updatedUser = {
      ...user,
      balance: user.balance - price,
      cards: [...(user.cards || []), newCard],
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Oddiy karta sotib olindi",
          amount: `-${price.toLocaleString()} UZS`,
        },
      ],
    };
    updateUser(updatedUser);
    setShowBuyCardModal(false);
    alert(`Karta yaratildi!\nRaqam: ${formatCardNumber(previewNormalNumber)}`);
  };

  const formatCardNumber = (num) =>
    num ? num.replace(/(\d{4})/g, "$1 ").trim() : "";

  const virtualCard = {
    id: "virtual",
    number: getVirtualCardNumber(),
    balance: user.balance || 0,
    type: "virtual",
  };
  const allCards = [virtualCard, ...(user.cards?.filter((c) => !c.deleted) || [])];
  const displayName = user.profile?.name || user.login || "Foydalanuvchi";
  const totalBalance = allCards.reduce(
    (sum, card) => sum + (card.balance || 0),
    0
  );

  // ---- flip ----
  const toggleFlip = (cardId) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // ---- swipe (touch) ----
  const handleTouchStart = (cardId, e) => {
    setTouchStart({ x: e.touches[0].clientX, cardId });
  };
  const handleTouchEnd = (cardId, e) => {
    if (!touchStart) return;
    const diffX = e.changedTouches[0].clientX - touchStart.x;
    if (Math.abs(diffX) > 50) toggleFlip(cardId);
    setTouchStart(null);
  };

  // ---- copy number ----
  const copyCardNumber = async (cardNumber) => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopiedCardNumber(cardNumber);
      setTimeout(() => setCopiedCardNumber(null), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = cardNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedCardNumber(cardNumber);
      setTimeout(() => setCopiedCardNumber(null), 2000);
    }
  };

  // ---- long press (800 ms) ----
  const handleLongPressStart = (cardId, e) => {
    e.preventDefault();
    const timer = setTimeout(() => setShowActionsFor(cardId), 800);
    setLongPressTimer(timer);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  return (
    <div className="cards-page">
      <div className="cards-container">
        {/* ==== HEADER ==== */}
        <div className="cards-header">
          <h2>Mening Kartalarim</h2>
          <button
            className="add-card-btn"
            onClick={() => setShowBuyCardModal(true)}
          >
            + Yangi karta
          </button>
        </div>

        {/* ==== KARTALAR GRID ==== */}
        <div className="cards-grid">
          {allCards.map((card) => {
            const isFlipped = flippedCards[card.id];
            const actionsVisible = showActionsFor === card.id;

            return (
              <div key={card.id} className="card-box">
                {/* ---- KARTA O'ZI ---- */}
                <div
                  className={`card-wrapper ${isFlipped ? "flipped" : ""}`}
                  onClick={() => toggleFlip(card.id)}
                  onTouchStart={(e) => {
                    handleTouchStart(card.id, e);
                    handleLongPressStart(card.id, e);
                  }}
                  onTouchEnd={(e) => {
                    handleTouchEnd(card.id, e);
                    handleLongPressEnd();
                  }}
                  onMouseDown={(e) => handleLongPressStart(card.id, e)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                >
                  {/* OLD TOMON - card.png rasmi bilan */}
                  <div 
                    className="card-side card-front"
                    style={{ backgroundImage: `url(${CardFrontImage})` }}
                  >
               
                    
                    <div className="card-top">
                      <img src={Logo} alt="Logo" className="logo-img" />
                       
                    </div>
                    
                    <div className="card-middle">
                      <div className="card-name">{displayName}</div>
                      <div className="card-balance">
                        {card.balance.toLocaleString()} UZS
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="card-number">
                        {formatCardNumber(card.number)}
                      </div>
                      <div className="card-type">
                        <span>{card.type === 'virtual' ? 'Virtual' : 'Plastik'}</span>
                        <span className="visa-logo">VISA</span>
                      </div>
                    </div>
                  </div>

                  {/* ORQA TOMON - cardback.png rasmi bilan */}
                  <div 
                    className="card-side card-back"
                    style={{ backgroundImage: `url(${CardBackImage})` }}
                  >
                 
                    
                   
                    
                    <div className="back-content">
                      <div className="qr-section">
                        <div className="qr-container">
                          <QRCodeCanvas
                            value={card.number}
                            size={80}
                            bgColor="#fff"
                            fgColor="#000"
                          />
                        </div>
                        <div className="card-number-back">
                          {formatCardNumber(card.number)}
                        </div>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCardNumber(card.number);
                        }}
                      >
                        {copiedCardNumber === card.number ? "Nusqalandi" : "Raqamni nusxalash"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3 NUQTA TUGMASI */}
                <button
                  className="more-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsFor(card.id);
                  }}
                >
                  ⋯
                </button>

                {/* ACTIONS (faqat kerak bo'lganda) */}
                {actionsVisible && (
                  <div className="card-actions visible">
                    <button
                      className="topup-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTopupModal(card.id);
                        setShowActionsFor(null);
                      }}
                    >
                      To'ldirish
                    </button>
                    {card.id !== "virtual" && (
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(card.id);
                          setShowActionsFor(null);
                        }}
                      >
                        O'chirish
                      </button>
                    )}
                    <button
                      className="close-actions-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionsFor(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ==== JAMI BALANS ==== */}
        <div className="total-balance-section">
          <div className="total-balance-card">
            <div className="total-header">
              <img src={Logo} alt="Logo" className="total-logo" />
              <h3>Jami balans</h3>
            </div>
            <div className="total-amount">
              {totalBalance.toLocaleString()} UZS
            </div>
            <p className="total-cards">Jami: {allCards.length} ta karta</p>
          </div>
        </div>
      </div>

      {/* ==== YANGI KARTA MODALI ==== */}
      {showBuyCardModal && (
        <div
          className="modal-overlay show"
          onClick={() => setShowBuyCardModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Yangi karta</h3>
            <div className="balance-info">
              Joriy balans:{" "}
              <strong>{user.balance.toLocaleString()} UZS</strong>
            </div>
            <div className="card-preview-box">
              <div 
                className="card-preview"
                style={{ backgroundImage: `url(${CardFrontImage})` }}
              >
                <div className="card-overlay"></div>
                <div className="preview-top">
                  <img src={Logo} alt="Logo" />
                  <div className="chip-icon"></div>
                </div>
                <div className="preview-middle">
                  <div className="preview-name">{displayName}</div>
                  <div className="preview-number">
                    {isGenerating
                      ? "•••• •••• ••••"
                      : formatCardNumber(previewNormalNumber)}
                  </div>
                </div>
                <div className="preview-footer">
                  <div className="card-type">
                    <span>Plastik</span>
                    <span className="visa-logo">VISA</span>
                  </div>
                </div>
              </div>
              <div className="price">Narxi: 2,000 UZS</div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowBuyCardModal(false)}
              >
                Bekor
              </button>
              <button
                className="btn-confirm"
                disabled={user.balance < 2000 || isGenerating}
                onClick={generatePhysicalCard}
              >
                {isGenerating ? "Yuklanmoqda..." : "Sotib olish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== TO'LDIRISH MODALI ==== */}
      {showTopupModal && (
        <div
          className="modal-overlay show"
          onClick={() => setShowTopupModal(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Balans to'ldirish</h3>
            <div className="quick-amounts">
              {[50000, 100000, 200000, 500000].map((amount) => (
                <button
                  key={amount}
                  className={`quick-btn ${
                    selectedQuickAmount === amount ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedQuickAmount(amount);
                    setTopupAmount("");
                  }}
                >
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Boshqa summa"
              value={topupAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setTopupAmount(
                  val ? parseInt(val).toLocaleString() + " UZS" : ""
                );
                setSelectedQuickAmount(null);
              }}
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowTopupModal(null)}
              >
                Bekor
              </button>
              <button
                className="btn-confirm"
                onClick={() => {
                  const amount =
                    selectedQuickAmount ||
                    parseInt(topupAmount.replace(/\D/g, ""), 10);
                  if (!amount || amount <= 0)
                    return alert("Summa kiriting!");
                  const idx = allCards.findIndex(
                    (c) => c.id === showTopupModal
                  );
                  if (idx === -1) return;
                  const updated = [...allCards];
                  updated[idx].balance += amount;
                  updateUser({
                    ...user,
                    balance: user.balance + amount,
                    cards:
                      user.cards?.map((c) =>
                        c.id === showTopupModal
                          ? { ...c, balance: c.balance + amount }
                          : c
                      ) || [],
                  });
                  setShowTopupModal(null);
                  alert(`${amount.toLocaleString()} UZS to'ldirildi!`);
                }}
                disabled={!selectedQuickAmount && !topupAmount}
              >
                To'ldirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== O'CHIRISH TASDIQLASH MODALI ==== */}
      {showDeleteConfirm && (
        <div className="modal-overlay show">
          <div className="modal">
            <h3>Kartani o'chirish</h3>
            <p>Bu amalni ortga qaytarib bo'lmaydi. Davom etasizmi?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Yo'q
              </button>
              <button
                className="btn-confirm"
                onClick={() => {
                  if (showDeleteConfirm === "virtual") {
                    localStorage.removeItem(`virtual_${user.login}`);
                  } else {
                    updateUser({
                      ...user,
                      cards: user.cards.map((c) =>
                        c.id === showDeleteConfirm ? { ...c, deleted: true } : c
                      ),
                    });
                  }
                  setShowDeleteConfirm(null);
                }}
              >
                Ha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cards;