import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  FiHome,
  FiCreditCard,
  FiClock,
  FiUser,
  FiPlusCircle,
  FiShoppingBag,
  FiMessageCircle,
  FiSearch,
} from "react-icons/fi";
import Logo from "../assets/images/logo.png";
import { getShops } from "../data/shops";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // === Barcha foydalanuvchilarni yuklash ===
  useEffect(() => {
    const loadUsers = () => {
      try {
        const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
        setAllUsers(users);
      } catch (err) {
        console.error("allUsers yuklanmadi:", err);
        setAllUsers([]);
      }
    };

    loadUsers();

    // Har 2 soniyada yangilash (real-time ta'sir)
    const interval = setInterval(loadUsers, 2000);
    return () => clearInterval(interval);
  }, [user]); // user o'zgarsa, qayta yuklaydi

  // === Qidiruv filtrlash ===
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allUsers.filter((u) => {
      if (!u || !u.profile) return false;
      const username = u.profile.username || "";
      const name = u.profile.name || "";
      return (
        username.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query)
      );
    });

    setFilteredUsers(filtered);
  }, [searchQuery, allUsers]);

  // === O‘qilmagan xabarlar soni ===
  useEffect(() => {
    if (!user || !user.messages) {
      setUnreadCount(0);
      return;
    }
    const unread = user.messages.filter((m) => m.to === user.login && !m.read).length;
    setUnreadCount(unread);
  }, [user]);

  // === Balans to‘ldirish ===
  const handleTopUp = (amount) => {
    if (!user || amount <= 0) return;

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + amount,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: "Balans to‘ldirildi",
          amount: `+${amount.toLocaleString()} UZS`,
        },
      ],
    };

    // localStorage va state yangilash
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);

    alert(`${amount.toLocaleString()} UZS muvaffaqiyatli qo‘shildi!`);
  };

  // === Foydalanuvchi chatga o‘tish ===
  const goToChat = (login) => {
    if (!login) {
      alert("Foydalanuvchi topilmadi!");
      return;
    }
    setSearchQuery(""); // qidiruvni tozalash
    navigate(`/chat/${login}`);
  };

  // === Ma'lumotlar ===
  const displayName = user?.profile?.name || user?.profile?.username || "Foydalanuvchi";
  const shops = getShops();

  return (
    <div className="menu-container">
      {/* === SALOMLASHUV === */}
      <div className="welcome-section">
        <div className="avatar-circle">
          {user?.profile?.avatar ? (
            <img src={user.profile.avatar} alt="Avatar" className="avatar-img" />
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Default Avatar"
              className="avatar-placeholder-img"
            />
          )}
        </div>
        <div className="welcome-texts">
          <span className="welcome">Salom,</span>
          <span className="username">{displayName}</span>
        </div>
      </div>

      {/* === QIDIRUV === */}
      <div className="search-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Username yoki ism bo‘yicha qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Qidiruv natijalari */}
        {filteredUsers.length > 0 && (
          <div className="search-results">
            {filteredUsers.map((u) => (
              <div
                key={u.login}
                className="search-user-item"
                onClick={() => goToChat(u.login)}
              >
                <div className="search-user-avatar">
                  <img
                    src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt={u.profile?.username}
                  />
                </div>
                <div className="search-user-info">
                  <p className="search-username">
                    @{u.profile?.username || "noma'lum"}
                  </p>
                  <p className="search-name">{u.profile?.name || "Foydalanuvchi"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === BALANS KARTASI === */}
      <div className="balance-card">
        <div className="balance-top">
          <div className="balance-icon">
            <FiCreditCard size={32} />
          </div>
          <div className="balance-amount">
            {(user?.balance || 0).toLocaleString()}
                      <img src={Logo} alt="Logo" className="topup-logo" />

          </div>
        </div>
        <div className="balance-label">Joriy balans</div>
      </div>

      {/* === BALANS TO‘LDIRISH === */}
      <div className="topup-section">
        <h3>
          <FiPlusCircle /> Balansni to‘ldirish
        </h3>
        <div className="topup-options">
          {[500, 1000, 5000, 10000].map((amount) => (
            <button
              key={amount}
              className="topup-btn"
              onClick={() => handleTopUp(amount)}
            >
              +{amount.toLocaleString()}{" "}
              <img src={Logo} alt="Logo" className="topup-logo" />
            </button>
          ))}
        </div>
      </div>

      

      {/* === CHAT KIRISH === */}
      <div className="chat-entry" onClick={() => navigate("/chat")}>
        <FiMessageCircle size={20} />
        <span>Chat</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </div>

      {/* === PASTKI NAVIGATSIYA === */}
      <div className="bottom-nav">
        <button className="nav-item active">
          <FiHome size={20} /> <span>Bosh sahifa</span>
        </button>
        <button className="nav-item" onClick={() => navigate("/marketplace")}>
          <FiCreditCard size={20} /> <span>To‘lovlar</span>
        </button>
        <button className="nav-item" onClick={() => navigate("/history")}>
          <FiClock size={20} /> <span>Tarix</span>
        </button>
        <button className="nav-item" onClick={() => navigate("/profile")}>
          <FiUser size={20} /> <span>Profil</span>
        </button>
      </div>
    </div>
  );
}

export default MainMenu;