import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPhone,
  FiCreditCard,
  FiMail,
  FiUser,
  FiStar,
  FiSend,
  FiClock,
  FiShield,
  FiAward,
  FiDollarSign,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiInfo
} from "react-icons/fi";
import "../styles/ViewProfile.css";

function ViewProfile() {
  const { login } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  
  // Modal statelari
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success, error, info
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const foundUser = allUsers.find(u => u.login === login);
    
    setCurrentUser(userData);
    setUser(foundUser);

    // Token o'tkazmalar tarixini yuklash
    if (userData && foundUser) {
      const history = (userData.history || []).filter(
        item => item.action && item.action.includes(`@${foundUser.profile?.username}`)
      );
      setTransferHistory(history.slice(-5).reverse());
    }
  }, [login]);

  // Modal alert ko'rsatish
  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const handleSendToken = async (amount) => {
    if (!currentUser || !user) return;

    const finalAmount = amount || parseInt(transferAmount);
    
    if (!finalAmount || finalAmount < 100) {
      showAlertMessage("Iltimos, 100 UZS dan kam bo'lmagan summa kiriting!", "error");
      return;
    }

    if (currentUser.balance < finalAmount) {
      showAlertMessage("Balansingizda yetarli mablag' yo'q!", "error");
      return;
    }

    setIsProcessing(true);

    // Simulyatsiya qilish uchun kichik kechikish
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Token o'tkazish
      const updatedCurrentUser = {
        ...currentUser,
        balance: currentUser.balance - finalAmount,
        history: [
          ...(currentUser.history || []),
          {
            time: new Date().toLocaleString("uz-UZ"),
            action: `Token o'tkazildi: @${user.profile?.username}`,
            amount: `-${finalAmount.toLocaleString()} UZS`,
            type: "transfer_sent"
          },
        ],
      };

      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const updatedUsers = allUsers.map(u => {
        if (u.login === user.login) {
          return {
            ...u,
            balance: (u.balance || 0) + finalAmount,
            history: [
              ...(u.history || []),
              {
                time: new Date().toLocaleString("uz-UZ"),
                action: `Token qabul qilindi: @${currentUser.profile?.username}`,
                amount: `+${finalAmount.toLocaleString()} UZS`,
                type: "transfer_received"
              },
            ],
          };
        }
        return u;
      });

      localStorage.setItem("userData", JSON.stringify(updatedCurrentUser));
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      
      // Yangilangan ma'lumotlarni state ga qayta yuklash
      setCurrentUser(updatedCurrentUser);
      setUser(updatedUsers.find(u => u.login === user.login));
      
      // Tarixni yangilash
      const newHistory = [
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: `Token o'tkazildi: @${user.profile?.username}`,
          amount: `-${finalAmount.toLocaleString()} UZS`,
          type: "transfer_sent"
        },
        ...transferHistory
      ].slice(0, 5);
      setTransferHistory(newHistory);

      showAlertMessage(`${finalAmount.toLocaleString()} UZS muvaffaqiyatli o'tkazildi! 🎉`, "success");
      setTransferAmount("");
      setShowCustomAmount(false);
    } catch (error) {
      showAlertMessage("O'tkazishda xatolik yuz berdi!", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  if (!user || !currentUser) {
    return (
      <div className="view-profile-container">
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiArrowLeft />
          </button>
          <h2>Profil</h2>
        </div>
        <div className="error-message">
          <p>Foydalanuvchi topilmadi</p>
        </div>
      </div>
    );
  }

  const userDetails = [
    {
      icon: FiUser,
      label: "To'liq ism",
      value: user.profile?.name || "Ko'rsatilmagan",
      show: true
    },
    {
      icon: FiPhone,
      label: "Telefon raqami",
      value: user.phoneNumber || user.profile?.phone || "Ko'rsatilmagan",
      show: true
    },
    {
      icon: FiMail,
      label: "Email",
      value: user.profile?.email || "Ko'rsatilmagan",
      show: !!user.profile?.email
    },
    {
      icon: FiCreditCard,
      label: "Karta raqami",
      value: user.cardNumber || (user.cards?.[0]?.number ? `•••• ${user.cards[0].number.slice(-4)}` : "Ko'rsatilmagan"),
      show: true
    },
    {
      icon: FiDollarSign,
      label: "Balans",
      value: `${(user.balance || 0).toLocaleString()} UZS`,
      show: true
    },
    {
      icon: FiShield,
      label: "Hisob holati",
      value: user.isPremium ? "Premium" : "Oddiy",
      show: true
    }
  ];

  return (
    <div className="view-profile-container">
      {/* Alert Modal */}
      {showAlert && (
        <div className={`view-profile-alert-modal view-profile-alert-${alertType}`}>
          <div className="view-profile-alert-content">
            <div className="view-profile-alert-header">
              {alertType === "success" && <FiCheck className="view-profile-alert-icon" />}
              {alertType === "error" && <FiAlertCircle className="view-profile-alert-icon" />}
              {alertType === "info" && <FiInfo className="view-profile-alert-icon" />}
              <h4 className="view-profile-alert-title">
                {alertType === "success" && "Muvaffaqiyatli!"}
                {alertType === "error" && "Xatolik!"}
                {alertType === "info" && "Ma'lumot"}
              </h4>
              <button 
                className="view-profile-alert-close"
                onClick={() => setShowAlert(false)}
              >
                <FiX />
              </button>
            </div>
            <p className="view-profile-alert-message">{alertMessage}</p>
            <div className="view-profile-alert-actions">
              <button 
                className="view-profile-alert-confirm"
                onClick={() => setShowAlert(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="view-profile-loading-overlay">
          <div className="view-profile-loading-content">
            <div className="view-profile-loading-spinner"></div>
            <p className="view-profile-loading-text">O'tkazish amalga oshirilmoqda...</p>
          </div>
        </div>
      )}

      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft />
        </button>
        <h2>Foydalanuvchi Profili</h2>
        <div className="header-actions">
     
        </div>
      </div>

      <div className="profile-content">
        {/* Asosiy profil ma'lumotlari */}
        <div className="profile-main-card">
          <div className="avatar-section">
            <div className="profile-avatar-container">
              <img
                src={user.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Avatar"
                className="profile-avatar"
              />
              {user.isPremium && (
                <div className="profile-premium-badge">
                  <FiStar size={16} />
                </div>
              )}
            </div>
            
            <div className="profile-basic-info">
              <h3 className="profile-username">@{user.profile?.username || "noma'lum"}</h3>
              <p className="profile-name">
                <FiUser className="name-icon" />
                {user.profile?.name || "Ism kiritilmagan"}
              </p>
              {user.isPremium && (
                <div className="premium-status-badge">
                  <FiAward className="premium-icon" />
                  <span>Premium Foydalanuvchi</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-details-grid">
            {userDetails.map((detail, index) => (
              detail.show && (
                <div key={index} className="detail-card">
                  <detail.icon className="detail-card-icon" />
                  <div className="detail-card-content">
                    <span className="detail-card-label">{detail.label}</span>
                    <span className="detail-card-value">{detail.value}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Token o'tkazish bo'limi */}
        <div className="token-transfer-section">
          <div className="section-header">
            <FiSend className="section-icon" />
            <h3>Token O'tkazish</h3>
          </div>

          <div className="transfer-info">
            <div className="balance-info">
              <span>Sizning balansingiz:</span>
              <strong className="current-balance">{currentUser.balance?.toLocaleString() || 0} UZS</strong>
            </div>
            <div className="recipient-info">
              <span>Qabul qiluvchi:</span>
              <strong>@{user.profile?.username}</strong>
            </div>
          </div>

          {!showCustomAmount ? (
            <>
              <div className="preset-amounts-grid">
                {presetAmounts.map(amount => (
                  <button
                    key={amount}
                    className={`preset-amount-btn ${currentUser.balance < amount ? 'disabled' : ''}`}
                    onClick={() => handleSendToken(amount)}
                    disabled={currentUser.balance < amount || isProcessing}
                  >
                    <FiDollarSign className="amount-icon" />
                    {amount.toLocaleString()} UZS
                    {currentUser.balance < amount && (
                      <span className="insufficient-badge">Yetarli emas</span>
                    )}
                  </button>
                ))}
              </div>
              
              <button 
                className="custom-amount-toggle-btn"
                onClick={() => setShowCustomAmount(true)}
                disabled={isProcessing}
              >
                Boshqa summa kiriting
              </button>
            </>
          ) : (
            <div className="custom-amount-section">
              <div className="custom-amount-input-group">
                <input
                  type="number"
                  placeholder="Summani kiriting (UZS)"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="custom-amount-input"
                  min="100"
                  disabled={isProcessing}
                />
                <span className="currency-label">UZS</span>
              </div>
              
              <div className="amount-validation">
                {transferAmount && parseInt(transferAmount) < 100 && (
                  <span className="validation-error">Minimal summa: 100 UZS</span>
                )}
                {transferAmount && currentUser.balance < parseInt(transferAmount) && (
                  <span className="validation-error">Balansingizda yetarli mablag' yo'q</span>
                )}
              </div>
              
              <div className="custom-amount-actions">
                <button 
                  className="cancel-custom-btn"
                  onClick={() => {
                    setShowCustomAmount(false);
                    setTransferAmount("");
                  }}
                  disabled={isProcessing}
                >
                  Bekor qilish
                </button>
                <button 
                  className={`confirm-transfer-btn ${isProcessing ? 'processing' : ''}`}
                  onClick={() => handleSendToken()}
                  disabled={!transferAmount || parseInt(transferAmount) < 100 || currentUser.balance < parseInt(transferAmount) || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="transfer-spinner"></div>
                      O'tkazilmoqda...
                    </>
                  ) : (
                    <>
                      <FiSend className="transfer-icon" />
                      O'tkazish
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="transfer-limits">
            <FiInfo className="limits-icon" />
            <span>Minimal o'tkazish: 100 UZS • Maksimal: {currentUser.balance?.toLocaleString()} UZS</span>
          </div>
        </div>

        {/* O'tkazmalar tarixi */}
        {transferHistory.length > 0 && (
          <div className="transfer-history-section">
            <div className="section-header">
              <FiClock className="section-icon" />
              <h3>Oxirgi O'tkazmalar</h3>
            </div>
            
            <div className="history-list">
              {transferHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-info">
                    <span className="history-action">{item.action}</span>
                    <span className="history-time">{item.time}</span>
                  </div>
                  <span className={`history-amount ${item.type === 'transfer_sent' ? 'sent' : 'received'}`}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harakatlar paneli */}
        <div className="action-buttons-section">
        
          
          <button 
            className="secondary-action-btn"
            onClick={() => navigate(-1)}
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;