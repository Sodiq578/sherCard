import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";   // Chevron ikonka
import "../styles/Cards.css";
import Logo from "../assets/images/logo.png";
import CardFrontImage from "../assets/images/cardorg.png";
import GoldCardImage from "../assets/images/cardorg.png";
import CardBackImage from "../assets/images/cardorg.png";

function Cards({ user, updateUser }) {
  const navigate = useNavigate();

  // ==== HOLATLAR ====
  const [flippedCards, setFlippedCards] = useState({});
  const [showBuyCardModal, setShowBuyCardModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewNormalNumber, setPreviewNormalNumber] = useState("");
  const [selectedCardType, setSelectedCardType] = useState("normal");
  const [copiedCardNumber, setCopiedCardNumber] = useState(null);

  // ==== ALERT MODAL HOLATI ====
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // ==== YORDAMCHI FUNKSIYALAR ====
  const generateNormalCardNumber = () => {
    let num = "";
    for (let i = 0; i < 12; i++) num += Math.floor(Math.random() * 10);
    return num;
  };

  const generateGoldCardNumber = () => {
    const patterns = ["7777", "8888", "9999", "777888", "999777"];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    let num = "";
    while (num.length < 12) num += randomPattern;
    return num.slice(0, 12);
  };

  useEffect(() => {
    if (showBuyCardModal) {
      setIsGenerating(true);
      setTimeout(() => {
        const num =
          selectedCardType === "gold"
            ? generateGoldCardNumber()
            : generateNormalCardNumber();
        setPreviewNormalNumber(num);
        setIsGenerating(false);
      }, 800);
    }
  }, [showBuyCardModal, selectedCardType]);

  const getVirtualCardNumber = () => {
    const key = `virtual_${user.login}`;
    const saved = localStorage.getItem(key);
    if (saved && saved.length === 12) return saved;
    const newNum = generateNormalCardNumber();
    localStorage.setItem(key, newNum);
    return newNum;
  };

  const formatCardNumber = (num) =>
    num ? num.replace(/(\d{4})/g, "$1 ").trim() : "";

  // ==== YANGI KARTA YARATISH ====
  const generatePhysicalCard = () => {
    const price = selectedCardType === "gold" ? 10000 : 2000;
    if (user.balance < price) {
      setAlertMessage(
        `Yetarli mablag' yo'q! Kerak: ${price.toLocaleString()} UZS`
      );
      setShowAlert(true);
      return;
    }

    const newCard = {
      id: `card_${Date.now()}`,
      number: previewNormalNumber,
      balance: 0,
      type: selectedCardType === "gold" ? "gold" : "physical",
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
          action:
            selectedCardType === "gold"
              ? "Gold karta sotib olindi"
              : "Oddiy karta sotib olindi",
          amount: `-${price.toLocaleString()} UZS`,
        },
      ],
    };

    updateUser(updatedUser);
    setShowBuyCardModal(false);

    setAlertMessage(
      `${selectedCardType === "gold" ? "Gold" : "Oddiy"
      } karta yaratildi!\nRaqam: ${formatCardNumber(previewNormalNumber)}`
    );
    setShowAlert(true);
  };

  // ==== KARTALAR ====
  const virtualCard = {
    id: "virtual",
    number: getVirtualCardNumber(),
    balance: user.balance || 0,
    type: "virtual",
  };

  const allCards = [
    virtualCard,
    ...(user.cards?.filter((c) => !c.deleted) || []),
  ];

  const displayName = user.profile?.name || user.login || "Foydalanuvchi";
  const totalBalance = allCards.reduce(
    (sum, card) => sum + (card.balance || 0),
    0
  );

  const toggleFlip = (cardId) => {
    setFlippedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const copyCardNumber = async (cardNumber) => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopiedCardNumber(cardNumber);
      setTimeout(() => setCopiedCardNumber(null), 2000);
    } catch {
      setCopiedCardNumber(cardNumber);
      setTimeout(() => setCopiedCardNumber(null), 2000);
    }
  };

  return (
    <div className="cards-page">
      <div className="cards-container">
        {/* ==== HEADER: CHEVRON + SARLAVHA + YANGI KARTA ==== */}
  <div className="cards-header">
  <div className="header-box">
    <button
      className="back-chevron-btn"
      onClick={() => navigate(-1)}
      aria-label="Orqaga"
    >
      <FiChevronLeft size={24} /> {/* 28 emas, 24 — mobilga mos */}
    </button>

    <h2>Mening Kartalarim</h2>
  </div>

  <button
    className="add-card-btn"
    onClick={() => {
      setSelectedCardType("normal");
      setShowBuyCardModal(true);
    }}
  >
    + Yangi karta
  </button>
</div>

        {/* ==== KARTALAR GRID ==== */}
        <div className="cards-grid">
          {allCards.map((card) => (
            <div key={card.id} className="card-box">
              <div
                className={`card-wrapper ${flippedCards[card.id] ? "flipped" : ""
                  }`}
                onClick={() => toggleFlip(card.id)}
              >
                {/* FRONT */}
                <div
                  className="card-side card-front"
                  style={{
                    backgroundImage: `url(${card.type === "gold" ? GoldCardImage : CardFrontImage
                      })`,
                  }}
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
                      {card.type === "gold"
                        ? "Gold"
                        : card.type === "virtual"
                          ? "Oddiy"
                          : "Plastik"}
                    </div>
                  </div>
                </div>

                {/* BACK */}
                <div
                  className="card-side card-back"
                  style={{ backgroundImage: `url(${CardBackImage})` }}
                >
                  <div className="back-content">
                    <QRCodeCanvas
                      value={card.number}
                      size={80}
                      bgColor="#fff"
                      fgColor="#000"
                    />
                    <div className="card-number-back">
                      {formatCardNumber(card.number)}
                    </div>
                    <button
                      className="copy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCardNumber(card.number);
                      }}
                    >
                      {copiedCardNumber === card.number
                        ? "Nusxa olindi"
                        : "Raqamni nusxalash"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
          className="buycard-overlay active"
          onClick={() => setShowBuyCardModal(false)}
        >
          <div className="buycard-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="buycard-title">Yangi karta</h3>

            <div className="card-type-select">
              <button
                className={`type-btn ${selectedCardType === "normal" ? "active" : ""
                  }`}
                onClick={() => setSelectedCardType("normal")}
              >
                Oddiy (2,000 UZS)
              </button>
              <button
                className={`type-btn ${selectedCardType === "gold" ? "active" : ""
                  }`}
                onClick={() => setSelectedCardType("gold")}
              >
                Gold (10,000 UZS)
              </button>
            </div>

            <div className="buycard-balance">
              Joriy balans: <strong>{user.balance.toLocaleString()} UZS</strong>
            </div>

            <div className="buycard-preview-wrapper">
              <div
                className="buycard-preview"
                style={{
                  backgroundImage: `url(${selectedCardType === "gold"
                    ? GoldCardImage
                    : CardFrontImage
                    })`,
                }}
              >
                <div className="buycard-header">
                  <img src={Logo} alt="Logo" />
                </div>

                <div className="buycard-body">
                  <div className="buycard-username">{displayName}</div>
                  <div className="buycard-number">
                    {isGenerating
                      ? "•••• •••• ••••"
                      : formatCardNumber(previewNormalNumber)}
                  </div>
                </div>
              </div>

              <div className="buycard-price">
                Narxi:{" "}
                {selectedCardType === "gold" ? "10,000 UZS" : "2,000 UZS"}
              </div>
            </div>

            <div className="buycard-actions">
              <button
                className="buycard-btn cancel"
                onClick={() => setShowBuyCardModal(false)}
              >
                Bekor
              </button>
              <button
                className="buycard-btn confirm"
                disabled={
                  user.balance <
                  (selectedCardType === "gold" ? 10000 : 2000) || isGenerating
                }
                onClick={generatePhysicalCard}
              >
                {isGenerating ? "Yuklanmoqda..." : "Sotib olish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== ALERT MODAL ==== */}
      {showAlert && (
        <div className="alert-overlay" onClick={() => setShowAlert(false)}>
          <div className="alert-box" onClick={(e) => e.stopPropagation()}>
            <p>{alertMessage}</p>
            <button onClick={() => setShowAlert(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cards;