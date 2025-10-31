// components/AdminPanel.js
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/AdminPanel.css';

function AdminPanel({ onLogout, allUsers, updateUser }) {
  const [users, setUsers] = useState([]);
  const [marketCards, setMarketCards] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ balance: 0, name: '', phone: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('login');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('users'); // users yoki market
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    setUsers(allUsers);
    loadMarketCards();
  }, [allUsers]);

  const loadMarketCards = () => {
    const stored = localStorage.getItem('marketCards');
    if (stored) setMarketCards(JSON.parse(stored));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Filtrlangan va saralangan foydalanuvchilar
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    
    // Filtrlash
    if (searchTerm) {
      result = result.filter(user => 
        user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.name && user.profile.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.profile?.email && user.profile.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Saralash
    result.sort((a, b) => {
      switch(sortBy) {
        case 'login':
          return a.login.localeCompare(b.login);
        case 'balance':
          return b.balance - a.balance;
        case 'cards':
          return (b.cards?.length || 0) - (a.cards?.length || 0);
        case 'history':
          return (b.history?.length || 0) - (a.history?.length || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [users, searchTerm, sortBy]);

  // Sahifalash
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  const copyTokenAndEnter = (token, userLogin) => {
    navigator.clipboard.writeText(token).then(() => {
      showNotification(`Token nusxalandi! @${userLogin} sifatida kirish uchun Ctrl+Alt+E bosing`);
    });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      balance: user.balance,
      name: user.profile?.name || '',
      phone: user.profile?.phone || '',
      email: user.profile?.email || ''
    });
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = {
          ...selectedUser,
          balance: parseInt(editData.balance) || 0,
          profile: { 
            ...selectedUser.profile, 
            name: editData.name, 
            phone: editData.phone, 
            email: editData.email, 
            avatar: reader.result 
          }
        };
        updateUser(updated);
        setAvatarFile(null);
        setSelectedUser(null);
        showNotification('Foydalanuvchi muvaffaqiyatli yangilandi!');
      };
      reader.readAsDataURL(avatarFile);
    } else {
      const updated = {
        ...selectedUser,
        balance: parseInt(editData.balance) || 0,
        profile: { 
          ...selectedUser.profile, 
          name: editData.name, 
          phone: editData.phone, 
          email: editData.email 
        }
      };
      updateUser(updated);
      setSelectedUser(null);
      showNotification('Foydalanuvchi muvaffaqiyatli yangilandi!');
    }
  };

  const deleteMarketCard = (id) => {
    if (window.confirm('Bu kartani rostdan ham o\'chirmoqchimisiz?')) {
      const filtered = marketCards.filter(c => c.id !== id);
      setMarketCards(filtered);
      localStorage.setItem('marketCards', JSON.stringify(filtered));
      showNotification('Karta muvaffaqiyatli o\'chirildi!', 'warning');
    }
  };

  const clearHistory = (user) => {
    if (window.confirm(`@${user.login} foydalanuvchisining tarixini tozalashni tasdiqlaysizmi?`)) {
      const updated = { ...user, history: [] };
      updateUser(updated);
      showNotification('Tarix muvaffaqiyatli tozalandi!', 'info');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('login');
    setCurrentPage(1);
  };

  const addBalanceToUser = (user, amount) => {
    const updated = { ...user, balance: user.balance + amount };
    updateUser(updated);
    showNotification(`@${user.login} ga ${amount} ball qo'shildi!`);
  };

  const removeBalanceFromUser = (user, amount) => {
    if (user.balance < amount) {
      showNotification('Foydalanuvchida yetarli ball mavjud emas!', 'error');
      return;
    }
    const updated = { ...user, balance: user.balance - amount };
    updateUser(updated);
    showNotification(`@${user.login} dan ${amount} ball olindi!`, 'warning');
  };

  const exportUsersData = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-data.json';
    link.click();
    showNotification('Foydalanuvchilar ma\'lumotlari yuklab olindi!');
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">
        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="admin-header">
          <div className="header-content">
            <h1>Admin Panel</h1>
            <div className="header-stats">
              <span>Jami foydalanuvchilar: {users.length}</span>
              <span>Sotuvdagi kartalar: {marketCards.length}</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={exportUsersData} className="export-btn">Ma'lumotlarni yuklab olish</button>
            <button onClick={onLogout} className="logout-btn">Chiqish</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Foydalanuvchilar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            Sotuvdagi Kartalar
          </button>
        </div>

        {/* FOYDALANUVCHILAR */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Foydalanuvchilar ({filteredAndSortedUsers.length})</h2>
              
              {/* Filtr va saralash */}
              <div className="filters-container">
                <div className="search-box">
                  <input 
                    type="text" 
                    placeholder="Foydalanuvchi qidirish..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                <div className="sort-box">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="login">Login bo'yicha</option>
                    <option value="balance">Balans bo'yicha</option>
                    <option value="cards">Kartalar soni bo'yicha</option>
                    <option value="history">Tarixlar soni bo'yicha</option>
                  </select>
                </div>
                
                <button onClick={resetFilters} className="reset-btn">Filtrlarni tozalash</button>
              </div>
            </div>
            
            {/* Sahifalash */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="page-btn"
                >
                  ◀ Oldingi
                </button>
                
                <span className="page-info">
                  Sahifa {currentPage} / {totalPages}
                </span>
                
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="page-btn"
                >
                  Keyingi ▶
                </button>
              </div>
            )}
            
            <div className="users-grid">
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <div key={user.login} className="admin-user-card">
                    <div className="user-header">
                      <div className="user-avatar">
                        {user.profile?.avatar ? 
                          <img src={user.profile.avatar} alt={`${user.login} avatari`} /> : 
                          <div className="no-avatar">{user.login[0].toUpperCase()}</div>
                        }
                      </div>
                      <div className="user-basic-info">
                        <strong className="username">@{user.login}</strong>
                        {user.profile?.name && <span className="user-name">{user.profile.name}</span>}
                      </div>
                    </div>
                    
                    <div className="user-stats">
                      <div className="stat-item">
                        <span className="stat-label">Balans:</span>
                        <span className="stat-value balance">{user.balance.toLocaleString()} ball</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Kartalar:</span>
                        <span className="stat-value">{user.cards?.length || 0} ta</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Tarix:</span>
                        <span className="stat-value">{user.history?.length || 0} ta</span>
                      </div>
                    </div>
                    
                    <div className="token-section">
                      <div className="token-row">
                        <code className="token-code">{user.token}</code>
                        <button 
                          onClick={() => copyTokenAndEnter(user.token, user.login)} 
                          className="copy-btn"
                          title="Tokenni nusxalash"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    
                    <div className="balance-actions">
                      <button 
                        onClick={() => addBalanceToUser(user, 1000)} 
                        className="balance-btn add"
                      >
                        +1000
                      </button>
                      <button 
                        onClick={() => removeBalanceFromUser(user, 1000)} 
                        className="balance-btn remove"
                      >
                        -1000
                      </button>
                    </div>
                    
                    <div className="user-actions">
                      <button onClick={() => handleEditUser(user)} className="action-btn edit">
                        ✏️ Tahrirlash
                      </button>
                      <button onClick={() => clearHistory(user)} className="action-btn secondary">
                        🗑️ Tarix tozalash
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">👥</div>
                  <p>Foydalanuvchilar topilmadi</p>
                  <button onClick={resetFilters} className="reset-btn">Filtrlarni tozalash</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MARKET KARTALARI */}
        {activeTab === 'market' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Sotuvdagi Kartalar ({marketCards.length})</h2>
            </div>
            
            {marketCards.length > 0 ? (
              <div className="market-cards-grid">
                {marketCards.map(card => (
                  <div key={card.id} className="market-card-admin">
                    <div className="card-info">
                      <div className="card-id">ID: {card.id}</div>
                      <div className="card-balance">{card.balance} ball</div>
                      <div className="card-price">{card.price} ball</div>
                      <div className="card-profit">
                        Foyda: {card.price - card.balance} ball
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteMarketCard(card.id)} 
                      className="action-btn danger"
                    >
                      ❌ O'chirish
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">💳</div>
                <p>Sotuvda kartalar mavjud emas</p>
              </div>
            )}
          </div>
        )}

        {/* TAHRIRLASH MODALI */}
        {selectedUser && (
          <div className="edit-modal">
            <div className="modal-overlay" onClick={() => { setSelectedUser(null); setAvatarFile(null); }}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>@{selectedUser.login} ni tahrirlash</h3>
                <button 
                  className="close-btn"
                  onClick={() => { setSelectedUser(null); setAvatarFile(null); }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label>Balans</label>
                  <input 
                    type="number" 
                    placeholder="Balans" 
                    value={editData.balance} 
                    onChange={e => setEditData({...editData, balance: e.target.value})} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Ism</label>
                  <input 
                    type="text" 
                    placeholder="Ism" 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Telefon</label>
                  <input 
                    type="tel" 
                    placeholder="Telefon" 
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={editData.email} 
                    onChange={e => setEditData({...editData, email: e.target.value})} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Avatar o'zgartirish</label>
                  <div className="file-input-container">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setAvatarFile(e.target.files[0])} 
                    />
                    {avatarFile && (
                      <span className="file-name">{avatarFile.name}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={handleSaveUser} className="save-btn">✅ Saqlash</button>
                <button onClick={() => { setSelectedUser(null); setAvatarFile(null); }} className="cancel-btn">❌ Bekor qilish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;