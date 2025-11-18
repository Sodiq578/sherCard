// Market.jsx — To'liq tayyor va mukammal versiya
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ValyutaLogo from "../assets/images/logo.png";
import CardIcon from "../assets/images/cardorg.png";
import MarketIcon from "../assets/images/market.png";
import Cards from "./Cards";
import "../styles/Market.css";

function Market({ user, updateUser }) {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(null); // "cards" | "story" | null
  const [ads, setAds] = useState([]);
  const [viewedAds, setViewedAds] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [adForm, setAdForm] = useState({
    text: "",
    imageFile: null,
    imagePreview: "",
    duration: 1,
  });

  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);

  const promotions = [
    { id: 1, name: "Pitsa 1+1", price: 1000, image: "https://via.placeholder.com/120?text=Pitsa" },
    { id: 2, name: "Burger + Cola", price: 800, image: "https://via.placeholder.com/120?text=Burger" },
    { id: 3, name: "Shaurma", price: 600, image: "https://via.placeholder.com/120?text=Shaurma" },
    { id: 4, name: "Kola 1L", price: 500, image: "https://via.placeholder.com/120?text=Kola" },
    { id: 5, name: "Salat", price: 700, image: "https://via.placeholder.com/120?text=Salat" },
    { id: 6, name: "Kofe", price: 400, image: "https://via.placeholder.com/120?text=Kofe" },
  ];

  // Reklamalarni yuklash
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("marketplaceAds") || "[]");
    const now = Date.now();
    const active = saved.filter(ad => ad.expiresAt > now);
    setAds(active);
    localStorage.setItem("marketplaceAds", JSON.stringify(active));

    const viewed = JSON.parse(localStorage.getItem("viewedMarketStories") || "[]");
    setViewedAds(viewed);
  }, []);

  // Progress bar — 8 sekund, juda silliq
  useEffect(() => {
    if (modalOpen === "story" && ads.length > 0) {
      setProgress(0);
      clearInterval(progressInterval.current);

      const duration = 8000; // 8 sekund
      const step = 50;       // har 50ms da yangilansin (juda silliq)
      const increment = (100 * step) / duration;

      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            goNext();
            return 0;
          }
          return Math.min(prev + increment, 100);
        });
      }, step);

      return () => clearInterval(progressInterval.current);
    }
  }, [currentStoryIndex, modalOpen, ads.length]);

  const markAsViewed = (adId) => {
    if (!viewedAds.includes(adId)) {
      const updated = [...viewedAds, adId];
      setViewedAds(updated);
      localStorage.setItem("viewedMarketStories", JSON.stringify(updated));
    }
  };

  const openStory = (index) => {
    setCurrentStoryIndex(index);
    setModalOpen("story");
    markAsViewed(ads[index].id);
  };

  const goPrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const goNext = () => {
    if (currentStoryIndex < ads.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      markAsViewed(ads[currentStoryIndex + 1].id);
    } else {
      setModalOpen(null);
      setProgress(0);
    }
  };

  // Rasm tanlash
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Iltimos, faqat rasm faylini tanlang!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAdForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Reklama joylashtirish
  const handlePlaceAd = () => {
    const { text, imagePreview, duration } = adForm;

    if (!text.trim()) return alert("Matn kiriting!");
    if (text.trim().length > 100) return alert("Matn 100 belgidan oshmasin!");
    if (!imagePreview) return alert("Rasm tanlang!");

    const cost = duration * 500;
    if ((user?.balance || 0) < cost) {
      return alert(`Balans yetarli emas! Kerak: ${cost.toLocaleString()} so'm`);
    }

    const newAd = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      image: imagePreview,
      duration,
      expiresAt: Date.now() + duration * 24 * 60 * 60 * 1000,
      seller: user.login,
      createdAt: new Date().toLocaleString(),
    };

    const updatedAds = [...ads, newAd];
    localStorage.setItem("marketplaceAds", JSON.stringify(updatedAds));
    setAds(updatedAds);

    // Balansni yangilash
    updateUser({
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
    });

    alert("Reklama muvaffaqiyatli joylashtirildi! Storyda ko‘rinadi");
    setAdForm({ text: "", imageFile: null, imagePreview: "", duration: 1 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Mahsulot sotib olish
  const handleBuy = (item) => {
    if ((user?.balance || 0) < item.price) {
      alert("Balans yetarli emas!");
      return;
    }
    updateUser({
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
    });
    alert(`${item.name} muvaffaqiyatli sotib olindi!`);
  };

  return (
    <>
      {/* STORYLAR QATORI – Instagram kabi doiralar */}
      {ads.length > 0 && (
        <div className="stories-bar">
          <div className="stories-wrapper">
            {ads.map((ad, index) => {
              const isViewed = viewedAds.includes(ad.id);
              return (
                <div
                  key={ad.id}
                  className="story-circle"
                  onClick={() => openStory(index)}
                >
                  <div className={`story-ring ${isViewed ? "viewed" : "new"}`}>
                    <img src={ad.image} alt={ad.seller} className="story-avatar" />
                  </div>
                  <p className="story-username">@{ad.seller}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TO'LIQ EKRAN STORY MODAL */}
      {modalOpen === "story" && ads.length > 0 && (
        <div className="story-fullscreen" onClick={() => setModalOpen(null)}>
          <div className="story-content" onClick={(e) => e.stopPropagation()}>
            {/* Progress Bar – 8 sekund silliq to‘ladi */}
            <div className="story-progress-container">
              {ads.map((_, i) => (
                <div key={i} className="progress-segment-wrapper">
                  <div
                    className="progress-segment"
                    style={{
                      width:
                        i < currentStoryIndex
                          ? "100%"
                          : i === currentStoryIndex
                          ? `${progress}%`
                          : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Chap/o‘ng bosish zonasi */}
            <div className="story-tap-left" onClick={goPrev} />
            <div className="story-tap-right" onClick={goNext} />

            {/* Rasm */}
            <img
              src={ads[currentStoryIndex].image}
              alt="Reklama"
              className="story-full-image"
            />

            {/* Matn va foydalanuvchi */}
            <div className="story-overlay-bottom">
              <p className="story-full-text">{ads[currentStoryIndex].text}</p>
              <p className="story-full-meta">@{ads[currentStoryIndex].seller}</p>
            </div>

            {/* Yopish tugmasi */}
            <button className="story-close-btn" onClick={() => setModalOpen(null)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* ASOSIY MARKET SAHIFASI */}
      <div className="market-page">
        <div className="market-container">
          {/* Header */}
          <div className="market-header">
            <h2>Market</h2>
            <div className="balance-display">
              <img src={ValyutaLogo} alt="so'm" className="balance-logo-small" />
              <span>{(user?.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Tugmalar */}
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

          {/* Chegirmalar */}
          <section className="promotions-section">
            <div className="section-header">
              <h3>Chegirmadagi mahsulotlar</h3>
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

          {/* Reklama joylashtirish */}
          <section className="ads-section">
            <div className="section-header">
              <h3>Reklama Joylashtirish</h3>
              <span className="ads-price">500 so'm / kun</span>
            </div>

            <div className="ads-form">
              <textarea
                placeholder="Reklama matni (maks. 100 belgi)"
                maxLength={100}
                value={adForm.text}
                onChange={(e) => setAdForm(prev => ({ ...prev, text: e.target.value }))}
              />

              <div className="image-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="ad-image-input"
                  style={{ display: "none" }}
                />
                <label htmlFor="ad-image-input" className="image-upload-btn">
                  {adForm.imagePreview ? "Rasm o‘zgartirish" : "Rasm tanlash"}
                </label>

                {adForm.imagePreview && (
                  <div className="image-preview">
                    <img src={adForm.imagePreview} alt="Oldindan ko‘rish" />
                  </div>
                )}
              </div>

              <div className="duration-selector">
                <label>Muddati:</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={adForm.duration}
                  onChange={(e) =>
                    setAdForm(prev => ({
                      ...prev,
                      duration: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)),
                    }))
                  }
                />
                <span>kun</span>
              </div>

              <div className="ad-summary">
                <p>
                  Jami narx: <strong>{(adForm.duration * 500).toLocaleString()} so'm</strong>
                </p>
              </div>

              <button className="place-ad-btn" onClick={handlePlaceAd}>
                Reklamani Joylashtirish
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Kartalar Modal */}
      {modalOpen === "cards" && (
        <div className="full-modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="full-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalOpen(null)}>
              ×
            </button>
            <Cards user={user} updateUser={updateUser} />
          </div>
        </div>
      )}
    </>
  );
}

export default Market;