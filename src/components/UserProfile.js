// UserProfile.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  RiInformationLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiBankCardLine,
  RiLogoutBoxRLine   // Chiqish ikonkasi
} from 'react-icons/ri';
import Logo from "../assets/images/logo.png";
import '../styles/UserProfile.css';

function UserProfile({ user, updateUser }) {
  const { login } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // Token yuborish
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("");

  // Alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertAction, setAlertAction] = useState(null);
  const [alertActionText, setAlertActionText] = useState("");

  useEffect(() => {
    const loadUser = () => {
      try {
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        if (login && login !== user.login) {
          const found = allUsers.find(u => u.login === login);
          if (found) {
            setProfileUser(found);
            setIsOwnProfile(false);
          } else {
            navigate('/main');
          }
        } else {
          setProfileUser(user);
          setIsOwnProfile(true);
        }
      } catch (err) {
        console.error(err);
        navigate('/main');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [login, user, navigate]);

  const userCards = useMemo(() => {
    if (!user?.cards) return ["8989 8989 8989"];
    return user.cards.map(c => typeof c === 'string' ? c : (c?.number || "8989 8989 8989"));
  }, [user?.cards]);

  useEffect(() => {
    if (userCards.length > 0 && !selectedCard) {
      setSelectedCard(userCards[0]);
    }
  }, [userCards]);

  const showAlertMessage = (msg, type = "success", title = "", action = null, actionText = "") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertTitle(title);
    setAlertAction(() => action);
    setAlertActionText(actionText);
    setShowAlert(true);
  };

  const handleTokenTransfer = () => {
    const amount = parseInt(tokenAmount);
    if (!amount || amount < 100 || amount > user.balance) {
      showAlertMessage("Miqdor noto‘g‘ri yoki yetarli balans yo‘q!", "error", "Xatolik");
      return;
    }

    const confirmSend = () => {
      const updatedCurrent = {
        ...user,
        balance: user.balance - amount,
        history: [...(user.history || []), {
          time: new Date().toLocaleString("uz-UZ"),
          action: `@${profileUser.profile.username} ga token yuborildi`,
          amount: `-${amount.toLocaleString()}`,
          details: `Karta: ${selectedCard}`
        }]
      };

      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const updatedAll = allUsers.map(u => 
        u.login === profileUser.login 
          ? { 
              ...u, 
              balance: (u.balance || 0) + amount,
              history: [...(u.history || []), {
                time: new Date().toLocaleString("uz-UZ"),
                action: `@${user.profile.username} dan token keldi`,
                amount: `+${amount.toLocaleString()}`,
                details: `Karta: ${selectedCard}`
              }],
              messages: [...(u.messages || []), {
                id: Date.now(),
                from: user.login,
                to: u.login,
                text: `Sizga ${amount.toLocaleString()} token yuborildi!`,
                time: new Date().toLocaleString("uz-UZ"),
                type: "token",
                amount,
                read: false,
                card: selectedCard
              }]
            }
          : u
      );

      localStorage.setItem("userData", JSON.stringify(updatedCurrent));
      localStorage.setItem("allUsers", JSON.stringify(updatedAll));
      updateUser(updatedCurrent);

      showAlertMessage(
        `@${profileUser.profile.username} ga ${amount.toLocaleString()} token yuborildi!`,
        "success",
        "Muvaffaqiyatli"
      );
      setShowSendTokens(false);
      setTokenAmount("");
    };

    showAlertMessage(
      `@${profileUser.profile.username} ga ${amount.toLocaleString()} token yuborilsinmi?\n\nQoladi: ${(user.balance - amount).toLocaleString()} token`,
      "info",
      "Tasdiqlang",
      confirmSend,
      "Yuborish"
    );
  };

  // CHIqISH FUNKSIYASI – BUTUNLAY TIZIMDAN CHIQIB KETADI
  const handleLogout = () => {
    showAlertMessage(
      "Hisobdan chiqmoqchimisiz?\n\nBarcha ma'lumotlar o‘chib ketadi!",
      "info",
      "Chiqish",
      () => {
        // BARCHA Foydalanuvchi ma'lumotlarini tozalaymiz
        localStorage.removeItem("userData");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("allUsers");
        localStorage.removeItem("currentUserLogin");
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("lastLoginTime");

        // SessionStorage ham tozalansin
        sessionStorage.clear();

        // Barcha cookie larni o'chirish
        document.cookie.split(";").forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // State ni tozalash
        updateUser(null);

        // Login sahifasiga yo'naltirish + sahifani yangilash
        navigate("/login", { replace: true });
        window.location.reload();
      },
      "Ha, chiqish"
    );
  };

  if (loading) return <div className="loading">Yuklanmoqda...</div>;
  if (!profileUser) return <div className="loading">Foydalanuvchi topilmadi</div>;

  const history = (profileUser.history || []).slice(-10).reverse();

  return (
    <>
      {/* ALERT */}
      {showAlert && (
        <div className="alert-overlay">
          <div className={`alert-modal alert-${alertType}`}>
            <div className="alert-header">
              {alertType === "success" && <RiCheckLine size={28} color="#4caf50" />}
              {alertType === "error" && <RiErrorWarningLine size={28} color="#f44336" />}
              {alertType === "info" && <RiInformationLine size={28} color="#0C73FE" />}
              <h3>{alertTitle || (alertType === "success" ? "Muvaffaqiyatli" : "Xatolik")}</h3>
            </div>
            <div className="alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="alert-footer">
              {alertAction && (
                <button onClick={() => { alertAction(); setShowAlert(false); }} className="alert-btn primary">
                  {alertActionText}
                </button>
              )}
              <button onClick={() => setShowAlert(false)} className="alert-btn secondary">
                {alertAction ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN YUBORISH MODAL */}
      {showSendTokens && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Token yuborish</h3>
              <button onClick={() => setShowSendTokens(false)}><RiCloseLine size={22} /></button>
            </div>
            <div className="modal-body">
              <div className="recipient">
                <img src={profileUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
                <div>
                  <h4>@{profileUser.profile?.username}</h4>
                  <p>{profileUser.profile?.name}</p>
                </div>
              </div>

              <div className="card-select">
                <label>Karta tanlang</label>
                {userCards.map(card => (
                  <div key={card} className={`card-opt ${selectedCard === card ? 'sel' : ''}`} onClick={() => setSelectedCard(card)}>
                    {card}
                  </div>
                ))}
              </div>

              <div className="amount-input">
                <label>Miqdor</label>
                <div className="input-wrap">
                  <input type="number" value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} placeholder="100" />
                  <img src={Logo} alt="token" className="token-icon" />
                </div>
                <p>Joriy balans: <strong>{user.balance.toLocaleString()} token</strong></p>
              </div>

              {tokenAmount >= 100 && (
                <div className="preview">
                  <div><span>Yuboriladi:</span> <strong>{parseInt(tokenAmount || 0).toLocaleString()} token</strong></div>
                  <div><span>Qoladi:</span> <strong>{(user.balance - parseInt(tokenAmount || 0)).toLocaleString()} token</strong></div>
                  <div><span>Karta:</span> <strong>{selectedCard}</strong></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleTokenTransfer} disabled={!tokenAmount || tokenAmount < 100 || tokenAmount > user.balance}>
                Yuborish
              </button>
              <button className="btn-secondary" onClick={() => setShowSendTokens(false)}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

      <div className="user-profile-page">
        <div className="header">
          <button onClick={() => navigate(-1)} className="back-btn"><RiArrowLeftLine size={24} /></button>
          <h1>{isOwnProfile ? "Mening profilim" : "Foydalanuvchi"}</h1>
        </div>

        <div className="main-card">
          <div className="avatar-section">
            <div className="avatar">
              <img src={profileUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
              {profileUser.isPremium && <div className="premium-badge"><RiVipCrownLine size={18} /></div>}
            </div>
            <h2>{profileUser.profile?.name || "Foydalanuvchi"}</h2>
            <p className="username">@{profileUser.profile?.username}</p>
            <div className="balance">
              <RiCoinsLine size={20} />
              <span>{(profileUser.balance || 0).toLocaleString()} token</span>
              <img src={Logo} alt="logo" className="logo-sm" />
            </div>
          </div>

          {/* O'z profilida */}
          {isOwnProfile && (
            <>
              <div className="info-grid">
                <div className="info-item"><RiUserLine /> {profileUser.profile?.name || "-"}</div>
                <div className="info-item"><RiPhoneLine /> {profileUser.profile?.phone || "Yo‘q"}</div>
                <div className="info-item"><RiMailLine /> {profileUser.profile?.email || "Yo‘q"}</div>
              </div>

              <div className="cards-section">
                <h3><RiBankCardLine /> Kartalar</h3>
                {userCards.map(card => (
                  <div key={card} className="card-item">{card}</div>
                ))}
              </div>

              {/* CHIqISH TUGMASI */}
              <div className="logout-section">
                <button onClick={handleLogout} className="btn-logout">
                  <RiLogoutBoxRLine size={24} />
                  <span>Chiqish</span>
                </button>
                <p style={{textAlign: 'center', marginTop: '12px', color: '#e74c3c', fontSize: '14px', opacity: 0.8}}>
                  Barcha ma'lumotlar o‘chib ketadi
                </p>
              </div>
            </>
          )}

          {/* Boshqa foydalanuvchida */}
          {!isOwnProfile && (
            <div className="action-buttons">
              <button onClick={() => setShowSendTokens(true)} className="btn-send">
                <RiSendPlaneLine /> Token yuborish
              </button>
              <button onClick={() => navigate(`/chat/${profileUser.login}`)} className="btn-chat">
                <RiChat3Line /> Xabar yozish
              </button>
            </div>
          )}
        </div>

        {/* Tarix faqat o‘z profilida */}
        {isOwnProfile && history.length > 0 && (
          <div className="history-section">
            <h3><RiHistoryLine /> So‘nggi tranzaksiyalar</h3>
            <div className="history-list">
              {history.map((h, i) => {
                const positive = String(h.amount || "").includes("+");
                return (
                  <div key={i} className="history-item">
                    <div>
                      <p className="action">{h.action || "Tranzaksiya"}</p>
                      <p className="time">{h.time}</p>
                    </div>
                    <p className={`amount ${positive ? "pos" : "neg"}`}>
                      {positive ? "+" : "-"}{Math.abs(parseInt(h.amount || 0)).toLocaleString()} token
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UserProfile;