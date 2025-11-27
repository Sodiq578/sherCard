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
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminPanel({ onLogout, allUsers, updateUser }) {
  const [users, setUsers] = useState([]);
  const [marketCards, setMarketCards] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ balance: 0, name: '', phone: '', email: '', password: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('login');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', logo: '' });
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '' });
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);

  // Reklama
  const [pendingAds, setPendingAds] = useState([]);
  const [approvedAds, setApprovedAds] = useState([]);
  const [rejectedAds, setRejectedAds] = useState([]);
  const [adFilter, setAdFilter] = useState('pending');

  // Banner reklama
  const [banners, setBanners] = useState([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerData, setBannerData] = useState({ title: '', desc: '', link: '', image: '', active: true });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Yangi user yaratish
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ login: '', password: '', name: '', balance: 0 });

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  useEffect(() => {
    setUsers(allUsers || []);
    loadMarketCards();
    loadShops();
    loadAds();
    loadBanners();
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

  const loadAds = () => {
    setPendingAds(JSON.parse(localStorage.getItem('pendingMarketAds') || '[]'));
    setApprovedAds(JSON.parse(localStorage.getItem('approvedMarketAds') || '[]'));
    setRejectedAds(JSON.parse(localStorage.getItem('rejectedMarketAds') || '[]'));
  };

  const loadBanners = () => {
    const stored = localStorage.getItem('mainBanners');
    if (stored) {
      try { setBanners(JSON.parse(stored)); }
      catch (e) { console.error("Banner o'qishda xato:", e); }
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm });
  };

  // === BANNER REKLAMA ===
  const saveBanners = (newBanners) => {
    localStorage.setItem('mainBanners', JSON.stringify(newBanners));
    setBanners(newBanners);
  };

  const addOrUpdateBanner = () => {
    if (!bannerData.title || (!bannerImageFile && !bannerData.image)) {
      showNotification('Sarlavha va rasm majburiy!', 'error');
      return;
    }

    const processImage = (dataUrl) => {
      const newBanner = {
        id: bannerData.id || Date.now(),
        title: bannerData.title,
        desc: bannerData.desc,
        link: bannerData.link,
        image: dataUrl,
        active: bannerData.active
      };

      const updated = bannerData.id
        ? banners.map(b => b.id === bannerData.id ? newBanner : b)
        : [...banners, newBanner];

      saveBanners(updated);
      resetBannerModal();
      showNotification(bannerData.id ? 'Banner yangilandi!' : 'Banner qo‘shildi!');
    };

    if (bannerImageFile) {
      const reader = new FileReader();
      reader.onload = () => processImage(reader.result);
      reader.readAsDataURL(bannerImageFile);
    } else {
      processImage(bannerData.image);
    }
  };

  const resetBannerModal = () => {
    setShowBannerModal(false);
    setBannerData({ title: '', desc: '', link: '', image: '', active: true });
    setBannerImageFile(null);
    setBannerPreview('');
  };

  const deleteBanner = (id) => {
    showConfirm('Bu banner o‘chirilsinmi?', () => {
      saveBanners(banners.filter(b => b.id !== id));
      showNotification('Banner o‘chirildi!', 'warning');
    });
  };

  const toggleBannerActive = (id) => {
    saveBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  // === YANGI USER ===
  const createNewUser = () => {
    if (!newUserData.login || !newUserData.password) {
      showNotification('Login va parol majburiy!', 'error');
      return;
    }
    const newUser = {
      login: newUserData.login.trim(),
      password: newUserData.password,
      token: Math.random().toString(36).substr(2, 9),
      balance: parseInt(newUserData.balance) || 0,
      profile: { name: newUserData.name },
      cards: [],
      history: [],
      blocked: false
    };
    updateUser(newUser);
    setShowCreateUser(false);
    setNewUserData({ login: '', password: '', name: '', balance: 0 });
    showNotification('Yangi foydalanuvchi yaratildi!');
  };

  // === USER OPERATSIYALARI ===
  const toggleBlockUser = (user) => {
    updateUser({ ...user, blocked: !user.blocked });
    showNotification(user.blocked ? 'Blok ochildi' : 'Foydalanuvchi bloklandi');
  };

  const clearHistory = (user) => {
    showConfirm(`@${user.login} tarixini tozalash?`, () => {
      updateUser({ ...user, history: [] });
      showNotification('Tarix tozalandi!');
    });
  };

  const addBalanceToUser = (user, amount) => {
    updateUser({ ...user, balance: (user.balance || 0) + amount });
    showNotification(`+${amount.toLocaleString()} ball qo'shildi!`);
  };

  // === REKLAMA ===
  const approveAd = (ad) => {
    showConfirm('Reklamani tasdiqlaysizmi?', () => {
      const newPending = pendingAds.filter(a => a.id !== ad.id);
      setPendingAds(newPending);
      localStorage.setItem('pendingMarketAds', JSON.stringify(newPending));

      const approvedAd = {
        ...ad,
        status: 'approved',
        approvedAt: Date.now(),
        expiresAt: Date.now() + (ad.duration * 24 * 60 * 60 * 1000)
      };
      const newApproved = [...approvedAds, approvedAd];
      setApprovedAds(newApproved);
      localStorage.setItem('approvedMarketAds', JSON.stringify(newApproved));
      showNotification('Reklama tasdiqlandi!');
    });
  };

  const rejectAd = (ad) => {
    showConfirm('Reklamani rad etasizmi? Pul qaytariladi.', () => {
      const newPending = pendingAds.filter(a => a.id !== ad.id);
      setPendingAds(newPending);
      localStorage.setItem('pendingMarketAds', JSON.stringify(newPending));

      const newRejected = [...rejectedAds, { ...ad, status: 'rejected', rejectedAt: Date.now() }];
      setRejectedAds(newRejected);
      localStorage.setItem('rejectedMarketAds', JSON.stringify(newRejected));

      const user = users.find(u => u.login === ad.seller);
      if (user) {
        updateUser({
          ...user,
          balance: (user.balance || 0) + ad.cost,
          history: [...(user.history || []), {
            date: new Date().toLocaleString(),
            action: `Reklama rad etildi (${ad.duration} kun)`,
            amount: +ad.cost,
            description: 'Pul qaytarildi'
          }]
        });
      }
      showNotification('Reklama rad etildi! Pul qaytarildi.');
    });
  };

  // === FOYDALANUVCHILAR FILTRLASH ===
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter(user =>
        user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // === EXPORT ===
  const exportUsersData = (type) => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (type === 'json') {
      const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
      saveAs(blob, `users-${timestamp}.json`);
    } else if (type === 'excel') {
      const data = users.map(u => ({
        Login: u.login,
        Ism: u.profile?.name || '',
        Email: u.profile?.email || '',
        Telefon: u.profile?.phone || '',
        Balans: u.balance || 0,
        Kartalar: u.cards?.length || 0,
        Tarix: u.history?.length || 0,
        Bloklangan: u.blocked ? 'Ha' : 'Yo‘q'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `users-${timestamp}.xlsx`);
    }
    showNotification('Ma\'lumotlar eksport qilindi!');
  };

  // === CHART DATA ===
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const blockedCount = users.filter(u => u.blocked).length;

  const barData = {
    labels: users.slice(0, 10).map(u => u.login),
    datasets: [{
      label: 'Balans',
      data: users.slice(0, 10).map(u => u.balance || 0),
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
    }],
  };

  const pieData = {
    labels: ['Faol', 'Bloklangan'],
    datasets: [{
      data: [users.length - blockedCount, blockedCount],
      backgroundColor: ['#4CAF50', '#F44336'],
    }],
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

        {/* Confirm Modal */}
        {confirmModal.show && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => setConfirmModal({ show: false })}></div>
            <div className="modal-content confirm-modal">
              <h3>Tasdiqlash</h3>
              <p>{confirmModal.message}</p>
              <div className="modal-actions">
                <button onClick={() => { confirmModal.onConfirm(); setConfirmModal({ show: false }); }} className="danger-btn">
                  Ha
                </button>
                <button onClick={() => setConfirmModal({ show: false })} className="cancel-btn">
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>Admin Panel</h1>
            <div className="header-stats">
              <span>Foydalanuvchilar: {users.length}</span>
              <span>Jami balans: {totalBalance.toLocaleString()} ball</span>
              <span>Do'konlar: {shops.length}</span>
              <span>Kutilayotgan reklama: {pendingAds.length}</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => exportUsersData('json')} className="export-btn">JSON</button>
            <button onClick={() => exportUsersData('excel')} className="export-btn">Excel</button>
            <button onClick={() => setShowCreateUser(true)} className="add-btn">+ Yangi user</button>
            <button onClick={onLogout} className="logout-btn">Chiqish</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={activeTab === 'dashboard' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'users' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('users')}>Foydalanuvchilar</button>
          <button className={activeTab === 'market' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('market')}>Market</button>
          <button className={activeTab === 'shops' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('shops')}>Do'konlar</button>
          <button className={activeTab === 'ads' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('ads')}>Reklamalar</button>
          <button className={activeTab === 'banner' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('banner')}>Banner reklama</button>
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="admin-section dashboard">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Top 10 balans</h3>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              <div className="chart-card">
                <h3>Foydalanuvchi holati</h3>
                <Pie data={pieData} options={{ responsive: true }} />
              </div>
            </div>
            <div className="quick-stats">
              <div className="stat-card">
                <h4>Aktiv bannerlar</h4>
                <p>{banners.filter(b => b.active).length}</p>
              </div>
              <div className="stat-card">
                <h4>Bloklangan userlar</h4>
                <p>{blockedCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB (faqat bir marta) */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Foydalanuvchilar</h2>
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Login</th>
                    <th>Ism</th>
                    <th>Balans</th>
                    <th>Kartalar</th>
                    <th>Tarix</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.login}>
                      <td>{user.login}</td>
                      <td>{user.profile?.name || '-'}</td>
                      <td>{(user.balance || 0).toLocaleString()}</td>
                      <td>{user.cards?.length || 0}</td>
                      <td>{user.history?.length || 0}</td>
                      <td>
                        <div className="user-actions-row">
                          <div className="balance-actions">
                            <button onClick={() => addBalanceToUser(user, 1000)}>+1K</button>
                            <button onClick={() => addBalanceToUser(user, 5000)}>+5K</button>
                            <button onClick={() => addBalanceToUser(user, 10000)}>+10K</button>
                          </div>
                          <button onClick={() => toggleBlockUser(user)} className={user.blocked ? 'success-btn' : 'warning-btn'}>
                            {user.blocked ? 'Ochish' : 'Blok'}
                          </button>
                          <button onClick={() => clearHistory(user)} className="secondary">Tozalash</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BANNER TAB */}
        {activeTab === 'banner' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Asosiy banner reklama</h2>
              <button onClick={() => setShowBannerModal(true)} className="add-btn">+ Yangi banner</button>
            </div>
            <div className="banners-grid">
              {banners.length === 0 ? (
                <p>Hozircha banner yo‘q</p>
              ) : (
                banners.map(banner => (
                  <div key={banner.id} className="banner-card">
                    <img src={banner.image} alt={banner.title} />
                    <div className="banner-info">
                      <h4>{banner.title}</h4>
                      <p>{banner.desc || 'Tavsif yo‘q'}</p>
                      {banner.link && <a href={banner.link} target="_blank" rel="noopener noreferrer">Havola</a>}
                      <span className={`status ${banner.active ? 'active' : 'inactive'}`}>
                        {banner.active ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>
                    <div className="banner-actions">
                      <button onClick={() => toggleBannerActive(banner.id)} className={banner.active ? 'warning-btn' : 'success-btn'}>
                        {banner.active ? 'O‘chirish' : 'Yoqish'}
                      </button>
                      <button onClick={() => deleteBanner(banner.id)} className="danger-btn">O‘chirish</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Banner Modal */}
        {showBannerModal && (
          <div className="modal">
            <div className="modal-overlay" onClick={resetBannerModal}></div>
            <div className="modal-content">
              <h3>{bannerData.id ? 'Banner tahrirlash' : 'Yangi banner'}</h3>
              <input placeholder="Sarlavha" value={bannerData.title} onChange={e => setBannerData({ ...bannerData, title: e.target.value })} />
              <textarea placeholder="Tavsif (ixtiyoriy)" value={bannerData.desc} onChange={e => setBannerData({ ...bannerData, desc: e.target.value })} />
              <input placeholder="Havola[](https://...)" value={bannerData.link} onChange={e => setBannerData({ ...bannerData, link: e.target.value })} />
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setBannerImageFile(file);
                    const reader = new FileReader();
                    reader.onload = () => setBannerPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {(bannerPreview || bannerData.image) && (
                <img src={bannerPreview || bannerData.image} alt="Preview" className="banner-preview" />
              )}
              <label>
                <input
                  type="checkbox"
                  checked={bannerData.active}
                  onChange={e => setBannerData({ ...bannerData, active: e.target.checked })}
                />
                Faol
              </label>
              <div className="modal-actions">
                <button onClick={addOrUpdateBanner} className="save-btn">Saqlash</button>
                <button onClick={resetBannerModal} className="cancel-btn">Bekor</button>
              </div>
            </div>
          </div>
        )}

        {/* Yangi user modal */}
        {showCreateUser && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => setShowCreateUser(false)}></div>
            <div className="modal-content">
              <h3>Yangi foydalanuvchi yaratish</h3>
              <input placeholder="Login" value={newUserData.login} onChange={e => setNewUserData({ ...newUserData, login: e.target.value })} />
              <input type="password" placeholder="Parol" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} />
              <input placeholder="Ism (ixtiyoriy)" value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} />
              <input type="number" placeholder="Boshlang'ich balans" value={newUserData.balance} onChange={e => setNewUserData({ ...newUserData, balance: e.target.value })} />
              <div className="modal-actions">
                <button onClick={createNewUser} className="save-btn">Yaratish</button>
                <button onClick={() => setShowCreateUser(false)} className="cancel-btn">Bekor</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPanel;