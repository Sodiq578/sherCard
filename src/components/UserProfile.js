import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RiArrowLeftLine, 
  RiVipCrownLine, 
  RiCoinsLine, 
  RiHistoryLine,
  RiSendPlaneLine,
  RiChat3Line,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine
} from 'react-icons/ri';
import Logo from "../assets/images/logo.png";
import '../styles/UserProfile.css';

function UserProfile({ user, updateUser }) {
  const { login } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // Token yuborish states
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("");

  // Alert modal states
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertAction, setAlertAction] = useState(null);
  const [alertActionText, setAlertActionText] = useState("");

  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        
        // Agar login parametri bo'lsa, boshqa foydalanuvchi profili
        if (login && login !== user.login) {
          const foundUser = allUsers.find(u => u.login === login);
          if (foundUser) {
            setProfileUser(foundUser);
            setIsOwnProfile(false);
          } else {
            navigate('/main');
          }
        } else {
          // O'z profili
          setProfileUser(user);
          setIsOwnProfile(true);
        }
      } catch (error) {
        console.error('Profil yuklanmadi:', error);
        navigate('/main');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [login, user, navigate]);

  // Karta raqamlari - obyektlarni qayta ishlash
  const userCards = React.useMemo(() => {
    if (!user?.cards) return ["8989 8989 8989"];
    
    // Agar cards massiv bo'lsa va ichida obyektlar bo'lsa
    if (Array.isArray(user.cards)) {
      return user.cards.map(card => {
        if (typeof card === 'string') return card;
        if (card && card.number) return card.number;
        return "8989 8989 8989";
      });
    }
    
    return ["8989 8989 8989"];
  }, [user?.cards]);

  // Boshlang'ich karta raqamini o'rnatish
  useEffect(() => {
    if (userCards.length > 0 && !selectedCard) {
      setSelectedCard(userCards[0]);
    }
  }, [userCards, selectedCard]);

  // Alert funksiyalari
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

  const handleSendTokens = () => {
    if (profileUser && !isOwnProfile) {
      setShowSendTokens(true);
    }
  };

  const handleStartChat = () => {
    if (profileUser && !isOwnProfile) {
      navigate(`/chat/${profileUser.login}`);
    }
  };

  const handleTokenTransfer = () => {
    if (!profileUser) {
      showAlertMessage("Foydalanuvchi topilmadi!", "error", "Xatolik");
      return;
    }

    const amount = parseInt(tokenAmount);
    if (!amount || amount <= 0 || isNaN(amount)) {
      showAlertMessage("To'g'ri miqdor kiriting!", "error", "Xatolik");
      return;
    }

    if (amount > user.balance) {
      showAlertMessage("Balansingizda yetarli token mavjud emas!", "error", "Xatolik");
      return;
    }

    if (amount < 100) {
      showAlertMessage("Minimal yuborish miqdori: 100 token", "error", "Xatolik");
      return;
    }

    const confirmSend = () => {
      try {
        // Joriy foydalanuvchi yangilash
        const updatedCurrentUser = {
          ...user,
          balance: user.balance - amount,
          history: [
            ...(user.history || []),
            {
              time: new Date().toLocaleString("uz-UZ"),
              action: `${profileUser.profile.username} ga token yuborildi`,
              amount: `-${amount.toLocaleString()} token`,
              details: `@${profileUser.profile.username} | Karta: ${selectedCard}`,
              card: selectedCard
            }
          ]
        };

        // Qabul qiluvchi foydalanuvchini topish va yangilash
        const allUsersData = JSON.parse(localStorage.getItem("allUsers") || "[]");
        let receiverUpdated = false;
        
        const updatedAllUsers = allUsersData.map(u => {
          if (u.login === profileUser.login) {
            receiverUpdated = true;
            return {
              ...u,
              balance: (u.balance || 0) + amount,
              history: [
                ...(u.history || []),
                {
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `${user.profile.username} dan token qabul qilindi`,
                  amount: `+${amount.toLocaleString()} token`,
                  details: `@${user.profile.username} | Karta: ${selectedCard}`,
                  card: selectedCard
                }
              ],
              messages: [
                ...(u.messages || []),
                {
                  id: Date.now(),
                  from: user.login,
                  to: u.login,
                  text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                  time: new Date().toLocaleString("uz-UZ"),
                  type: "token",
                  amount: amount,
                  read: false,
                  card: selectedCard
                }
              ]
            };
          }
          return u;
        });

        // Agar qabul qiluvchi allUsers ichida topilmasa, yangi qo'shamiz
        if (!receiverUpdated) {
          const newReceiver = {
            ...profileUser,
            balance: (profileUser.balance || 0) + amount,
            history: [
              ...(profileUser.history || []),
              {
                time: new Date().toLocaleString("uz-UZ"),
                action: `${user.profile.username} dan token qabul qilindi`,
                amount: `+${amount.toLocaleString()} token`,
                details: `@${user.profile.username} | Karta: ${selectedCard}`,
                card: selectedCard
              }
            ],
            messages: [
              ...(profileUser.messages || []),
              {
                id: Date.now(),
                from: user.login,
                to: profileUser.login,
                text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                time: new Date().toLocaleString("uz-UZ"),
                type: "token",
                amount: amount,
                read: false,
                card: selectedCard
              }
            ]
          };
          updatedAllUsers.push(newReceiver);
        }

        // LocalStorage yangilash
        localStorage.setItem("userData", JSON.stringify(updatedCurrentUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

        // State yangilash
        updateUser(updatedCurrentUser);

        showAlertMessage(
          `@${profileUser.profile.username} ga ${amount.toLocaleString()} token muvaffaqiyatli yuborildi!\nKarta: ${selectedCard}`,
          "success",
          "Muvaffaqiyatli"
        );

        setShowSendTokens(false);
        setTokenAmount("");
        setSelectedCard(userCards[0] || "8989 8989 8989");
      } catch (error) {
        console.error("Token yuborishda xatolik:", error);
        showAlertMessage("Token yuborishda xatolik yuz berdi!", "error", "Xatolik");
      }
    };

    showAlertMessage(
      `@${profileUser.profile.username} ga ${amount.toLocaleString()} token yuborishni tasdiqlaysizmi?\n\nKarta: ${selectedCard}\nJoriy balans: ${user.balance.toLocaleString()} token\nYuborilgandan keyin: ${(user.balance - amount).toLocaleString()} token`,
      "info",
      "Token yuborish",
      confirmSend,
      "Tasdiqlash"
    );
  };

  // O'z profilidagi kartalarni ko'rsatish
  const displayCards = React.useMemo(() => {
    if (!profileUser?.cards) return ["8989 8989 8989"];
    
    if (Array.isArray(profileUser.cards)) {
      return profileUser.cards.map(card => {
        if (typeof card === 'string') return card;
        if (card && card.number) return card.number;
        return "8989 8989 8989";
      });
    }
    
    return ["8989 8989 8989"];
  }, [profileUser?.cards]);

  if (loading) {
    return <div className="user-profile-loading">Yuklanmoqda...</div>;
  }

  if (!profileUser) {
    return <div className="user-profile-not-found">Foydalanuvchi topilmadi</div>;
  }

  const userBalance = profileUser.balance || 0;
  const userHistory = profileUser.history || [];

  return (
    <div className="user-profile-container">
      {/* UNIVERSAL ALERT MODAL */}
      {showAlert && (
        <div className="user-alert-modal-overlay">
          <div className={`user-alert-modal user-alert-${alertType}`}>
            <div className="user-alert-header">
              {alertType === "success" && <RiCheckLine className="user-alert-header-icon" />}
              {alertType === "error" && <RiErrorWarningLine className="user-alert-header-icon" />}
              {alertType === "info" && <RiInformationLine className="user-alert-header-icon" />}
              <h3 className="user-alert-title">
                {alertTitle || (alertType === "success" ? "Muvaffaqiyatli" : alertType === "error" ? "Xatolik" : "Ma'lumot")}
              </h3>
            </div>
            <div className="user-alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="user-alert-footer">
              {alertAction && (
                <button className="user-alert-action-btn" onClick={handleAlertAction}>
                  {alertActionText || "Tasdiqlash"}
                </button>
              )}
              <button className="user-alert-close-btn" onClick={closeAlert}>
                {alertAction ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN YUBORISH MODAL */}
      {showSendTokens && (
        <div className="user-modal-overlay">
          <div className="user-modal-content user-send-tokens-modal">
            <div className="user-modal-header">
              <h3>Token yuborish</h3>
              <button className="user-modal-close-btn" onClick={() => setShowSendTokens(false)}>
                <RiCloseLine size={20} />
              </button>
            </div>

            <div className="user-modal-body">
              <div className="user-selected-user">
                <div className="user-selected-user-avatar">
                  <img src={profileUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="" />
                  {profileUser.isPremium && <div className="user-user-premium-indicator"></div>}
                </div>
                <div className="user-selected-user-info">
                  <h4>@{profileUser.profile?.username}</h4>
                  <p>{profileUser.profile?.name || "Foydalanuvchi"}</p>
                </div>
              </div>

              {/* Karta tanlash */}
              <div className="user-card-selection">
                <label>Yuborish kartasini tanlang</label>
                <div className="user-card-options">
                  {userCards.map((card, index) => (
                    <div
                      key={index}
                      className={`user-card-option ${selectedCard === card ? 'selected' : ''}`}
                      onClick={() => setSelectedCard(card)}
                    >
                      <div className="user-card-number">{card}</div>
                      <div className="user-card-holder">{user.profile?.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="user-token-input-section">
                <label>Yuboriladigan token miqdori</label>
                <div className="user-token-input-wrapper">
                  <input
                    type="number"
                    placeholder="100"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="user-token-input"
                    min="100"
                    max={user.balance}
                  />
                  <span className="user-token-symbol">
                    <img src={Logo} alt="token" className="user-token-sm" />
                  </span>
                </div>
                <div className="user-balance-info">
                  Joriy balans: <strong>{user.balance.toLocaleString()} token</strong>
                </div>
                
                {tokenAmount >= 100 && (
                  <div className="user-amount-preview">
                    <div className="user-amount-row">
                      <span>Yuboriladi:</span>
                      <strong>{parseInt(tokenAmount || 0).toLocaleString()} token</strong>
                    </div>
                    <div className="user-amount-row">
                      <span>Qoladi:</span>
                      <strong>{(user.balance - parseInt(tokenAmount || 0)).toLocaleString()} token</strong>
                    </div>
                    <div className="user-amount-row">
                      <span>Karta:</span>
                      <strong>{selectedCard}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="user-modal-footer">
              <button
                className="user-primary-btn"
                onClick={handleTokenTransfer}
                disabled={!tokenAmount || tokenAmount < 100 || tokenAmount > user.balance}
              >
                Yuborish ({tokenAmount || 0} token)
              </button>
              <button 
                className="user-secondary-btn" 
                onClick={() => setShowSendTokens(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="user-profile-header">
        <button className="user-profile-back-btn" onClick={() => navigate(-1)}>
          <RiArrowLeftLine size={24} />
        </button>
        <h2>{isOwnProfile ? 'Mening Profilim' : 'Foydalanuvchi Profili'}</h2>
      </div>

      {/* Profile Info */}
      <div className="user-profile-card">
        <div className="user-profile-avatar">
          <img 
            src={profileUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
            alt="avatar" 
          />
          {profileUser.isPremium && (
            <div className="user-profile-premium-badge">
              <RiVipCrownLine size={20} />
            </div>
          )}
        </div>
        
        <div className="user-profile-info">
          <h3 className="user-profile-name">
            {profileUser.profile?.name || "Foydalanuvchi"}
            {profileUser.isPremium && <span className="user-profile-premium-tag">Premium</span>}
          </h3>
          <p className="user-profile-username">@{profileUser.profile?.username}</p>
          
          {isOwnProfile && (
            <div className="user-profile-balance">
              <RiCoinsLine className="user-balance-icon" />
              <span>{userBalance.toLocaleString()} token</span>
            </div>
          )}
        </div>

        {/* Action Buttons - faqat boshqa foydalanuvchi profili uchun */}
        {!isOwnProfile && (
          <div className="user-profile-actions">
            <button className="user-profile-action-btn primary" onClick={handleSendTokens}>
              <RiSendPlaneLine size={18} />
              Token Yuborish
            </button>
           
          </div>
        )}
      </div>

      {/* Karta ma'lumotlari - faqat o'z profili uchun */}
      {isOwnProfile && (
        <div className="user-profile-card-info">
          <div className="user-card-section">
            <h4>Karta ma'lumotlari</h4>
            {displayCards.map((card, index) => (
              <div key={index} className="user-card-item">
                <div className="user-card-number">{card}</div>
                <div className="user-card-holder">{profileUser.profile?.name || "Foydalanuvchi"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History - faqat o'z profili uchun */}
      {isOwnProfile && (
        <div className="user-profile-history">
          <div className="user-profile-history-header">
            <RiHistoryLine size={20} />
            <h3>Oxirgi harakatlar</h3>
          </div>
          
          {userHistory.length > 0 ? (
            <div className="user-history-list">
              {userHistory.slice(-10).reverse().map((item, index) => {
                const amountText = String(item.amount || '');
                const isPositive = amountText.includes('+');
                
                return (
                  <div key={index} className="user-history-item">
                    <div className="user-history-main">
                      <span className="user-history-action">{item.action || 'Noma\'lum harakat'}</span>
                      <span className={`user-history-amount ${isPositive ? 'positive' : 'negative'}`}>
                        {amountText}
                      </span>
                    </div>
                    <div className="user-history-details">
                      <span className="user-history-time">{item.time || 'Noma\'lum vaqt'}</span>
                      {item.details && (
                        <span className="user-history-detail">{item.details}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="user-no-history">
              Hech qanday harakatlar topilmadi
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserProfile;