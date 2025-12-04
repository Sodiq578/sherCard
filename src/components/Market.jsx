import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ValyutaLogo from "../assets/images/logo.png";
import Cards from "./Cards";
import { 
  FiCheck, 
  FiAlertCircle, 
  FiInfo, 
  FiPlus, 
  FiX,
  FiClock,
  FiDollarSign,
  FiImage,
  FiLink,
  FiEye,
  FiTrendingUp,
  FiStar,
  FiShoppingBag,
  FiGift,
  FiCreditCard,
  FiPackage,
  FiShoppingCart,
  FiPercent,
  FiUsers,
  FiBarChart2,
  FiCalendar
} from "react-icons/fi";
import { 
  MdOutlineStorefront,
  MdLocalOffer,
  MdTrendingUp,
  MdCampaign,
  MdHistory,
  MdDashboard,
  MdPendingActions,
  MdVerified,
  MdCancel
} from "react-icons/md";
import { 
  BsFillCameraFill,
  BsArrowRightCircleFill,
  BsFire,
  BsCartCheck,
  BsShieldCheck,
  BsGraphUp
} from "react-icons/bs";
import { 
  AiFillTag,
  AiFillThunderbolt
} from "react-icons/ai";
import { 
  TbTargetArrow
} from "react-icons/tb";
import "../styles/Market.css";

