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

  useEffect(() => {
    setUsers(allUsers);
    loadMarketCards();
  }, [allUsers]);

  const loadMarketCards = () => {
    const stored = localStorage.getItem('marketCards');
    if (stored) setMarketCards(JSON.parse(stored));
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
      alert(`Token nusxalandi! @${userLogin} sifatida kirish uchun Ctrl+Alt+E bosing`);
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
    if (!selectedUser || (!avatarFile && !editData.balance)) return;

    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = {
          ...selectedUser,
          balance: parseInt(editData.balance),
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
        alert('Foydalanuvchi yangilandi!');
      };
      reader.readAsDataURL(avatarFile);
    } else {
      const updated = {
        ...selectedUser,
        balance: parseInt(editData.balance),
        profile: { 
          ...selectedUser.profile, 
          name: editData.name, 
          phone: editData.phone, 
          email: editData.email 
        }
      };
      updateUser(updated);
      setSelectedUser(null);
      alert('Foydalanuvchi yangilandi!');
    }
  };

  const deleteMarketCard = (id) => {
    if (window.confirm('Bu kartani rostdan ham o\'chirmoqchimisiz?')) {
      const filtered = marketCards.filter(c => c.id !== id);
      setMarketCards(filtered);
      localStorage.setItem('marketCards', JSON.stringify(filtered));
    }
  };

  const clearHistory = (user) => {
    if (window.confirm(`@${user.login} foydalanuvchisining tarixini tozalashni tasdiqlaysizmi?`)) {
      const updated = { ...user, history: [] };
      updateUser(updated);
      alert('Tarix tozalandi!');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('login');
    setCurrentPage(1);
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <button onClick={onLogout} className="logout-btn">Chiqish</button>
        </div>

        {/* FOYDALANUVCHILAR */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="sort-box">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="login">Login bo'yicha</option>
                  <option value="balance">Balans bo'yicha</option>
                  <option value="cards">Kartalar soni bo'yicha</option>
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
                Oldingi
              </button>
              
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="page-btn"
              >
                Keyingi
              </button>
            </div>
          )}
          
          <div className="users-grid">
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <div key={user.login} className="admin-user-card">
                  <div className="user-avatar">
                    {user.profile?.avatar ? 
                      <img src={user.profile.avatar} alt={`${user.login} avatari`} /> : 
                      <div className="no-avatar">{user.login[0].toUpperCase()}</div>
                    }
                  </div>
                  <div className="user-info">
                    <strong>@{user.login}</strong>
                    <p>{user.balance.toLocaleString()} ball</p>
                    <p>{user.cards?.length || 0} ta karta</p>
                    <p>{user.history?.length || 0} ta tarix</p>
                    <div className="token-row">
                      <code>{user.token}</code>
                      <button onClick={() => copyTokenAndEnter(user.token, user.login)} className="copy-btn">Copy</button>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button onClick={() => handleEditUser(user)} className="action-btn edit">Tahrirlash</button>
                    <button onClick={() => clearHistory(user)} className="action-btn secondary">Tarix tozalash</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-users">
                <p>Foydalanuvchilar topilmadi</p>
              </div>
            )}
          </div>
        </div>

        {/* TAHRIRLASH MODALI */}
        {selectedUser && (
          <div className="edit-modal">
            <div className="modal-content">
              <h3>@{selectedUser.login} ni tahrirlash</h3>
              <input 
                type="number" 
                placeholder="Balans" 
                value={editData.balance} 
                onChange={e => setEditData({...editData, balance: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Ism" 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})} 
              />
              <input 
                type="tel" 
                placeholder="Telefon" 
                value={editData.phone} 
                onChange={e => setEditData({...editData, phone: e.target.value})} 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={editData.email} 
                onChange={e => setEditData({...editData, email: e.target.value})} 
              />
              <div className="file-input-container">
                <label>Avatar o'zgartirish:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setAvatarFile(e.target.files[0])} 
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleSaveUser} className="save-btn">Saqlash</button>
                <button onClick={() => { setSelectedUser(null); setAvatarFile(null); }} className="cancel-btn">Bekor</button>
              </div>
            </div>
          </div>
        )}

        {/* MARKET KARTALARI */}
        <div className="admin-section">
          <h2>Sotuvdagi Kartalar ({marketCards.length})</h2>
          {marketCards.length > 0 ? (
            marketCards.map(c => (
              <div key={c.id} className="market-card-admin">
                <span>ID: {c.id} - {c.balance} ball → {c.price} ball</span>
                <button onClick={() => deleteMarketCard(c.id)} className="action-btn danger">O‘chirish</button>
              </div>
            ))
          ) : (
            <div className="no-cards">
              <p>Sotuvda kartalar mavjud emas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;