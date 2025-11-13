import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ValyutaLogo from "../assets/images/logo.png";
import CardIcon from "../assets/images/cardorg.png";
import MarketIcon from "../assets/images/market.png";
import Cards from "./Cards";
import "../styles/Market.css";

function Market({ user, updateUser }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(null);
  const [ads, setAds] = useState([]);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [adForm, setAdForm] = useState({ text: "", image: "", duration: 1 });

  const promotions = [
    { id: 1, name: "Pitsa 1+1", price: 1000, image: "https://via.placeholder.com/120?text=Pitsa" },
    { id: 2, name: "Burger + Cola", price: 800, image: "https://via.placeholder.com/120?text=Burger" },
    { id: 3, name: "Shaurma", price: 600, image: "https://via.placeholder.com/120?text=Shaurma" },
    { id: 4, name: "Kola 1L", price: 500, image: "https://via.placeholder.com/120?text=Kola" },
    { id: 5, name: "Salat", price: 700, image: "https://via.placeholder.com/120?text=Salat" },
    { id: 6, name: "Kofe", price: 400, image: "https://via.placeholder.com/120?text=Kofe" },
  ];

  // Mahsulot sotib olish funksiyasi
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

  // Ads (Reklama) yuklash
  useEffect(() => {
    const savedAds = JSON.parse(localStorage.getItem("marketplaceAds") || "[]");
    const now = Date.now();
    const activeAds = savedAds.filter(ad => ad.expiresAt > now);
    setAds(activeAds);
    localStorage.setItem("marketplaceAds", JSON.stringify(activeAds));
  }, []);

  // Reklamalarni avtomatik o‘zgartirish
  useEffect(() => {
    if (ads.length < 2) return;
    const interval = setInterval(() => {
      setActiveAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleAdChange = (e) => {
    const { name, value } = e.target;
    setAdForm(prev => ({
      ...prev,
      [name]: name === "duration" ? Math.max(1, Math.min(30, parseInt(value) || 1)) : value
    }));
  };

  const handlePlaceAd = () => {
    const { text, image, duration } = adForm;
    if (!text.trim() || text.length > 100) {
      alert("Reklama matni to'liq va 100 ta belgidan oshmasligi kerak.");
      return;
    }
    if (!image.trim()) {
      alert("Rasm URL manzilini kiriting.");
      return;
    }

    const cost = duration * 500;
    if ((user.balance || 0) < cost) {
      alert(`Balans yetarli emas! Reklama narxi: ${cost.toLocaleString()} so'm`);
      return;
    }

    const expiresAt = Date.now() + duration * 24 * 60 * 60 * 1000;
    const newAd = {
      id: Date.now(),
      text,
      image,
      duration,
      expiresAt,
      seller: user.login,
      createdAt: new Date().toLocaleString(),
    };

    const updatedAds = [newAd]; // faqat bitta faol reklama
    localStorage.setItem("marketplaceAds", JSON.stringify(updatedAds));
    setAds(updatedAds);
    setActiveAdIndex(0);

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) - cost,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString(),
          action: `Reklama joylashtirildi (${duration} kun)`,
          amount: -cost,
        },
      ],
    };
    updateUser(updatedUser);

    alert("Reklama muvaffaqiyatli joylashtirildi! Storyda ko'rinadi.");
    setAdForm({ text: "", image: "", duration: 1 });
  };

  const handleAdClick = () => setModalOpen("ad");

  const remainingDays = (expiresAt) => {
    const now = Date.now();
    const diff = expiresAt - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <>
      {/* Reklama Banner */}
      {ads.length > 0 && (
        <div className="story-ad-section">
          <div 
            className="story-ad-banner" 
            onClick={handleAdClick}
            style={{ animation: 'storySlideIn 0.5s ease-out' }}
          >
            <img src={ads[activeAdIndex].image} alt="Reklama" className="story-ad-bg" />
            <div className="story-ad-overlay">
              <div className="story-ad-content">
                <p className="story-ad-text">{ads[activeAdIndex].text}</p>
                <div className="story-ad-meta">
                  <span className="story-ad-seller">@{ads[activeAdIndex].seller}</span>
                  <span className="story-ad-duration">• {remainingDays(ads[activeAdIndex].expiresAt)} kun qoldi</span>
                </div>
              </div>
              <div className="story-ad-indicator">
                <div className="story-progress-bar">
                  <div 
                    className="story-progress-fill" 
                    style={{ width: `${((30 - remainingDays(ads[activeAdIndex].expiresAt)) / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Action Buttons */}
          <section className="action-buttons">
            <div className="action-grid">
              <div onClick={() => setModalOpen("cards")} className="action-item">
                <img src={CardIcon} alt="Kartalar" className="action-icon" />
                <p>Kartalar</p>
              </div>
              <div onClick={() => navigate("/all-shops")} className="action-item">
                <img src={MarketIcon} alt="Do'konlar" className="action-icon" />
                <p>Barcha Do'konlar</p>
              </div>
            </div>
          </section>

          {/* Promotions */}
          <section className="promotions-section">
            <div className="section-header">
              <h3>Chegirmadagi mahsulotlar</h3>
              <button className="view-all-btn">Barchasi</button>
            </div>
            <div className="promotions-grid">
              {promotions.map(item => (
                <div key={item.id} className="promo-card-small">
                  <img src={item.image} alt={item.name} className="promo-img-small" />
                  <div className="promo-info-small">
                    <h4>{item.name}</h4>
                    <p className="price-small">{item.price.toLocaleString()} so'm</p>
                    <button className="buy-btn-small" onClick={() => handleBuy(item)}>Sotib olish</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reklama Joylashtirish */}
          <section className="ads-section">
            <div className="section-header">
              <h3>Reklama Joylashtirish</h3>
              <span className="ads-price">500 so'm/kun</span>
            </div>
            <div className="ads-form">
              <textarea
                name="text"
                placeholder="Reklama matni (100 ta belgigacha)"
                maxLength={100}
                value={adForm.text}
                onChange={handleAdChange}
                rows="3"
              />
              <input
                type="url"
                name="image"
                placeholder="Rasm URL manzili"
                value={adForm.image}
                onChange={handleAdChange}
              />
              <div className="duration-selector">
                <label>Reklama muddati (kun):</label>
                <input
                  type="number"
                  name="duration"
                  min={1}
                  max={30}
                  value={adForm.duration}
                  onChange={handleAdChange}
                />
              </div>
              <div className="ad-summary">
                <p>Jami narx: <strong>{(adForm.duration * 500).toLocaleString()} so'm</strong></p>
                <p className="ad-note">Reklama storyda ko'rinadi va boshqa reklamani almashtiradi</p>
              </div>
              <button className="place-ad-btn" onClick={handlePlaceAd}>Reklamani Joylashtirish</button>
            </div>
          </section>

        </div>
      </div>

      {/* MODAL - KARTALAR */}
      {modalOpen === "cards" && (
        <div className="full-modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="full-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalOpen(null)}>✕</button>
            <div className="modal-body">
              {/* virtualCard faqat Cards komponentida ishlatiladi */}
              <Cards user={user} updateUser={updateUser} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL - REKLAMA TAFSILOTLARI */}
      {modalOpen === "ad" && ads.length > 0 && (
        <div className="full-modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="full-modal-content ad-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalOpen(null)}>✕</button>
            <div className="modal-body">
              <div className="ad-detail-content">
                <img src={ads[activeAdIndex].image} alt="Reklama" className="ad-detail-image" />
                <div className="ad-detail-info">
                  <h3 className="ad-detail-text">{ads[activeAdIndex].text}</h3>
                  <div className="ad-detail-meta">
                    <p><strong>Reklamachi:</strong> @{ads[activeAdIndex].seller}</p>
                    <p><strong>Joylashtirilgan:</strong> {ads[activeAdIndex].createdAt}</p>
                    <p><strong>Muddati tugaydi:</strong> {remainingDays(ads[activeAdIndex].expiresAt)} kun qoldi</p>
                  </div>
                  <button className="visit-ad-btn" onClick={() => window.open(ads[activeAdIndex].image, "_blank")}>
                    Tafsilotlarni Ko'rish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Market;
