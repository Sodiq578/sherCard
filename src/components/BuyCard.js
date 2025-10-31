import React, { useState } from "react";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaShoppingCart,
  FaPlus,
  FaCheck,
  FaTimes,
  FaWallet,
} from "react-icons/fa";
import "../styles/BuyCard.css";
import CardValyuta from "../assets/images/logo.png";

function BuyCard({ user, updateUser }) {
  const [cardBalance, setCardBalance] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const price = 1000;

  const generateCardNumber = () => {
    let cardNumber = "8600";
    for (let i = 0; i < 8; i++) cardNumber += Math.floor(Math.random() * 10);
    return cardNumber.replace(/(\d{4})/g, "$1 ").trim();
  };

  const [previewCardNumber] = useState(generateCardNumber());

  const handleBuy = async () => {
    const balance = parseInt(cardBalance);
    if (!balance || balance <= 0) return alert("Iltimos, karta balansini to'g'ri kiriting!");
    if (user.balance < price) return alert("Balans yetarli emas!");

    setIsPurchasing(true);
    await new Promise((r) => setTimeout(r, 1500));

    const cardNumber = generateCardNumber();
    const newCard = {
      id: cardNumber.replace(/\s/g, ""),
      number: cardNumber,
      balance,
      design: "orange",
      type: "real",
      createdAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      balance: user.balance - price,
      cards: [...(user.cards || []), newCard],
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Yangi karta sotib olindi",
          amount: -price,
          details: `Karta: ${cardNumber}, Balans: ${balance}`,
          type: "purchase",
        },
      ],
    };

    updateUser(updatedUser);
    setCardBalance("");
    setIsPurchasing(false);
    alert(`✅ Karta olindi!\n💳 ${cardNumber}\n💰 Balans: ${balance.toLocaleString()} so‘m`);
  };

  const canBuy = user.balance >= price && cardBalance > 0;

  return (
    <div className="buy-card-page">
      <div className="buy-card-container">
        <div className="buy-card-header">
          <h1 className="page-title">
            <FaCreditCard className="title-icon" />
            Yangi karta sotib olish
          </h1>
          <p className="user-balance-info">
            <FaWallet className="balance-header-icon" />
            Balans:{" "}
            <strong className="valyuta-text">
              {user.balance?.toLocaleString() || 0}
              <img src={CardValyuta} alt="so‘m" className="inline-valyuta-icon" />
            </strong>
          </p>
        </div>

        <div className="buy-card-flex">
          {/* KARTA */}
          <div className="preview-card orange-theme">
            <div className="preview-card-header">
              <div className="preview-chip"></div>
              <div className="preview-logo">
                <FaWallet /> Hamyon
              </div>
            </div>

            <div className="preview-card-number">
              {previewCardNumber.replace(/\d{4}(?=.)/g, "**** ")}
            </div>

            <div className="preview-card-balance">
              <FaMoneyBillWave />
              <strong>{parseInt(cardBalance) || 0}</strong>
              <img src={CardValyuta} alt="so‘m" className="inline-valyuta-icon" />
            </div>

            <div className="preview-card-footer">
              <span className="card-type">REAL CARD</span>
              <span className="card-price">
                Narxi: {price}
                <img src={CardValyuta} alt="so‘m" className="inline-valyuta-icon" />
              </span>
            </div>
          </div>

          {/* FORMA */}
          <div className="form-container">
            <h3 className="form-title">
              <FaPlus /> Karta sozlamalari
            </h3>

            <div className="form-group">
              <label className="form-label">
                <FaMoneyBillWave />
                Karta balansi
              </label>
              <input
                type="number"
                value={cardBalance}
                onChange={(e) => setCardBalance(e.target.value)}
                placeholder="Masalan: 50000"
                className="form-input"
                min="1"
                max="10000000"
                disabled={isPurchasing}
              />
              <small className="input-hint">
                Minimal: 1 | Maksimal: 10,000,000{" "}
                <img src={CardValyuta} alt="so‘m" className="inline-valyuta-icon" />
              </small>
            </div>

            <div className="price-info-card">
              <div className="price-item">
                <FaShoppingCart />
                <span>Karta narxi:</span>
                <strong>
                  {price.toLocaleString()}{" "}
                  <img src={CardValyuta} alt="so‘m" className="inline-valyuta-icon" />
                </strong>
              </div>
              <div className="price-item">
                <FaCreditCard />
                <span>Karta raqami:</span>
                <strong>Avtomatik yaratiladi</strong>
              </div>
            </div>

            <button
              onClick={handleBuy}
              className={`buy-btn ${canBuy ? "active" : "disabled"} ${
                isPurchasing ? "loading" : ""
              }`}
              disabled={!canBuy || isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <div className="loading-spinner"></div> Sotib olinmoqda...
                </>
              ) : canBuy ? (
                <>
                  <FaCheck /> Karta sotib olish
                </>
              ) : (
                <>
                  <FaTimes /> Balans yetarli emas
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyCard;
