import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ValyutaLogo from "../assets/images/logo.png";
import CardIcon from "../assets/images/cardorg.png";
import MarketIcon from "../assets/images/market.png";
import Cards from "./Cards";
import { FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";
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

  // Reklamalarni yuklash + KO'RILMAGANLAR BIRINCHI BO'LADI
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("marketplaceAds") || "[]");
    const now = Date.now();
    const active = saved.filter(ad => ad.expiresAt > now);

    const viewed = JSON.parse(localStorage.getItem("viewedMarketStories") || "[]");

    // MUHIM: Ko'rilmaganlarni birinchi qilib tartiblash
    const sortedAds = active.sort((a, b) => {
      const aViewed = viewed.includes(a.id);
      const bViewed = viewed.includes(b.id);
      if (!aViewed && bViewed) return -1;
      if (aViewed && !bViewed) return 1;
      return b.createdAt - a.createdAt; // yangi yaratilganlar oldinda
    });

    setAds(sortedAds);
    setViewedAds(viewed);
    localStorage.setItem("marketplaceAds", JSON.stringify(active));
  }, []);

  // Progress bar — 8 sekund silliq
  useEffect(() => {
    if (modalOpen === "story" && ads.length > 0) {
      setProgress(0);
      clearInterval(progressInterval.current);
      const duration = 8000;
      const step = 50;
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
      showAlertMessage("Iltimos, faqat rasm faylini tanlang!", "error", "Xatolik");
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

  // Rasmni o'chirish
  const removeImage = () => {
    setAdForm(prev => ({ ...prev, imageFile: null, imagePreview: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reklama joylashtirish
  const handlePlaceAd = () => {
    const { text, imagePreview, duration } = adForm;
    if (!text.trim()) return showAlertMessage("Reklama matnini kiriting!", "error", "Xatolik");
    if (text.trim().length > 100) return showAlertMessage("Matn 100 belgidan oshmasin!", "error", "Xatolik");
    if (!imagePreview) return showAlertMessage("Rasm tanlang!", "error", "Xatolik");

    const cost = duration * 500;
    if ((user?.balance || 0) < cost) {
      return showAlertMessage(`Balans yetarli emas! Kerak: ${cost.toLocaleString()} so'm`, "error", "Xatolik");
    }

    const confirmPlaceAd = () => {
      const newAd = {
        id: Date.now() + Math.random(),
        text: text.trim(),
        image: imagePreview,
        duration,
        expiresAt: Date.now() + duration * 24 * 60 * 60 * 1000,
        seller: user.login,
        createdAt: Date.now(),
      };

      const updatedAds = [...ads, newAd];
      localStorage.setItem("marketplaceAds", JSON.stringify(updatedAds));
      setAds(prev => {
        const sorted = [...prev, newAd].sort((a, b) => {
          const aViewed = viewedAds.includes(a.id);
          const bViewed = viewedAds.includes(b.id);
          if (!aViewed && bViewed) return -1;
          if (aViewed && !bViewed) return 1;
          return b.createdAt - a.createdAt;
        });
        return sorted;
      });

      updateUser({
        ...user,
        balance: (user.balance || 0) - cost,
        history: [
          ...(user.history || []),
          { time: new Date().toLocaleString(), action: `Reklama joylashtirildi (${duration} kun)`, amount: -cost },
        ],
      });

      showAlertMessage("Reklama muvaffaqiyatli joylashtirildi! Storyda ko'rinadi", "success", "Muvaffaqiyatli");
      setAdForm({ text: "", imageFile: null, imagePreview: "", duration: 1 });
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    showAlertMessage(
      `Reklamani joylashtirishni tasdiqlaysizmi?\n\nMatn: ${text.trim()}\nMuddati: ${duration} kun\nNarxi: ${cost.toLocaleString()} so'm\n\nBalansingiz: ${user?.balance?.toLocaleString()} so'm`,
      "info",
      "Tasdiqlash",
      confirmPlaceAd,
      "Joylashtirish"
    );
  };

  // Mahsulot sotib olish
  const handleBuy = (item) => {
    if ((user?.balance || 0) < item.price) {
      showAlertMessage("Balans yetarli emas!", "error", "Xatolik");
      return;
    }
    const confirmBuy = () => {
      updateUser({
        ...user,
        balance: (user.balance || 0) - item.price,
        history: [
          ...(user.history || []),
          { time: new Date().toLocaleString(), action: `Sotib olindi: ${item.name}`, amount: -item.price },
        ],
      });
      showAlertMessage(`${item.name} muvaffaqiyatli sotib olindi!`, "success", "Muvaffaqiyatli");
    };
    showAlertMessage(
      `${item.name} ni sotib olishni tasdiqlaysizmi?\nNarxi: ${item.price.toLocaleString()} so'm`,
      "info",
      "Sotib olish",
      confirmBuy,
      "Ha, sotib olaman"
    );
  };

  /* ==================== UNIVERSAL ALERT ==================== */
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertAction, setAlertAction] = useState(null);
  const [alertActionText, setAlertActionText] = useState("");

  const showAlertMessage = (message, type = "success", title = "", action = null, actionText = "") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertTitle(title);
    setAlertAction(() => action);
    setAlertActionText(actionText);
    setShowAlert(true);
  };

  const handleAlertAction = () => {
    if (alertAction) alertAction();
    setShowAlert(false);
  };

  const closeAlert = () => setShowAlert(false);

  return (
    <>
      {/* UNIVERSAL ALERT */}
      {showAlert && (
        <div className="market-alert-modal-overlay">
          <div className={`market-alert-modal market-alert-${alertType}`}>
            <div className="market-alert-header">
              {alertType === "success" && <FiCheck className="market-alert-header-icon" />}
              {alertType === "error" && <FiAlertCircle className="market-alert-header-icon" />}
              {alertType === "info" && <FiInfo className="market-alert-header-icon" />}
              <h3 className="market-alert-title">{alertTitle || (alertType === "success" ? "Muvaffaqiyatli" : "Xatolik")}</h3>
            </div>
            <div className="market-alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="market-alert-footer">
              {alertAction && (
                <button className="market-alert-action-btn" onClick={handleAlertAction}>
                  {alertActionText || "Tasdiqlash"}
                </button>
              )}
              <button className="market-alert-close-btn" onClick={closeAlert}>
                {alertAction ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORIES BAR — Ko'rilmaganlar birinchi */}
      {ads.length > 0 && (
        <div className="stories-bar">
          <div className="stories-wrapper">
            {ads.map((ad, index) => {
              const isViewed = viewedAds.includes(ad.id);
              return (
                <div key={ad.id} className="story-circle" onClick={() => openStory(index)}>
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

      {/* FULLSCREEN STORY */}
      {modalOpen === "story" && ads.length > 0 && (
        <div className="story-fullscreen" onClick={() => setModalOpen(null)}>
          <div className="story-content" onClick={e => e.stopPropagation()}>
            <div className="story-progress-container">
              {ads.map((_, i) => (
                <div key={i} className="progress-segment-wrapper">
                  <div
                    className="progress-segment"
                    style={{
                      width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? `${progress}%` : "0%",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="story-tap-left" onClick={goPrev} />
            <div className="story-tap-right" onClick={goNext} />
            <img src={ads[currentStoryIndex].image} alt="Reklama" className="story-full-image" />
            <div className="story-overlay-bottom">
              <p className="story-full-text">{ads[currentStoryIndex].text}</p>
              <p className="story-full-meta">@{ads[currentStoryIndex].seller}</p>
            </div>
            <button className="story-close-btn" onClick={() => setModalOpen(null)}>×</button>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="market-page">
        <div className="market-container">
          <div className="market-header">
            <h2>Market</h2>
            <div className="balance-display">
              <img src={ValyutaLogo} alt="so'm" className="balance-logo-small" />
              <span>{(user?.balance || 0).toLocaleString()}</span>
            </div>
          </div>

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

          <section className="promotions-section">
            <div className="section-header">
              <h3>Chegirmadagi mahsulotlar</h3>
            </div>
            <div className="promotions-grid">
              {promotions.map(item => (
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

          {/* REKLAMA JOYLASHTIRISH */}
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
                onChange={e => setAdForm(prev => ({ ...prev, text: e.target.value }))}
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
                  {adForm.imagePreview ? "Rasmni o'zgartirish" : "Rasm tanlash"}
                </label>

                {adForm.imagePreview && (
                  <div className="image-preview">
                    <img src={adForm.imagePreview} alt="Oldindan ko'rish" />
                    <button className="remove-image-btn" onClick={removeImage}>×</button>
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
                  onChange={e => setAdForm(prev => ({
                    ...prev,
                    duration: Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
                  }))}
                />
                <span>kun</span>
              </div>

              <div className="ad-summary">
                <p>Jami narx: <strong>{(adForm.duration * 500).toLocaleString()} so'm</strong></p>
              </div>

              <button className="place-ad-btn" onClick={handlePlaceAd}>
                Reklamani Joylashtirish
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* KARTALAR MODAL */}
      {modalOpen === "cards" && (
        <div className="full-modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="full-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalOpen(null)}>×</button>
            <div className="modal-body">
              <Cards user={user} updateUser={updateUser} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Market;