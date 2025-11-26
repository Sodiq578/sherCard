// Market.jsx
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
  const [modalOpen, setModalOpen] = useState(null);
  const [ads, setAds] = useState([]);
  const [viewedAds, setViewedAds] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [adForm, setAdForm] = useState({
    text: "",
    imageFile: null,
    imagePreview: "",
    url: "",
    duration: 7,
  });
  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);

  // Reklamalarni yuklash
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("approvedMarketAds") || "[]");
    const now = Date.now();
    const active = saved.filter(ad => ad.expiresAt > now);
    localStorage.setItem("approvedMarketAds", JSON.stringify(active));

    const viewed = JSON.parse(localStorage.getItem("viewedMarketStories") || "[]");
    const sorted = active.sort((a, b) => {
      const aViewed = viewed.includes(a.id);
      const bViewed = viewed.includes(b.id);
      if (!aViewed && bViewed) return -1;
      if (aViewed && !bViewed) return 1;
      return b.createdAt - a.createdAt;
    });
    setAds(sorted);
    setViewedAds(viewed);
  }, []);

  // Story progress bar
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

  const goPrev = () => currentStoryIndex > 0 && setCurrentStoryIndex(prev => prev - 1);
  const goNext = () => {
    if (currentStoryIndex < ads.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      markAsViewed(ads[currentStoryIndex + 1].id);
    } else {
      setModalOpen(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlertMessage("Faqat rasm yuklash mumkin!", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdForm(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setAdForm(prev => ({ ...prev, imageFile: null, imagePreview: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePlaceAd = () => {
    const { text, imagePreview, duration, url } = adForm;
    if (!text.trim()) return showAlertMessage("Reklama matnini kiriting!", "error");
    if (text.length > 120) return showAlertMessage("Matn 120 belgidan oshmasin!", "error");
    if (!imagePreview) return showAlertMessage("Rasm yuklang!", "error");

    const cost = duration * 500;
    if ((user?.balance || 0) < cost) {
      return showAlertMessage(`Balans yetarli emas! Kerak: ${cost.toLocaleString()} so'm`, "error");
    }

    const newAd = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      image: imagePreview,
      url: url.trim(),
      duration,
      cost,
      expiresAt: Date.now() + duration * 24 * 60 * 60 * 1000,
      seller: user.login,
      createdAt: Date.now(),
      status: "pending"
    };

    const pending = JSON.parse(localStorage.getItem("pendingMarketAds") || "[]");
    pending.push(newAd);
    localStorage.setItem("pendingMarketAds", JSON.stringify(pending));

    updateUser({
      ...user,
      balance: user.balance - cost,
      history: [...(user.history || []), {
        date: new Date().toLocaleString(),
        action: `Reklama (${duration} kun)`,
        amount: -cost
      }]
    });

    showAlertMessage(`So‘rov yuborildi!\n${duration} kunlik reklama admin tasdiqlashini kutmoqda`, "success", "Muvaffaqiyatli");
    setAdForm({ text: "", imageFile: null, imagePreview: "", url: "", duration: 7 });
  };

  // Alert system
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");

  const showAlertMessage = (message, type = "success", title = "") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertTitle(title || (type === "success" ? "Muvaffaqiyatli" : "Xatolik"));
    setShowAlert(true);
  };

  return (
    <>
      {/* ALERT MODAL */}
      {showAlert && (
        <div className="market-alert-modal-overlay" onClick={() => setShowAlert(false)}>
          <div className={`market-alert-modal market-alert-${alertType}`} onClick={e => e.stopPropagation()}>
            <div className="market-alert-header">
              {alertType === "success" && <FiCheck />}
              {alertType === "error" && <FiAlertCircle />}
              {alertType === "info" && <FiInfo />}
              <h3>{alertTitle}</h3>
            </div>
            <div className="market-alert-body"><p>{alertMessage}</p></div>
            <div className="market-alert-footer">
              <button onClick={() => setShowAlert(false)}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {/* STORIES BAR */}
      {ads.length > 0 && (
        <div className="stories-bar">
          <div className="stories-wrapper">
            {ads.map((ad, i) => (
              <div key={ad.id} className="story-circle" onClick={() => openStory(i)}>
                <div className={`story-ring ${viewedAds.includes(ad.id) ? "viewed" : "new"}`}>
                  <img src={ad.image} alt="" className="story-avatar" />
                </div>
                <p className="story-username">@{ad.seller}</p>
              </div>
            ))}
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
                  <div className="progress-segment" style={{ width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? `${progress}%` : "0%" }} />
                </div>
              ))}
            </div>
            <div className="story-tap-left" onClick={goPrev} />
            <div className="story-tap-right" onClick={goNext} />
            <img src={ads[currentStoryIndex].image} alt="" className="story-full-image" />
            <div className="story-overlay-bottom">
              <p className="story-text">{ads[currentStoryIndex].text}</p>
              {ads[currentStoryIndex].url && (
                <a href={ads[currentStoryIndex].url} target="_blank" rel="noopener noreferrer" className="story-link">
                  Batafsil →
                </a>
              )}
              <p className="story-seller">@{ads[currentStoryIndex].seller}</p>
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
              <img src={ValyutaLogo} alt="so'm" />
              <span>{(user?.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          <section className="action-buttons">
            <div className="action-grid">
              <div onClick={() => setModalOpen("cards")} className="action-item">
                <img src={CardIcon} alt="Kartalar" />
                <p>Kartalar</p>
              </div>
              <div onClick={() => navigate("/all-shops")} className="action-item">
                <img src={MarketIcon} alt="Do'konlar" />
                <p>Barcha Do'konlar</p>
              </div>
            </div>
          </section>

          {/* PREMIUM REKLAMA FORMASI */}
          <section className="ads-section-premium">
            <div className="ads-card">
              <div className="ads-balance-header">
                <span>Reklama joylashtirish</span>
                <div className="balance-amount">
                  <img src={ValyutaLogo} alt="so'm" />
                  <span>{(user?.balance || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Reklama matni */}
              <div className="ads-input-group">
                <textarea
                  placeholder="Masalan: Nikita Panto yangi jamoaga qo‘shildi!"
                  maxLength={120}
                  rows={3}
                  value={adForm.text}
                  onChange={(e) => setAdForm(prev => ({ ...prev, text: e.target.value }))}
                />
                <div className="ads-char-counter">{adForm.text.length}/120</div>
              </div>

              {/* Rasm yuklash */}
              <div className="ads-upload-area">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} id="premium-ad-image" style={{ display: "none" }} />
                {!adForm.imagePreview ? (
                  <label htmlFor="premium-ad-image" className="upload-placeholder">
                    <span>16:9 rasm yuklash (tavsiya etiladi)</span>
                  </label>
                ) : (
                  <div className="image-preview">
                    <img src={adForm.imagePreview} alt="Preview" />
                    <button onClick={removeImage} className="remove-btn">×</button>
                  </div>
                )}
              </div>

              {/* Havola */}
              <div className="ads-input-group">
                <input
                  type="url"
                  placeholder="Havola (ixtiyoriy) – https://teamsprit.gg"
                  value={adForm.url}
                  onChange={(e) => setAdForm(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              {/* Muddati */}
              <div className="ads-duration-section">
                <div className="duration-info-row">
                  <div className="duration-text">Ko‘rsatish muddati</div>
                  <div className="price-info">
                    <div className="price-row">
                      <span>500 so'm / kun</span>
                    </div>
                    <div className="price-row total">
                      <strong>{adForm.duration} kun</strong>
                    </div>
                  </div>
                </div>

                <div className="custom-slider-container">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={adForm.duration}
                    onChange={(e) => setAdForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="custom-range"
                  />
                  <div className="slider-track"></div>
                  <div className="slider-fill" style={{ width: `${((adForm.duration - 1) / 29) * 100}%` }}></div>
                  <div className="slider-thumb" style={{ left: `${((adForm.duration - 1) / 29) * 100}%` }}>
                    <div className="thumb-circle"></div>
                  </div>
                  <div className="thumb-value" style={{ left: `${((adForm.duration - 1) / 29) * 100}%` }}>
                    {adForm.duration}
                  </div>
                </div>

                <div className="duration-labels">
                  <span>1 kun</span>
                  <span>30 kun</span>
                </div>
              </div>

              {/* Jami narx */}
              <div className="ads-total-price">
                <div className="total-label">Jami to‘lov summasi</div>
                <div className="total-amount">
                  {(adForm.duration * 500).toLocaleString()} so‘m
                </div>
              </div>

              {/* Tugma */}
              <button
                onClick={handlePlaceAd}
                className="ads-submit-premium"
                disabled={!adForm.text.trim() || !adForm.imagePreview}
              >
                Reklama joylashtirish
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* KARTALAR MODAL */}
      {modalOpen === "cards" && (
        <div className="full-modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="full-modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(null)} className="modal-close-btn">×</button>
            <Cards user={user} updateUser={updateUser} />
          </div>
        </div>
      )}
    </>
  );
}

export default Market;