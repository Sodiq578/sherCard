// src/components/AdminPanel.js
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/AdminPanel.css';
import { saveShops, getShops } from '../data/shops';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminPanel({ onLogout, allUsers, updateUser }) {
  const [users, setUsers] = useState([]);
  const [marketCards, setMarketCards] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ balance: 0, name: '', phone: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('login');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('users');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', logo: '' });
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '' });
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);

  useEffect(() => {
    setUsers(allUsers || []);
    loadMarketCards();
    loadShops();
  }, [allUsers]);

  const loadMarketCards = () => {
    const stored = localStorage.getItem('marketCards');
    if (stored) {
      try { setMarketCards(JSON.parse(stored)); }
      catch (e) { console.error("marketCards o'qishda xato:", e); }
    }
  };

  const loadShops = () => {
    const data = getShops();
    if (Array.isArray(data)) {
      const fixed = data.map(shop => ({
        ...shop,
        menu: Array.isArray(shop.menu) ? shop.menu : []
      }));
      setShops(fixed);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // === FOYDALANUVCHILAR ===
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    if (searchTerm) {
      result = result.filter(user =>
        user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.name && user.profile.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.profile?.email && user.profile.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'login': return a.login.localeCompare(b.login);
        case 'balance': return (b.balance || 0) - (a.balance || 0);
        case 'cards': return (b.cards?.length || 0) - (a.cards?.length || 0);
        case 'history': return (b.history?.length || 0) - (a.history?.length || 0);
        default: return 0;
      }
    });
    return result;
  }, [users, searchTerm, sortBy]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  const copyTokenAndEnter = (token, userLogin) => {
    navigator.clipboard.writeText(token).then(() => {
      showNotification(`Token nusxalandi! @${userLogin} sifatida kirish uchun Ctrl+Alt+E`);
    });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      balance: user.balance || 0,
      name: user.profile?.name || '',
      phone: user.profile?.phone || '',
      email: user.profile?.email || ''
    });
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    const saveWithAvatar = (avatarUrl) => {
      const updated = {
        ...selectedUser,
        balance: parseInt(editData.balance) || 0,
        profile: {
          ...selectedUser.profile,
          name: editData.name,
          phone: editData.phone,
          email: editData.email,
          avatar: avatarUrl
        }
      };
      updateUser(updated);
      setSelectedUser(null);
      setAvatarFile(null);
      showNotification('Foydalanuvchi yangilandi!');
    };
    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = () => saveWithAvatar(reader.result);
      reader.readAsDataURL(avatarFile);
    } else {
      saveWithAvatar(selectedUser.profile?.avatar || '');
    }
  };

  const deleteMarketCard = (id) => {
    if (window.confirm('Kartani o\'chirmoqchimisiz?')) {
      const filtered = marketCards.filter(c => c.id !== id);
      setMarketCards(filtered);
      localStorage.setItem('marketCards', JSON.stringify(filtered));
      showNotification('Karta o\'chirildi!', 'warning');
    }
  };

  const clearHistory = (user) => {
    if (window.confirm(`@${user.login} tarixini tozalash?`)) {
      const updated = { ...user, history: [] };
      updateUser(updated);
      showNotification('Tarix tozalandi!', 'info');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('login');
    setCurrentPage(1);
  };

  const addBalanceToUser = (user, amount) => {
    const updated = { ...user, balance: (user.balance || 0) + amount };
    updateUser(updated);
    showNotification(`+${amount} ball qo'shildi!`);
  };

  const removeBalanceFromUser = (user, amount) => {
    if ((user.balance || 0) < amount) {
      showNotification('Yetarli ball yo‘q!', 'error');
      return;
    }
    const updated = { ...user, balance: (user.balance || 0) - amount };
    updateUser(updated);
    showNotification(`-${amount} ball olindi!`, 'warning');
  };

  const exportUsersData = (type) => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (type === 'json') {
      const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
      saveAs(blob, `users-${timestamp}.json`);
    } else if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(users.map(u => ({
        Login: u.login,
        Ism: u.profile?.name || '',
        Email: u.profile?.email || '',
        Telefon: u.profile?.phone || '',
        Balans: u.balance || 0,
        Kartalar: u.cards?.length || 0,
        Tarix: u.history?.length || 0
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `users-${timestamp}.xlsx`);
    } else if (type === 'word') {
      let html = `<table border="1" style="border-collapse:collapse;width:100%;font-family:Arial;">
        <tr style="background:#f2f2f2;">
          <th>Login</th><th>Ism</th><th>Email</th><th>Telefon</th><th>Balans</th><th>Kartalar</th><th>Tarix</th>
        </tr>`;
      users.forEach(u => {
        html += `<tr>
          <td>${u.login}</td>
          <td>${u.profile?.name || ''}</td>
          <td>${u.profile?.email || ''}</td>
          <td>${u.profile?.phone || ''}</td>
          <td>${u.balance || 0}</td>
          <td>${u.cards?.length || 0}</td>
          <td>${u.history?.length || 0}</td>
        </tr>`;
      });
      html += '</table>';
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      saveAs(blob, `users-${timestamp}.doc`);
    }
    showNotification('Ma\'lumotlar yuklandi!');
  };

  // === DO'KON & MENU ===
  const addShop = () => {
    if (!newShop.name.trim() || !newShop.logo.trim()) {
      showNotification('Nom va logo kiritilishi shart!', 'error');
      return;
    }
    const shop = { id: Date.now(), name: newShop.name.trim(), logo: newShop.logo.trim(), menu: [] };
    const updated = [...shops, shop];
    setShops(updated);
    saveShops(updated);
    setNewShop({ name: '', logo: '' });
    setShowAddShop(false);
    showNotification('Do‘kon qo‘shildi!');
  };

  const deleteShop = (id) => {
    if (window.confirm('Do‘kon va menyusi o‘chsinmi?')) {
      const filtered = shops.filter(s => s.id !== id);
      setShops(filtered);
      saveShops(filtered);
      setSelectedShop(null);
      showNotification('Do‘kon o‘chirildi!', 'warning');
    }
  };

  const addMenuItem = () => {
    if (!selectedShop) return;
    if (!newMenuItem.name.trim() || !newMenuItem.price || newMenuItem.price <= 0) {
      showNotification('Nomi va narxi to‘g‘ri bo‘lishi kerak!', 'error');
      return;
    }
    const item = { id: Date.now(), name: newMenuItem.name.trim(), price: parseInt(newMenuItem.price) };
    const updatedShops = shops.map(s =>
      s.id === selectedShop.id ? { ...s, menu: [...(s.menu || []), item] } : s
    );
    setShops(updatedShops);
    saveShops(updatedShops);
    setNewMenuItem({ name: '', price: '' });
    setShowAddMenu(false);
    showNotification('Maxsulot qo‘shildi!');
  };

  const deleteMenuItem = (shopId, itemId) => {
    if (window.confirm('Maxsulot o‘chirilsinmi?')) {
      const updatedShops = shops.map(s =>
        s.id === shopId ? { ...s, menu: (s.menu || []).filter(i => i.id !== itemId) } : s
      );
      setShops(updatedShops);
      saveShops(updatedShops);
      showNotification('Maxsulot o‘chirildi!', 'warning');
    }
  };

  const startEditMenuItem = (shopId, item) => {
    setEditingMenuItem({ shopId, item });
    setNewMenuItem({ name: item.name, price: item.price });
  };

  const saveEditMenuItem = () => {
    if (!editingMenuItem || !newMenuItem.name.trim() || newMenuItem.price <= 0) {
      showNotification('Ma\'lumotlar to‘g‘ri emas!', 'error');
      return;
    }
    const updatedShops = shops.map(s =>
      s.id === editingMenuItem.shopId
        ? {
          ...s,
          menu: (s.menu || []).map(i =>
            i.id === editingMenuItem.item.id
              ? { ...i, name: newMenuItem.name.trim(), price: parseInt(newMenuItem.price) }
              : i
          )
        }
        : s
    );
    setShops(updatedShops);
    saveShops(updatedShops);
    setEditingMenuItem(null);
    setNewMenuItem({ name: '', price: '' });
    showNotification('Maxsulot yangilandi!');
  };

  // === CHART DATA ===
  const chartData = {
    labels: users.slice(0, 10).map(u => u.login),
    datasets: [{
      label: 'Balans (ball)',
      data: users.slice(0, 10).map(u => u.balance || 0),
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Top 10 foydalanuvchi balansi' } },
    scales: { y: { beginAtZero: true } }
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

        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>Admin Panel</h1>
            <div className="header-stats">
              <span>Foydalanuvchilar: {users.length}</span>
              <span>Kartalar: {marketCards.length}</span>
              <span>Do‘konlar: {shops.length}</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => exportUsersData('json')} className="export-btn">JSON</button>
            <button onClick={() => exportUsersData('excel')} className="export-btn">Excel</button>
            <button onClick={() => exportUsersData('word')} className="export-btn">Word</button>
            <button onClick={onLogout} className="logout-btn">Chiqish</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Foydalanuvchilar
          </button>
          <button className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
            Market
          </button>
          <button className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`} onClick={() => setActiveTab('shops')}>
            Do‘konlar
          </button>
          <button className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>
            Statistika
          </button>
        </div>

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Foydalanuvchilar ({filteredAndSortedUsers.length})</h2>
              <div className="filters-container">
                <input type="text" placeholder="Qidirish..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="login">Login</option>
                  <option value="balance">Balans</option>
                  <option value="cards">Kartalar</option>
                  <option value="history">Tarix</option>
                </select>
                <button onClick={resetFilters} className="reset-btn">Tozalash</button>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Oldingi</button>
                <span>{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Keyingi</button>
              </div>
            )}

            <div className="users-grid">
              {currentUsers.length > 0 ? currentUsers.map(user => (
                <div key={user.login} className="admin-user-card" onClick={() => { setSelectedUserHistory(user); setShowHistoryModal(true); }} style={{ cursor: 'pointer' }}>
                  <div className="user-header">
                    <div className="user-avatar">
                      {user.profile?.avatar ? <img src={user.profile.avatar} alt="" /> : <div className="no-avatar">{user.login[0].toUpperCase()}</div>}
                    </div>
                    <div>
                      <strong>@{user.login}</strong>
                      {user.profile?.name && <div>{user.profile.name}</div>}
                    </div>
                  </div>
                  <div className="user-stats">
                    <div>Balans: {(user.balance || 0).toLocaleString()} ball</div>
                    <div>Kartalar: {user.cards?.length || 0}</div>
                    <div>Tarix: {user.history?.length || 0}</div>
                  </div>
                  <div className="token-section">
                    <code>{user.token}</code>
                    <button onClick={(e) => { e.stopPropagation(); copyTokenAndEnter(user.token, user.login); }} className="copy-btn">Copy</button>
                  </div>
                  <div className="balance-actions">
                    <button onClick={(e) => { e.stopPropagation(); addBalanceToUser(user, 1000); }} className="add">+1000</button>
                    <button onClick={(e) => { e.stopPropagation(); removeBalanceFromUser(user, 1000); }} className="remove">-1000</button>
                  </div>
                  <div className="user-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEditUser(user); }} className="edit">Tahrirlash</button>
                    <button onClick={(e) => { e.stopPropagation(); clearHistory(user); }} className="secondary">Tarix tozalash</button>
                  </div>
                </div>
              )) : (
                <div className="no-data">Foydalanuvchilar topilmadi</div>
              )}
            </div>
          </div>
        )}

        {/* MARKET */}
        {activeTab === 'market' && (
          <div className="admin-section">
            <h2>Sotuvdagi Kartalar ({marketCards.length})</h2>
            {marketCards.length > 0 ? (
              <div className="market-cards-grid">
                {marketCards.map(card => (
                  <div key={card.id} className="market-card-admin">
                    <div>
                      <div>ID: {card.id}</div>
                      <div>Balans: {card.balance.toLocaleString()} ball</div>
                      <div>Narx: {card.price.toLocaleString()} ball</div>
                      <div>Foyda: {(card.price - card.balance).toLocaleString()} ball</div>
                    </div>
                    <button onClick={() => deleteMarketCard(card.id)} className="danger">O‘chirish</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">Kartalar yo‘q</div>
            )}
          </div>
        )}

        {/* SHOPS */}
        {activeTab === 'shops' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Do‘konlar ({shops.length})</h2>
              <button onClick={() => setShowAddShop(true)} className="add-btn">Yangi do‘kon</button>
            </div>
            <div className="shops-admin-grid">
              {shops.map(shop => (
                <div key={shop.id} className={`shop-admin-card ${selectedShop?.id === shop.id ? 'selected' : ''}`} onClick={() => setSelectedShop(shop)}>
                  <img src={shop.logo} alt={shop.name} className="shop-logo" />
                  <div>
                    <strong>{shop.name}</strong>
                    <div>{(shop.menu || []).length} ta maxsulot</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteShop(shop.id); }} className="danger">O‘chirish</button>
                </div>
              ))}
            </div>

            {selectedShop && (
              <div className="shop-menu-section">
                <div className="section-header">
                  <h3>{selectedShop.name} — Menyu</h3>
                  <button onClick={() => setShowAddMenu(true)} className="add-btn">Yangi maxsulot</button>
                </div>
                {(selectedShop.menu || []).length > 0 ? (
                  <div className="menu-items-grid">
                    {selectedShop.menu.map(item => (
                      <div key={item.id} className="menu-item-admin">
                        <div>
                          <strong>{item.name}</strong>
                          <div>{item.price.toLocaleString()} token</div>
                        </div>
                        <div className="menu-actions">
                          <button onClick={() => startEditMenuItem(selectedShop.id, item)} className="edit">Tahrirlash</button>
                          <button onClick={() => deleteMenuItem(selectedShop.id, item.id)} className="danger">O‘chirish</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Menyu bo‘sh</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CHART TAB */}
        {activeTab === 'chart' && (
          <div className="admin-section chart-section">
            <h2>Statistika</h2>
            <div className="chart-wrapper">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* MODALS */}
        {showAddShop && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => setShowAddShop(false)}></div>
            <div className="modal-content">
              <h3>Yangi do‘kon</h3>
              <input placeholder="Nomi" value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} />
              <input placeholder="Logo URL" value={newShop.logo} onChange={e => setNewShop({ ...newShop, logo: e.target.value })} />
              <div className="modal-actions">
                <button onClick={addShop} className="save-btn">Qo‘shish</button>
                <button onClick={() => setShowAddShop(false)} className="cancel-btn">Bekor</button>
              </div>
            </div>
          </div>
        )}

        {(showAddMenu || editingMenuItem) && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => { setShowAddMenu(false); setEditingMenuItem(null); setNewMenuItem({ name: '', price: '' }); }}></div>
            <div className="modal-content">
              <h3>{editingMenuItem ? 'Tahrirlash' : 'Yangi maxsulot'}</h3>
              <input placeholder="Nomi" value={newMenuItem.name} onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })} />
              <input type="number" placeholder="Narxi (token)" value={newMenuItem.price} onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })} />
              <div className="modal-actions">
                <button onClick={editingMenuItem ? saveEditMenuItem : addMenuItem} className="save-btn">
                  {editingMenuItem ? 'Saqlash' : 'Qo‘shish'}
                </button>
                <button onClick={() => { setShowAddMenu(false); setEditingMenuItem(null); setNewMenuItem({ name: '', price: '' }); }} className="cancel-btn">
                  Bekor
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => { setSelectedUser(null); setAvatarFile(null); }}></div>
            <div className="modal-content">
              <h3>@{selectedUser.login} tahrirlash</h3>
              <input type="number" placeholder="Balans" value={editData.balance} onChange={e => setEditData({ ...editData, balance: e.target.value })} />
              <input placeholder="Ism" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
              <input placeholder="Telefon" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
              <input placeholder="Email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
              <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} />
              {avatarFile && <div className="file-name">{avatarFile.name}</div>}
              <div className="modal-actions">
                <button onClick={handleSaveUser} className="save-btn">Saqlash</button>
                <button onClick={() => { setSelectedUser(null); setAvatarFile(null); }} className="cancel-btn">Bekor</button>
              </div>
            </div>
          </div>
        )}

        {showHistoryModal && selectedUserHistory && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}></div>
            <div className="modal-content" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3>@{selectedUserHistory.login} — Amallar tarixi</h3>
              {selectedUserHistory.history && selectedUserHistory.history.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
  <thead>
    <tr style={{ backgroundColor: '#333', color: '#fff', textAlign: 'left' }}>
      <th style={{ padding: '12px', border: '1px solid #444' }}>Sana</th>
      <th style={{ padding: '12px', border: '1px solid #444' }}>Amal</th>
      <th style={{ padding: '12px', border: '1px solid #444' }}>Miqdor</th>
      <th style={{ padding: '12px', border: '1px solid #444' }}>Izoh</th>
    </tr>
  </thead>
  <tbody>
    {selectedUserHistory.history.map((item, idx) => (
      <tr
        key={idx}
        style={{
          backgroundColor: idx % 2 === 0 ? '#222' : '#111',
          color: '#fff',
          transition: 'background-color 0.3s',
          cursor: 'default'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#444')}
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#222' : '#111')
        }
      >
        <td style={{ padding: '10px', border: '1px solid #444', fontSize: '14px' }}>
          {new Date(item.date).toLocaleString('uz-UZ')}
        </td>
        <td style={{ padding: '10px', border: '1px solid #444' }}>{item.action}</td>
        <td style={{ padding: '10px', border: '1px solid #444' }}>
          {item.amount ? `${item.amount > 0 ? '+' : ''}${item.amount}` : '-'}
        </td>
        <td style={{ padding: '10px', border: '1px solid #444', fontStyle: 'italic' }}>
          {item.description || '-'}
        </td>
      </tr>
    ))}
  </tbody>
</table>



              ) : (
                <p style={{ textAlign: 'center', color: '#777' }}>Tarix bo‘sh</p>
              )}
              <div className="modal-actions" style={{ marginTop: '15px' }}>
                <button onClick={() => setShowHistoryModal(false)} className="cancel-btn">Yopish</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;