function Market({ user, updateUser }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(null);
  const [showAdsForm, setShowAdsForm] = useState(false);
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
    category: "general",
    targetAudience: "all",
    priority: "normal"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAdsHistory, setUserAdsHistory] = useState([]);
  const [showAdsHistory, setShowAdsHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [adStats, setAdStats] = useState(null);
  
  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);
  const storyRef = useRef(null);

  // Reklamalarni yuklash
  useEffect(() => {
    const loadAds = () => {
      try {
        // Approved reklamalar
        const saved = JSON.parse(localStorage.getItem("approvedMarketAds") || "[]");
        const now = Date.now();
        
        // Muddatini o'tgan reklamalarni filtrlaymiz
        const active = saved.filter(ad => ad.expiresAt > now);
        
        // Faqat active reklamalarni saqlaymiz
        localStorage.setItem("approvedMarketAds", JSON.stringify(active));

        const viewed = JSON.parse(localStorage.getItem("viewedMarketStories") || "[]");
        
        // Ko'rilgan/ko'rilmagan reklamalarni tartiblaymiz
        const sorted = active.sort((a, b) => {
          const aViewed = viewed.includes(a.id);
          const bViewed = viewed.includes(b.id);
          if (!aViewed && bViewed) return -1;
          if (aViewed && !bViewed) return 1;
          
          // Priority bo'yicha sort
          const priorityOrder = { high: 1, medium: 2, normal: 3, low: 4 };
          if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          
          return b.createdAt - a.createdAt;
        });
        
        setAds(sorted);
        setViewedAds(viewed);
        
        // Agar story ochiq bo'lsa va reklama o'chirilgan bo'lsa
        if (modalOpen === "story" && sorted.length === 0) {
          setModalOpen(null);
        }
      } catch (error) {
        console.error("Reklamalarni yuklashda xatolik:", error);
        showAlertMessage("Reklamalarni yuklashda xatolik yuz berdi", "error");
      }
    };

    loadAds();
    
    // Har 30 soniyada yangilash
    const interval = setInterval(loadAds, 30000);
    
    return () => clearInterval(interval);
  }, [modalOpen]);

  // Foydalanuvchi reklama tarixini yuklash
  useEffect(() => {
    if (user && user.id) {
      loadUserAdsHistory();
    }
  }, [user]);

  const loadUserAdsHistory = () => {
    try {
      // Pending reklamalar
      const pendingAds = JSON.parse(localStorage.getItem("pendingMarketAds") || "[]");
      const userPending = pendingAds.filter(ad => ad.sellerId === user.id);
      
      // Approved reklamalar
      const approvedAds = JSON.parse(localStorage.getItem("approvedMarketAds") || "[]");
      const userApproved = approvedAds.filter(ad => ad.sellerId === user.id);
      
      // Rejected reklamalar
      const rejectedAds = JSON.parse(localStorage.getItem("rejectedMarketAds") || "[]");
      const userRejected = rejectedAds.filter(ad => ad.sellerId === user.id);
      
      const allUserAds = [...userPending, ...userApproved, ...userRejected]
        .sort((a, b) => b.createdAt - a.createdAt);
      
      setUserAdsHistory(allUserAds);
    } catch (error) {
      console.error("Reklama tarixini yuklashda xatolik:", error);
    }
  };

  // Story progress bar
  useEffect(() => {
    if (modalOpen === "story" && ads.length > 0) {
      setProgress(0);
      clearInterval(progressInterval.current);
      
      const duration = 7000; // 7 soniya
      const step = 30; // Har 30ms
      const increment = (100 * step) / duration;
      
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            handleNextStory();
            return 0;
          }
          return Math.min(prev + increment, 100);
        });
      }, step);
      
      return () => clearInterval(progressInterval.current);
    }
  }, [currentStoryIndex, modalOpen, ads.length]);

  // Storyga bosilganda
  const markAsViewed = (adId) => {
    try {
      if (!viewedAds.includes(adId)) {
        const updated = [...viewedAds, adId];
        setViewedAds(updated);
        localStorage.setItem("viewedMarketStories", JSON.stringify(updated));
        
        // Click statistikasini oshirish
        const allAds = JSON.parse(localStorage.getItem("approvedMarketAds") || "[]");
        const updatedAds = allAds.map(ad => {
          if (ad.id === adId) {
            return { 
              ...ad, 
              views: (ad.views || 0) + 1,
              uniqueViews: (ad.uniqueViews || 0) + 1,
              lastViewedAt: Date.now()
            };
          }
          return ad;
        });
        localStorage.setItem("approvedMarketAds", JSON.stringify(updatedAds));
      } else {
        // Faqat views ni oshiramiz, uniqueViews emas
        const allAds = JSON.parse(localStorage.getItem("approvedMarketAds") || "[]");
        const updatedAds = allAds.map(ad => {
          if (ad.id === adId) {
            return { 
              ...ad, 
              views: (ad.views || 0) + 1,
              lastViewedAt: Date.now()
            };
          }
          return ad;
        });
        localStorage.setItem("approvedMarketAds", JSON.stringify(updatedAds));
      }
    } catch (error) {
      console.error("Ko'rish statistikasini yangilashda xatolik:", error);
    }
  };

  const openStory = (index) => {
    if (ads[index]) {
      setCurrentStoryIndex(index);
      setModalOpen("story");
      markAsViewed(ads[index].id);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => {
        const newIndex = prev - 1;
        if (ads[newIndex]) {
          markAsViewed(ads[newIndex].id);
        }
        return newIndex;
      });
      setProgress(0);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIndex < ads.length - 1) {
      setCurrentStoryIndex(prev => {
        const newIndex = prev + 1;
        if (ads[newIndex]) {
          markAsViewed(ads[newIndex].id);
        }
        return newIndex;
      });
      setProgress(0);
    } else {
      setModalOpen(null);
    }
  };

  // Rasm yuklash
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Fayl turini tekshirish
    if (!file.type.startsWith("image/")) {
      showAlertMessage("Faqat rasm fayllari yuklanishi mumkin! (JPG, PNG, GIF, WebP)", "error");
      return;
    }
    
    // Fayl hajmini tekshirish (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlertMessage("Rasm hajmi 5MB dan oshmasligi kerak!", "error");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdForm(prev => ({ 
        ...prev, 
        imageFile: file, 
        imagePreview: reader.result 
      }));
    };
    reader.onerror = () => {
      showAlertMessage("Rasm yuklashda xatolik yuz berdi! Qayta urinib ko'ring.", "error");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setAdForm(prev => ({ ...prev, imageFile: null, imagePreview: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reklama narxini hisoblash
  const calculateAdPrice = () => {
    let basePrice = 500; // kuniga
    let multiplier = 1;
    
    // Priority multiplier
    switch(adForm.priority) {
      case "high":
        multiplier = 1.5;
        break;
      case "medium":
        multiplier = 1.2;
        break;
      case "low":
        multiplier = 0.8;
        break;
      default:
        multiplier = 1;
    }
    
    // Category multiplier
    switch(adForm.category) {
      case "gaming":
        multiplier *= 1.3;
        break;
      case "premium":
        multiplier *= 2;
        break;
      case "urgent":
        multiplier *= 1.5;
        break;
    }
    
    return Math.round(basePrice * adForm.duration * multiplier);
  };

  // Reklama joylashtirish
  const handlePlaceAd = async () => {
    if (isSubmitting) return;
    
    const { text, imagePreview, duration, url, category, targetAudience, priority } = adForm;
    
    // Validatsiyalar
    if (!text.trim()) {
      return showAlertMessage("Iltimos, reklama matnini kiriting!", "error");
    }
    
    if (text.length < 10) {
      return showAlertMessage("Reklama matni kamida 10 belgidan iborat bo'lishi kerak!", "error");
    }
    
    if (text.length > 250) {
      return showAlertMessage("Reklama matni 250 belgidan oshmasligi kerak!", "error");
    }
    
    if (!imagePreview) {
      return showAlertMessage("Rasm yuklash majburiy! Reklamangizga mos rasm tanlang.", "error");
    }

    const cost = calculateAdPrice();
    
    if (!user || (user?.balance || 0) < cost) {
      return showAlertMessage(
        `💰 Balans yetarli emas!\n\n` +
        `Sizda: ${(user?.balance || 0).toLocaleString()} so'm\n` +
        `Kerak: ${cost.toLocaleString()} so'm\n\n` +
        `Iltimos, balansingizni to'ldiring.`, 
        "error",
        "Balans Yetarli Emas"
      );
    }

    setIsSubmitting(true);

    try {
      // Yangi reklama obyekti
      const newAd = {
        id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: text.trim(),
        image: imagePreview,
        url: url.trim() || null,
        duration,
        cost,
        category,
        targetAudience,
        priority,
        expiresAt: Date.now() + duration * 24 * 60 * 60 * 1000,
        seller: user.login || user.username || "Foydalanuvchi",
        sellerAvatar: user.avatar || "",
        sellerId: user.id || null,
        createdAt: Date.now(),
        status: "pending",
        views: 0,
        uniqueViews: 0,
        clicks: 0,
        ctr: 0,
        adminComment: "",
        approvedAt: null,
        approvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: ""
      };

      // Pending ro'yxatiga qo'shish
      const pending = JSON.parse(localStorage.getItem("pendingMarketAds") || "[]");
      pending.push(newAd);
      localStorage.setItem("pendingMarketAds", JSON.stringify(pending));

      // Balansni yangilash
      const newBalance = user.balance - cost;
      const transaction = {
        id: `hist_${Date.now()}`,
        date: new Date().toLocaleString('uz-UZ'),
        action: `Market reklama (${duration} kun) - ${category}`,
        amount: -cost,
        status: "pending",
        type: "advertisement",
        adId: newAd.id,
        details: {
          duration,
          priority,
          targetAudience,
          category
        }
      };
      
      const updatedUser = {
        ...user,
        balance: newBalance,
        history: [
          ...(user.history || []),
          transaction
        ]
      };
      
      updateUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      // Foydalanuvchi reklama tarixini yangilash
      loadUserAdsHistory();

      // Muvaffaqiyat xabari
      showAlertMessage(
        `🎉 Reklama so'rovi muvaffaqiyatli yuborildi!\n\n` +
        `📝 Holat: **Kutilmoqda**\n` +
        `💰 Narxi: ${cost.toLocaleString()} so'm\n` +
        `📅 Muddati: ${duration} kun\n` +
        `🎯 Auditorya: ${getAudienceLabel(targetAudience)}\n` +
        `⭐ Prioritet: ${getPriorityLabel(priority)}\n\n` +
        `⏳ Admin tasdiqlashini kuting (24 soat ichida)\n` +
        `📊 Holatni "Reklama tarixi" bo'limida kuzatishingiz mumkin`,
        "success",
        "So'rov Yuborildi!"
      );

      // Formani tozalash
      setAdForm({ 
        text: "", 
        imageFile: null, 
        imagePreview: "", 
        url: "", 
        duration: 7,
        category: "general",
        targetAudience: "all",
        priority: "normal"
      });
      
      // Formani yashirish
      setShowAdsForm(false);
      
      // File inputni tozalash
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Reklama joylashtirishda xatolik:", error);
      showAlertMessage(
        "Reklama joylashtirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        "error",
        "Xatolik"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auditorya label
  const getAudienceLabel = (audience) => {
    switch(audience) {
      case "all": return "Barcha foydalanuvchilar";
      case "gamers": return "Geymerlar";
      case "premium": return "Premium foydalanuvchilar";
      case "new": return "Yangi foydalanuvchilar";
      default: return "Barcha";
    }
  };

  // Priority label
  const getPriorityLabel = (priority) => {
    switch(priority) {
      case "high": return "Yuqori ⭐⭐⭐";
      case "medium": return "O'rta ⭐⭐";
      case "low": return "Past ⭐";
      default: return "Oddiy";
    }
  };

  // URL tekshirish
  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
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
    
    if (type === "success") {
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
  };

  // Formni bekor qilish
  const handleCancelForm = () => {
    if (adForm.text || adForm.imagePreview) {
      if (window.confirm("Rostdan ham bekor qilmoqchimisiz? Kiritilgan ma'lumotlar yo'qoladi.")) {
        setAdForm({ 
          text: "", 
          imageFile: null, 
          imagePreview: "", 
          url: "", 
          duration: 7,
          category: "general",
          targetAudience: "all",
          priority: "normal"
        });
        setShowAdsForm(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      setShowAdsForm(false);
    }
  };

  // Story link bosilganda
  const handleStoryLinkClick = (e, url) => {
    e.stopPropagation();
    if (url && ads[currentStoryIndex]) {
      const adId = ads[currentStoryIndex].id;
      
      // Click statistikasini oshirish
      const allAds = JSON.parse(localStorage.getItem("approvedMarketAds") || "[]");
      const updatedAds = allAds.map(ad => {
        if (ad.id === adId) {
          const newClicks = (ad.clicks || 0) + 1;
          const newCTR = ad.views > 0 ? ((newClicks / ad.views) * 100).toFixed(2) : 0;
          return { 
            ...ad, 
            clicks: newClicks,
            ctr: newCTR,
            lastClickedAt: Date.now()
          };
        }
        return ad;
      });
      localStorage.setItem("approvedMarketAds", JSON.stringify(updatedAds));
      
      // URL ni ochish
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Format muddat
  const formatTimeLeft = (expiresAt) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "Tugagan";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} kun`;
    if (hours > 0) return `${hours} soat`;
    return "1 soatdan kam";
  };

  // Reklama statistikasini ko'rish
  const viewAdStats = (ad) => {
    setAdStats(ad);
    setShowStats(true);
  };

  // Reklama holati label
  const getStatusLabel = (status) => {
    switch(status) {
      case "pending": return { text: "Kutilmoqda", icon: <MdPendingActions />, color: "#FFA500" };
      case "approved": return { text: "Tasdiqlangan", icon: <MdVerified />, color: "#00C853" };
      case "rejected": return { text: "Rad etilgan", icon: <MdCancel />, color: "#FF3D00" };
      default: return { text: "Noma'lum", icon: <FiInfo />, color: "#757575" };
    }
  };

  // Category label
  const getCategoryLabel = (category) => {
    switch(category) {
      case "gaming": return { text: "🎮 Gaming", color: "#9C27B0" };
      case "premium": return { text: "⭐ Premium", color: "#FFD700" };
      case "urgent": return { text: "⚡ Shoshilinch", color: "#FF5252" };
      case "discount": return { text: "🏷️ Chegirma", color: "#4CAF50" };
      default: return { text: "📢 Umumiy", color: "#2196F3" };
    }
  };

  return (
    <>
      {/* ALERT MODAL */}
      {showAlert && (
        <div className="market-alert-modal-overlay" onClick={() => setShowAlert(false)}>
          <div className={`market-alert-modal market-alert-${alertType}`} onClick={e => e.stopPropagation()}>
            <div className="market-alert-header">
              {alertType === "success" && <FiCheck size={22} />}
              {alertType === "error" && <FiAlertCircle size={22} />}
              {alertType === "info" && <FiInfo size={22} />}
              <h3>{alertTitle}</h3>
            </div>
            <div className="market-alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="market-alert-footer">
              <button onClick={() => setShowAlert(false)}>
                {alertType === "success" ? "Davom etish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStats && adStats && (
        <div className="stats-modal-overlay" onClick={() => setShowStats(false)}>
          <div className="stats-modal" onClick={e => e.stopPropagation()}>
            <div className="stats-modal-header">
              <h3>📊 Reklama statistikasi</h3>
              <button onClick={() => setShowStats(false)} className="stats-close-btn">
                <FiX size={20} />
              </button>
            </div>
            <div className="stats-modal-body">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><FiEye size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-value">{adStats.views || 0}</div>
                    <div className="stat-label">Ko'rishlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FiUsers size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-value">{adStats.uniqueViews || 0}</div>
                    <div className="stat-label">Nozik ko'rishlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FiTrendingUp size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-value">{adStats.clicks || 0}</div>
                    <div className="stat-label">Bosishlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FiBarChart2 size={24} /></div>
                  <div className="stat-content">
                    <div className="stat-value">{adStats.ctr || 0}%</div>
                    <div className="stat-label">CTR</div>
                  </div>
                </div>
              </div>
              
              <div className="stats-details">
                <h4>📝 Reklama ma'lumotlari</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Holat:</span>
                    <span className="detail-value" style={{ 
                      color: getStatusLabel(adStats.status).color,
                      fontWeight: "bold"
                    }}>
                      {getStatusLabel(adStats.status).text}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Boshlangan:</span>
                    <span className="detail-value">
                      {new Date(adStats.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tugash:</span>
                    <span className="detail-value">
                      {new Date(adStats.expiresAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Narx:</span>
                    <span className="detail-value">
                      {(adStats.cost || 0).toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STORIES BAR */}
      {ads.length > 0 && (
        <div className="stories-bar">
     
          <div className="stories-wrapper">
            {ads.map((ad, i) => {
              const category = getCategoryLabel(ad.category);
              return (
                <div key={ad.id} className="story-circle" onClick={() => openStory(i)}>
                  <div className={`story-ring ${viewedAds.includes(ad.id) ? "viewed" : "new"}`}>
                    <img 
                      src={ad.image || "/default-avatar.png"} 
                      alt={ad.seller} 
                      className="story-avatar" 
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div className="story-category-badge" style={{ background: category.color }}>
                      {category.text.charAt(0)}
                    </div>
                  </div>
                  <p className="story-username">
                    @{ad.seller?.length > 10 ? ad.seller.substring(0, 8) + "..." : ad.seller}
                  </p>
                  {ad.priority === "high" && (
                    <div className="story-priority-badge">
                      <FiStar size={10} />
                    </div>
                  )}
                  <div className="story-time-badge">
                    <FiClock size={10} />
                    <span>{formatTimeLeft(ad.expiresAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULLSCREEN STORY */}
      {modalOpen === "story" && ads.length > 0 && ads[currentStoryIndex] && (
        <div className="story-fullscreen">
          <div className="story-content" ref={storyRef}>
            {/* Progress bars */}
            <div className="story-progress-container">
              {ads.map((_, i) => (
                <div key={i} className="progress-segment-wrapper">
                  <div 
                    className="progress-segment" 
                    style={{ 
                      width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? `${progress}%` : "0%",
                      background: i === currentStoryIndex ? 
                        `linear-gradient(90deg, #0C73FE ${progress}%, #00c3ff)` : 
                        i < currentStoryIndex ? "#0C73FE" : "transparent"
                    }} 
                  />
                </div>
              ))}
            </div>

            {/* Navigation areas */}
            <div className="story-tap-left" onClick={handlePrevStory} />
            <div className="story-tap-right" onClick={handleNextStory} />

            {/* Story image */}
            <img 
              src={ads[currentStoryIndex].image} 
              alt="Story" 
              className="story-full-image"
              onError={(e) => {
                e.target.src = "/default-story.jpg";
              }}
            />

            {/* Story info overlay */}
            <div className="story-overlay-bottom">
              <div className="story-category" style={{ 
                background: getCategoryLabel(ads[currentStoryIndex].category).color 
              }}>
                {getCategoryLabel(ads[currentStoryIndex].category).text}
              </div>
              
              <p className="story-text">{ads[currentStoryIndex].text}</p>
              
              {ads[currentStoryIndex].url && (
                <a 
                  href={ads[currentStoryIndex].url}
                  onClick={(e) => handleStoryLinkClick(e, ads[currentStoryIndex].url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="story-link"
                >
                  <FiTrendingUp size={14} /> Batafsil ma'lumot →
                </a>
              )}
              
              <div className="story-meta">
                <div className="story-seller-info">
                  <img 
                    src={ads[currentStoryIndex].sellerAvatar || "/default-avatar.png"} 
                    alt={ads[currentStoryIndex].seller}
                    className="story-seller-avatar"
                  />
                  <div>
                    <p className="story-seller">@{ads[currentStoryIndex].seller}</p>
                    <div className="story-stats">
                      <span><FiEye size={12} /> {ads[currentStoryIndex].views || 0}</span>
                      {ads[currentStoryIndex].clicks > 0 && (
                        <span><FiTrendingUp size={12} /> {ads[currentStoryIndex].clicks || 0}</span>
                      )}
                      <span>CTR: {ads[currentStoryIndex].ctr || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="story-time-left">
                  <FiClock size={12} />
                  <span>{formatTimeLeft(ads[currentStoryIndex].expiresAt)}</span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button className="story-close-btn" onClick={() => setModalOpen(null)}>
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="market-page">
        <div className="market-container">
          {/* HEADER */}
       

          {/* ACTION BUTTONS */}
          <section className="action-buttons">
            <div className="action-grid">
              {/* Kartalar */}
              <div onClick={() => setModalOpen("cards")} className="action-item">
                <div className="action-icon">
                  <FiCreditCard size={24} />
                </div>
                <p>Kartalar</p>
              </div>
              
              {/* Do'konlar */}
              <div onClick={() => navigate("/all-shops")} className="action-item">
                <div className="action-icon">
                  <MdOutlineStorefront size={24} />
                </div>
                <p>Do'konlar</p>
              </div>
              
              {/* Aksiyalar */}
              <div onClick={() => navigate("/special-offers")} className="action-item">
                <div className="action-icon">
                  <MdLocalOffer size={24} />
                </div>
                <p>Aksiyalar</p>
              </div>
              
              {/* Statistika */}
              {userAdsHistory.length > 0 && (
                <div onClick={() => setShowAdsHistory(!showAdsHistory)} className="action-item">
                  <div className="action-icon">
                    <BsGraphUp size={24} />
                  </div>
                  <p>Statistika</p>
                </div>
              )}
              
              {/* REKLAMA QO'SHISH TUGMASI */}
              <div onClick={() => setShowAdsForm(!showAdsForm)} className="action-item ads-action">
                <div className="action-icon">
                  {showAdsForm ? <FiX size={24} /> : <MdCampaign size={24} />}
                </div>
                <p>{showAdsForm ? "Bekor qilish" : "Reklama joylashtirish"}</p>
              </div>
            </div>
          </section>

          {/* REKLAMA TARIXI */}
          {showAdsHistory && userAdsHistory.length > 0 && (
            <section className="ads-history-section">
              <div className="ads-history-header">
                <h3>📋 Reklama tarixim</h3>
                <span className="ads-history-count">{userAdsHistory.length} ta reklama</span>
              </div>
              <div className="ads-history-list">
                {userAdsHistory.map((ad, index) => {
                  const status = getStatusLabel(ad.status);
                  const category = getCategoryLabel(ad.category);
                  return (
                    <div key={ad.id} className="ads-history-card">
                      <div className="ads-history-image">
                        <img src={ad.image} alt="Ad" />
                      </div>
                      <div className="ads-history-info">
                        <div className="ads-history-header-row">
                          <h4>{ad.text.length > 50 ? ad.text.substring(0, 50) + "..." : ad.text}</h4>
                          <div className="ads-history-meta">
                            <span className="ads-history-date">
                              {new Date(ad.createdAt).toLocaleDateString('uz-UZ')}
                            </span>
                            <span className="ads-history-category" style={{ background: category.color }}>
                              {category.text}
                            </span>
                          </div>
                        </div>
                        <div className="ads-history-stats">
                          <span className="ads-history-price">
                            {(ad.cost || 0).toLocaleString()} so'm
                          </span>
                          <span className="ads-history-duration">
                            {ad.duration} kun
                          </span>
                          {ad.status === "approved" && ad.views > 0 && (
                            <span className="ads-history-views">
                              👁️ {ad.views}
                            </span>
                          )}
                        </div>
                        <div className="ads-history-status-row">
                          <div className="ads-history-status" style={{ color: status.color }}>
                            {status.icon}
                            <span>{status.text}</span>
                          </div>
                          {ad.status === "rejected" && ad.rejectionReason && (
                            <div className="ads-history-rejection">
                              <small>Sabab: {ad.rejectionReason}</small>
                            </div>
                          )}
                          {ad.status === "approved" && (
                            <button 
                              onClick={() => viewAdStats(ad)}
                              className="view-stats-btn"
                            >
                              <FiBarChart2 size={14} /> Statistika
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* PREMIUM REKLAMA FORMASI */}
          {showAdsForm && (
            <section className="ads-section-premium">
              <div className="ads-card">
                <div className="ads-balance-header">
                  <span className="ads-title">
                    <MdCampaign size={20} /> Premium Reklama Joylashtirish
                  </span>
                  <div className="balance-amount">
                    <img src={ValyutaLogo} alt="so'm" />
                    <span>{(user?.balance || 0).toLocaleString()} so'm</span>
                  </div>
                </div>

                {/* Reklama matni */}
                <div className="ads-input-group">
                  <label className="ads-label">
                    <FiInfo size={16} /> Reklama matni *
                  </label>
                  <textarea
                    placeholder="Masalan: 🎮 Yangi gaming turniri e'lon qilindi! 
🏆 G'oliblar uchun 1,000,000 so'm mukofot!
📅 Ro'yxatdan o'tish muddati: 10 kun

👉 Batafsil ma'lumot uchun pastdagi havolani bosing!"
                    maxLength={250}
                    rows={4}
                    value={adForm.text}
                    onChange={(e) => setAdForm(prev => ({ ...prev, text: e.target.value }))}
                    disabled={isSubmitting}
                    className="ads-textarea"
                  />
                  <div className="ads-char-counter">
                    {adForm.text.length}/250
                  </div>
                </div>

                {/* Rasm yuklash */}
                <div className="ads-upload-area">
                  <label className="ads-label">
                    <FiImage size={16} /> Reklama rasmi *
                  </label>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    id="premium-ad-image" 
                    style={{ display: "none" }}
                    disabled={isSubmitting}
                  />
                  {!adForm.imagePreview ? (
                    <label htmlFor="premium-ad-image" className="upload-placeholder">
                      <div className="upload-placeholder-content">
                        <BsFillCameraFill size={40} color="#0C73FE" />
                        <span className="upload-text">📸 16:9 formatidagi rasm yuklang</span>
                        <small className="upload-hint">Maksimal hajm: 5MB | JPG, PNG, WebP</small>
                      </div>
                    </label>
                  ) : (
                    <div className="image-preview">
                      <img src={adForm.imagePreview} alt="Preview" />
                      <button 
                        onClick={removeImage} 
                        className="remove-btn"
                        disabled={isSubmitting}
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Havola */}
                <div className="ads-input-group">
                  <label className="ads-label">
                    <FiLink size={16} /> Havola (ixtiyoriy)
                  </label>
                  <div className="input-with-icon">
                    <FiLink className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="https://teamsprit.gg yoki @telegram_username"
                      value={adForm.url}
                      onChange={(e) => setAdForm(prev => ({ ...prev, url: e.target.value }))}
                      disabled={isSubmitting}
                      className={`ads-input ${adForm.url && !validateUrl(adForm.url) ? "input-error" : ""}`}
                    />
                  </div>
                  {adForm.url && !validateUrl(adForm.url) && (
                    <small className="error-text">Noto'g'ri URL format (masalan: https://example.com)</small>
                  )}
                </div>

                {/* Kategoriya va Auditorya */}
                <div className="ads-options-row">
                  <div className="ads-option-group">
                    <label className="ads-label">
                      <AiFillTag size={16} /> Kategoriya
                    </label>
                    <select
                      value={adForm.category}
                      onChange={(e) => setAdForm(prev => ({ ...prev, category: e.target.value }))}
                      className="ads-select"
                      disabled={isSubmitting}
                    >
                      <option value="general">📢 Umumiy</option>
                      <option value="gaming">🎮 Gaming</option>
                      <option value="premium">⭐ Premium</option>
                      <option value="urgent">⚡ Shoshilinch</option>
                      <option value="discount">🏷️ Chegirma</option>
                    </select>
                  </div>
                  
                  <div className="ads-option-group">
                    <label className="ads-label">
                      <FiUsers size={16} /> Auditorya
                    </label>
                    <select
                      value={adForm.targetAudience}
                      onChange={(e) => setAdForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="ads-select"
                      disabled={isSubmitting}
                    >
                      <option value="all">👥 Barcha foydalanuvchilar</option>
                      <option value="gamers">🎮 Geymerlar</option>
                      <option value="premium">⭐ Premium foydalanuvchilar</option>
                      <option value="new">🆕 Yangi foydalanuvchilar</option>
                    </select>
                  </div>
                  
                  <div className="ads-option-group">
                    <label className="ads-label">
                      <TbTargetArrow size={16} /> Prioritet
                    </label>
                    <select
                      value={adForm.priority}
                      onChange={(e) => setAdForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="ads-select"
                      disabled={isSubmitting}
                    >
                      <option value="normal">⚪ Oddiy</option>
                      <option value="low">🟡 Past</option>
                      <option value="medium">🟠 O'rta</option>
                      <option value="high">🔴 Yuqori</option>
                    </select>
                  </div>
                </div>

                {/* Muddati */}
                <div className="ads-duration-section">
                  <div className="duration-info-row">
                    <div className="duration-text">
                      <FiClock size={16} /> Ko'rsatish muddati
                    </div>
                    <div className="price-info">
                      <div className="price-row">
                        <FiDollarSign size={14} />
                        <span>Asosiy narx: 500 so'm/kun</span>
                      </div>
                      <div className="price-row">
                        <span>Ko'paytiruvchi: {
                          adForm.priority === "high" ? "1.5x" :
                          adForm.priority === "medium" ? "1.2x" :
                          adForm.priority === "low" ? "0.8x" : "1x"
                        }</span>
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
                      disabled={isSubmitting}
                    />
                    <div className="slider-track"></div>
                    <div 
                      className="slider-fill" 
                      style={{ width: `${((adForm.duration - 1) / 29) * 100}%` }}
                    ></div>
                    <div 
                      className="slider-thumb" 
                      style={{ left: `${((adForm.duration - 1) / 29) * 100}%` }}
                    >
                      <div className="thumb-circle"></div>
                    </div>
                    <div 
                      className="thumb-value" 
                      style={{ left: `${((adForm.duration - 1) / 29) * 100}%` }}
                    >
                      {adForm.duration} kun
                    </div>
                  </div>

                  <div className="duration-labels">
                    <span>1 kun</span>
                    <span>7 kun</span>
                    <span>15 kun</span>
                    <span>30 kun</span>
                  </div>
                </div>

                {/* Jami narx */}
                <div className="ads-total-price">
                  <div className="total-label">Jami to'lov summasi</div>
                  <div className="total-amount">
                    {calculateAdPrice().toLocaleString()} so'm
                  </div>
                  <div className="total-breakdown">
                    <small>
                      {adForm.duration} kun × 500 so'm = {(adForm.duration * 500).toLocaleString()} so'm
                    </small>
                    {adForm.priority !== "normal" && (
                      <small>
                        Prioritet ({adForm.priority}) × {
                          adForm.priority === "high" ? "1.5" :
                          adForm.priority === "medium" ? "1.2" : "0.8"
                        }
                      </small>
                    )}
                  </div>
                </div>

                {/* Tugmalar */}
                <div className="ads-buttons-row">
                  <button
                    onClick={handleCancelForm}
                    className="ads-cancel-btn"
                    disabled={isSubmitting}
                  >
                    <FiX size={16} /> Bekor qilish
                  </button>
                  <button
                    onClick={handlePlaceAd}
                    className="ads-submit-premium"
                    disabled={!adForm.text.trim() || !adForm.imagePreview || isSubmitting || (adForm.url && !validateUrl(adForm.url))}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Jo'natilmoqda...
                      </>
                    ) : (
                      <>
                        <BsShieldCheck size={16} /> 
                        Reklama joylashtirish ({calculateAdPrice().toLocaleString()} so'm)
                      </>
                    )}
                  </button>
                </div>

                {/* Qo'shimcha ma'lumot */}
                <div className="ads-info-footer">
                  <div className="info-item">
                    <FiInfo size={12} />
                    <span>Reklama admin tomonidan tekshirilgandan so'ng faollashtiriladi</span>
                  </div>
                  <div className="info-item">
                    <FiClock size={12} />
                    <span>Tasdiqlash vaqti: 24 soat ichida</span>
                  </div>
                  <div className="info-item">
                    <MdTrendingUp size={12} />
                    <span>Reklama 30.000+ foydalanuvchiga ko'rsatiladi</span>
                  </div>
                  <div className="info-item">
                    <BsGraphUp size={12} />
                    <span>Statistika va monitoring mavjud</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Bo'sh reklama holati */}
          {!showAdsForm && !showAdsHistory && ads.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <BsArrowRightCircleFill size={60} color="#0C73FE" />
              </div>
              <h3>Hozircha reklamalar mavjud emas</h3>
              <p>Birinchi bo'lib reklama joylashtiring va barcha foydalanuvchilarga ko'rsating!</p>
              <div className="empty-state-stats">
                <div className="stat-bubble">
                  <FiUsers size={20} />
                  <span>30,000+</span>
                  <small>Foydalanuvchi</small>
                </div>
                <div className="stat-bubble">
                  <FiEye size={20} />
                  <span>100,000+</span>
                  <small>Ko'rish/kun</small>
                </div>
                <div className="stat-bubble">
                  <FiTrendingUp size={20} />
                  <span>15%</span>
                  <small>O'rtacha CTR</small>
                </div>
              </div>
              <button 
                onClick={() => setShowAdsForm(true)}
                className="empty-state-btn"
              >
                <FiPlus size={18} /> Premium Reklama joylashtirish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KARTALAR MODAL */}
      {modalOpen === "cards" && (
        <div className="full-modal-overlay" onClick={() => setModalOpen(null)}>
          <div className="full-modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(null)} className="modal-close-btn">
              <FiX size={18} />
            </button>
            <Cards user={user} updateUser={updateUser} />
          </div>
        </div>
      )}
    </>
  );
}

export default Market;