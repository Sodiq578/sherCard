// src/components/MainMenu.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  RiWallet3Line,
  RiChat3Line,
  RiUser3Line,
  RiSearchLine,
  RiSendPlaneLine,
  RiAddCircleLine,
  RiGiftLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiArrowLeftLine,
  RiVipCrownLine,
  RiStarSFill,
  RiExternalLinkLine,
  RiMoneyDollarCircleLine,
  RiShoppingBagLine,
  RiCoinLine,
} from "react-icons/ri";
import Logo from "../assets/images/logo.png";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  // ==================== STATES ====================
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modallar
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Token yuborish uchun
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [sendTokenSearch, setSendTokenSearch] = useState("");
  const [filteredSendUsers, setFilteredSendUsers] = useState([]);

  // To'lov uchun
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Universal Alert
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
    title: "",
    action: null,
    actionText: "",
  });

  // Main Banner state
  const [mainBanners, setMainBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // ==================== MAHSULOTLAR ====================
  const products = [
    {
      id: 1,
      name: "Premium Kurs",
      description: "1 oylik premium kursga kirish",
      price: 50000,
      tokens: 50000,
      duration: "1 oy",
      features: ["Barcha darslarga kirish", "Premium kontent", "Qo'llab-quvvatlash"]
    },
    {
      id: 2,
      name: "Pro Paket",
      description: "3 oylik pro paket",
      price: 120000,
      tokens: 120000,
      duration: "3 oy",
      features: ["Barcha kurslar", "Shaxsiy murabbiy", "Certifikat"]
    },
    {
      id: 3,
      name: "VIP Obuna",
      description: "1 yillik VIP obuna",
      price: 400000,
      tokens: 400000,
      duration: "1 yil",
      features: ["Barcha imkoniyatlar", "Shaxsiy konsultatsiya", "Premium qo'llab-quvvatlash"]
    }
  ];

  // ==================== KARTA LOGIKASI ====================
  const getUserCards = () => {
    if (!user?.cards || user.cards.length === 0) {
      return [{
        number: "8989 8989 8989 8989",
        holder: user?.profile?.name || "Foydalanuvchi"
      }];
    }

    return user.cards
      .filter(card => !card.deleted)
      .map(card => {
        let rawNumber = "";
        if (typeof card === "string") {
          rawNumber = card.replace(/\s/g, "");
        } else {
          rawNumber = (card.number || card.cardNumber || "").replace(/\s/g, "");
        }

        if (![12, 16].includes(rawNumber.length)) {
          rawNumber = "8989898989898989";
        }

        const fullNumber = rawNumber.padEnd(16, "0").slice(0, 16);
        const formatted = fullNumber.replace(/(\d{4})/g, "$1 ").trim();

        return {
          number: formatted,
          holder: card.holder || user?.profile?.name || "Foydalanuvchi"
        };
      });
  };

  const userCards = getUserCards();
  const [selectedCard, setSelectedCard] = useState(userCards[0] || { number: "8989 8989 8989 8989" });

  const goToCards = () => {
    navigate("/cards");
  };

  // ==================== BANNER FUNKSIYALARI ====================
  useEffect(() => {
    loadMainBanners();
  }, []);

  const loadMainBanners = () => {
    try {
      const bannersData = JSON.parse(localStorage.getItem('mainBanners') || '[]');
      const activeBanners = bannersData.filter(banner => banner.active);
      setMainBanners(activeBanners);
      
      if (activeBanners.length > 1) {
        const interval = setInterval(() => {
          setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
        }, 5000);
        
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Bannerlarni yuklashda xato:", error);
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    } else {
      // BANNER BOSILGANDA TO'LOV MODALINI OCHISH
      setShowPaymentModal(true);
    }
  };

  const nextBanner = () => {
    setCurrentBannerIndex(prev => (prev + 1) % mainBanners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(prev => (prev - 1 + mainBanners.length) % mainBanners.length);
  };

  // ==================== ALERT FUNKSIYALARI ====================
  const showAlert = (message, type = "success", title = "", action = null, actionText = "OK") => {
    setAlert({
      show: true,
      message,
      type,
      title: title || (type === "success" ? "Muvaffaqiyatli" : type === "error" ? "Xatolik" : "Diqqat"),
      action,
      actionText
    });
  };

  const closeAlert = () => setAlert({ ...alert, show: false });
  const handleAlertAction = () => {
    if (alert.action) alert.action();
    closeAlert();
  };

  // ==================== FOYDALANUVCHILAR YUKLASH ====================
  useEffect(() => {
    const loadUsers = () => {
      try {
        const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
        setAllUsers(users);
      } catch (err) {
        console.error("allUsers yuklashda xato:", err);
      }
    };
    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  // ==================== TOKEN BILAN TO'LOV FUNKSIYALARI ====================
  const handleTokenPayment = (product) => {
    if (user.balance < product.tokens) {
      showAlert(
        `Balansingizda yetarli token mavjud emas!\n\nSizda: ${user.balance.toLocaleString()} token\nKerak: ${product.tokens.toLocaleString()} token`,
        "error"
      );
      return;
    }

    const confirmPayment = () => {
      const updatedUser = {
        ...user,
        balance: user.balance - product.tokens,
        history: [...(user.history || []), {
          time: new Date().toLocaleString("uz-UZ"),
          action: `To'lov amalga oshirildi - ${product.name}`,
          amount: `-${product.tokens.toLocaleString()} token`,
          details: `Mahsulot: ${product.name}`
        }]
      };

      localStorage.setItem("userData", JSON.stringify(updatedUser));
      updateUser(updatedUser);
      
      showAlert(
        `To'lov muvaffaqiyatli amalga oshirildi!\n\n` +
        `Mahsulot: ${product.name}\n` +
        `To'langan: ${product.tokens.toLocaleString()} token\n` +
        `Yangi balans: ${updatedUser.balance.toLocaleString()} token`,
        "success"
      );
      setShowPaymentModal(false);
      setSelectedProduct(null);
    };

    showAlert(
      `${product.name} sotib olish uchun ${product.tokens.toLocaleString()} token to'lashingiz kerak.\n\n` +
      `Joriy balans: ${user.balance.toLocaleString()} token\n` +
      `To'landan keyin: ${(user.balance - product.tokens).toLocaleString()} token`,
      "info",
      "To'lovni tasdiqlash",
      confirmPayment,
      "Token bilan to'lash"
    );
  };

  // ==================== TOKEN YUBORISH FUNKSIYALARI ====================
  const handleSendTokens = () => {
    const amount = parseInt(tokenAmount);
    if (!selectedUser) return showAlert("Foydalanuvchi tanlanmadi!", "error");
    if (!amount || amount < 100) return showAlert("Minimal 100 token!", "error");
    if (amount > user.balance) return showAlert("Balans yetarli emas!", "error");

    const confirmSend = () => {
      try {
        const sender = {
          ...user,
          balance: user.balance - amount,
          history: [...(user.history || []), {
            time: new Date().toLocaleString("uz-UZ"),
            action: `Token yuborildi → @${selectedUser.profile.username}`,
            amount: `-${amount.toLocaleString()} token`,
            details: `Karta: ${selectedCard.number}`
          }]
        };

        const updatedAllUsers = allUsers.map(u =>
          u.login === selectedUser.login
            ? {
                ...u,
                balance: (u.balance || 0) + amount,
                history: [...(u.history || []), {
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `Token qabul qilindi ← @${user.profile.username}`,
                  amount: `+${amount.toLocaleString()} token`,
                  details: `Karta: ${selectedCard.number}`
                }],
                messages: [...(u.messages || []), {
                  id: Date.now() + Math.random(),
                  from: user.login,
                  to: u.login,
                  text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                  time: new Date().toLocaleString("uz-UZ"),
                  type: "token",
                  amount,
                  read: false,
                  card: selectedCard.number
                }]
              }
            : u
        );

        localStorage.setItem("userData", JSON.stringify(sender));
        localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));
        updateUser(sender);
        setAllUsers(updatedAllUsers);

        showAlert(`@${selectedUser.profile.username} ga ${amount.toLocaleString()} token yuborildi!`, "success");
        setShowSendTokens(false);
        setSelectedUser(null);
        setTokenAmount("");
        setSendTokenSearch("");
      } catch (err) {
        showAlert("Xatolik yuz berdi!", "error");
      }
    };

    showAlert(
      `@${selectedUser.profile.username} ga ${amount.toLocaleString()} token yuborilsinmi?\n\nQoladi: ${(user.balance - amount).toLocaleString()} token`,
      "info",
      "Tasdiqlash",
      confirmSend,
      "Yuborish"
    );
  };

  // ==================== PREMIUM SOTIB OLISH ====================
  const handleBuyPremium = () => {
    if (user.isPremium) return showAlert("Sizda allaqachon Premium bor!", "info");
    if (user.balance < 10000) return showAlert("10 000 token yetarli emas!", "error");

    const confirm = () => {
      const updated = {
        ...user,
        balance: user.balance - 10000,
        isPremium: true,
        premiumSince: new Date().toISOString(),
        history: [...(user.history || []), {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Premium obuna sotib olindi",
          amount: "-10 000 token"
        }]
      };
      localStorage.setItem("userData", JSON.stringify(updated));
      updateUser(updated);
      setShowPremiumModal(false);
      showAlert("Tabriklaymiz! Premium faollashtirildi!", "success");
    };

    showAlert("10 000 token evaziga Premium sotib olasizmi?", "info", "Tasdiqlash", confirm, "Sotib olish");
  };

  // ==================== MA'LUMOTLAR ====================
  const username = user?.profile?.username || "username";

  return (
    <div className="main-menu-container">

      {/* UNIVERSAL ALERT MODAL */}
      {alert.show && (
        <div className="menu-alert-modal-overlay" onClick={closeAlert}>
          <div className={`menu-alert-modal menu-alert-${alert.type}`} onClick={e => e.stopPropagation()}>
            <div className="menu-alert-header">
              {alert.type === "success" && <RiCheckLine className="menu-alert-header-icon" />}
              {alert.type === "error" && <RiErrorWarningLine className="menu-alert-header-icon" />}
              {alert.type === "info" && <RiInformationLine className="menu-alert-header-icon" />}
              <h3>{alert.title}</h3>
            </div>
            <div className="menu-alert-body">
              <p style={{ whiteSpace: "pre-line" }}>{alert.message}</p>
            </div>
            <div className="menu-alert-footer">
              {alert.action && (
                <button className="menu-alert-action-btn" onClick={handleAlertAction}>
                  {alert.actionText}
                </button>
              )}
              <button className="menu-alert-close-btn" onClick={closeAlert}>
                {alert.action ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="ultra-header">
        <div className="ultra-avatar" onClick={() => navigate("/profile")}>
          <img src={user?.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
        </div>
        <div className="ultra-username">@{username}</div>
        {user?.isPremium && <div className="ultra-premium-badge"><RiVipCrownLine /></div>}
      </div>

      {/* BALANS KARTASI */}
      <div className="ultra-card-wrapper" onClick={goToCards} style={{ cursor: "pointer" }}>
        <div className="ultra-card">
          <div className="ultra-card-username">@{username}</div>
          <div className="ultra-card-balance">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="token" className="ultra-token-lg" />
          </div>
          <div className="ultra-card-number">
            {selectedCard?.number || "8989 8989 8989 8989"}
          </div>
        </div>
      </div>

      {/* TEZ AMALLAR */}
      <div className="ultra-actions">
        <button className="ultra-action" onClick={() => setShowSendTokens(true)}>
          <div className="ultra-icon"><RiSendPlaneLine size={32} /></div>
          <span>Ball yuborish</span>
        </button>
        <button className="ultra-action" onClick={() => setShowPaymentModal(true)}>
          <div className="ultra-icon blue"><RiShoppingBagLine size={32} /></div>
          <span>To'lov qilish</span>
        </button>
        <button className="ultra-action" onClick={() => setShowPremiumModal(true)}>
          <div className="ultra-icon pink"><RiGiftLine size={32} /></div>
          <span>Premium</span>
        </button>
      </div>

      {/* YANGI ASOSIY REKLAMA BANNER - BOSILGANDA TO'LOV MODALI OCHILADI */}
      {mainBanners.length > 0 ? (
        <div className="main-banner-carousel">
          {mainBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`main-banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
              onClick={() => handleBannerClick(banner)}
            >
              <img src={banner.image} alt={banner.title} />
              <div className="banner-content-overlay">
                {banner.title && <h3 className="banner-title">{banner.title}</h3>}
                {banner.desc && <p className="banner-description">{banner.desc}</p>}
                {banner.link ? (
                  <div className="banner-link-indicator">
                    <RiExternalLinkLine size={14} />
                    <span>Havola</span>
                  </div>
                ) : (
                  <div className="banner-payment-indicator">
                    <RiCoinLine size={14} />
                    <span>Token bilan to'lash</span>
                  </div>
                )}
              </div>
              
              {/* Banner navigatsiya */}
              {mainBanners.length > 1 && (
                <>
                  <button className="banner-nav-btn banner-prev" onClick={(e) => { e.stopPropagation(); prevBanner(); }}>
                    <RiArrowLeftLine />
                  </button>
                  <button className="banner-nav-btn banner-next" onClick={(e) => { e.stopPropagation(); nextBanner(); }}>
                    <RiArrowLeftLine style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  
                  <div className="banner-indicators">
                    {mainBanners.map((_, idx) => (
                      <button
                        key={idx}
                        className={`banner-indicator ${idx === currentBannerIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setCurrentBannerIndex(idx); }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* AGAR BANNER BO'LMASA, STANDART REKLAMA JOYI */
        <div className="asosiy-sahifa-reklama" onClick={() => setShowPaymentModal(true)}>
          <div className="reklama-placeholder">
            <RiCoinLine size={24} />
            <span>Token bilan to'lash</span>
          </div>
        </div>
      )}

      {/* TOKEN BILAN TO'LOV MODALI */}
      {showPaymentModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content payment-modal">
            <div className="menu-modal-header">
              <div className="payment-modal-title">
                <RiCoinLine className="payment-icon" />
                <h3>Token bilan to'lash</h3>
              </div>
              <button className="menu-modal-close-btn" onClick={() => setShowPaymentModal(false)}>
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {/* Balans ma'lumoti */}
              <div className="balance-info-section">
                <div className="balance-display">
                  <RiCoinLine className="balance-icon" />
                  <div className="balance-details">
                    <span className="balance-label">Joriy balans</span>
                    <span className="balance-amount">{user?.balance?.toLocaleString() || 0} token</span>
                  </div>
                </div>
              </div>

              {/* Mahsulotlar ro'yxati */}
              <div className="products-section">
                <h4>Mavjud mahsulotlar</h4>
                <div className="products-grid">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="product-header">
                        <h5 className="product-name">{product.name}</h5>
                        <div className="product-price">
                          <RiCoinLine size={16} />
                          <span>{product.tokens.toLocaleString()} token</span>
                        </div>
                      </div>
                      <p className="product-description">{product.description}</p>
                      <div className="product-duration">
                        <span>Davomiylik: {product.duration}</span>
                      </div>
                      <div className="product-features">
                        {product.features.map((feature, index) => (
                          <div key={index} className="product-feature">
                            <RiCheckLine size={14} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tanlangan mahsulot ma'lumotlari */}
              {selectedProduct && (
                <div className="selected-product-preview">
                  <h4>Tanlangan mahsulot</h4>
                  <div className="selected-product-details">
                    <div className="selected-product-info">
                      <h5>{selectedProduct.name}</h5>
                      <p>{selectedProduct.description}</p>
                    </div>
                    <div className="selected-product-price">
                      <div className="token-price">
                        <RiCoinLine size={20} />
                        <span>{selectedProduct.tokens.toLocaleString()} token</span>
                      </div>
                      <div className="balance-check">
                        {user.balance >= selectedProduct.tokens ? (
                          <div className="sufficient-balance">
                            <RiCheckLine size={16} />
                            <span>Balansingiz yetarli</span>
                          </div>
                        ) : (
                          <div className="insufficient-balance">
                            <RiErrorWarningLine size={16} />
                            <span>Balansingiz yetarli emas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="menu-modal-footer">
              <button
                className="menu-primary-btn payment-btn"
                onClick={() => selectedProduct && handleTokenPayment(selectedProduct)}
                disabled={!selectedProduct || user.balance < selectedProduct.tokens}
              >
                {selectedProduct ? (
                  <>
                    <RiCoinLine size={18} />
                    To'lash ({selectedProduct.tokens.toLocaleString()} token)
                  </>
                ) : (
                  "Mahsulot tanlang"
                )}
              </button>
              <button 
                className="menu-secondary-btn" 
                onClick={() => setShowPaymentModal(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN YUBORISH MODAL */}
      {showSendTokens && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-send-tokens-modal">
            <div className="menu-modal-header">
              <div className="menu-send-tokens-title">
                <button className="menu-back-btn" onClick={() => selectedUser ? setSelectedUser(null) : setShowSendTokens(false)}>
                  <RiArrowLeftLine />
                </button>
                <h3>{selectedUser ? "Token yuborish" : "Kimga yuborasiz?"}</h3>
              </div>
              <button className="menu-modal-close-btn" onClick={() => setShowSendTokens(false)}>
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {!selectedUser ? (
                <>
                  <div className="menu-search-bar">
                    <RiSearchLine className="menu-search-icon" />
                    <input
                      type="text"
                      placeholder="Username yoki ism kiriting..."
                      value={sendTokenSearch}
                      onChange={(e) => setSendTokenSearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {filteredSendUsers.length > 0 ? (
                    <div className="menu-search-user-list">
                      {filteredSendUsers.map(u => (
                        <div key={u.login} className="menu-search-user-item" onClick={() => setSelectedUser(u)}>
                          <div className="menu-search-user-avatar">
                            <img src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
                            {u.isPremium && <div className="menu-user-premium-indicator" />}
                          </div>
                          <div className="menu-search-user-info">
                            <p className="menu-search-username">
                              @{u.profile?.username} {u.isPremium && <span className="menu-premium-dot">Premium</span>}
                            </p>
                            <p className="menu-search-name">{u.profile?.name || "Foydalanuvchi"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : sendTokenSearch && <div className="menu-no-results">Hech narsa topilmadi</div>}
                </>
              ) : (
                <>
                  <div className="menu-selected-user">
                    <div className="menu-selected-user-avatar">
                      <img src={selectedUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
                      {selectedUser.isPremium && <div className="menu-user-premium-indicator" />}
                    </div>
                    <h4>@{selectedUser.profile?.username}</h4>
                    <p>{selectedUser.profile?.name || "Foydalanuvchi"}</p>
                  </div>

                  <div className="menu-card-selection">
                    <label>Karta tanlang</label>
                    <div className="menu-card-options">
                      {userCards.map((card, i) => (
                        <div
                          key={i}
                          className={`menu-card-option ${selectedCard.number === card.number ? "selected" : ""}`}
                          onClick={() => setSelectedCard(card)}
                        >
                          <div className="menu-card-number">{card.number}</div>
                          <div className="menu-card-holder">{card.holder}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="menu-token-input-section">
                    <label>Token miqdori</label>
                    <div className="menu-token-input-wrapper">
                      <input
                        type="number"
                        placeholder="100"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        min="100"
                      />
                      <span className="menu-token-symbol">
                        <img src={Logo} alt="token" className="ultra-token-sm" />
                      </span>
                    </div>
                    <div className="menu-balance-info">
                      Joriy balans: <strong>{user.balance.toLocaleString()} token</strong>
                    </div>
                    {tokenAmount >= 100 && (
                      <div className="menu-amount-preview">
                        <div>Yuboriladi: <strong>{parseInt(tokenAmount).toLocaleString()} token</strong></div>
                        <div>Qoladi: <strong>{(user.balance - parseInt(tokenAmount)).toLocaleString()} token</strong></div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {selectedUser && (
              <div className="menu-modal-footer">
                <button
                  className="menu-primary-btn"
                  onClick={handleSendTokens}
                  disabled={!tokenAmount || parseInt(tokenAmount) < 100 || parseInt(tokenAmount) > user.balance}
                >
                  Yuborish ({tokenAmount || 0} token)
                </button>
                <button className="menu-secondary-btn" onClick={() => setSelectedUser(null)}>Ortga</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showPremiumModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-premium-modal">
            <div className="menu-modal-header">
              <div className="menu-premium-modal-title">
                <RiStarSFill className="menu-premium-star-icon" />
                <h3>Premium Obuna</h3>
              </div>
              <button className="menu-modal-close-btn" onClick={() => setShowPremiumModal(false)}>
                <RiCloseLine />
              </button>
            </div>
            <div className="menu-modal-body">
              <div className="menu-premium-price-section">
                <div className="menu-premium-price">10 000 token</div>
                <div>Joriy balans: {(user?.balance || 0).toLocaleString()} token</div>
              </div>
              <button
                className={`menu-primary-btn ${user.balance < 10000 ? "menu-btn-disabled" : ""}`}
                onClick={handleBuyPremium}
                disabled={user.balance < 10000 || user.isPremium}
              >
                {user.isPremium ? "Premium faol" : "Sotib olish"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MainMenu;