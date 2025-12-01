import React, { useState, useEffect, useMemo } from 'react';
import '../styles/AdminPanel.css';
import {
  RiUserLine,
  RiWallet3Line,
  RiShoppingBagLine,
  RiBarChartLine,
  RiAdvertisementLine,
  RiImageLine,
  RiLogoutBoxLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiRefreshLine,
  RiFileExcelLine,
  RiFileTextLine,
  RiAlertLine,
  RiInformationLine,
  RiStoreLine,
  RiVipCrownLine,
  RiHistoryLine,
  RiLockLine,
  RiLockUnlockLine,
  RiMoneyDollarCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiMoreLine
} from 'react-icons/ri';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function AdminPanel({ onLogout, allUsers = [], updateUser }) {
  // States
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [approvedAds, setApprovedAds] = useState([]);
  const [rejectedAds, setRejectedAds] = useState([]);
  const [banners, setBanners] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('login');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Modal States
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Data States
  const [newUserData, setNewUserData] = useState({
    login: '',
    password: '',
    name: '',
    balance: 0,
    isPremium: false
  });
  
  const [bannerData, setBannerData] = useState({
    id: null,
    title: '',
    description: '',
    image: '',
    link: '',
    active: true,
    type: 'main'
  });
  
  const [shopData, setShopData] = useState({
    id: null,
    name: '',
    category: '',
    logo: '',
    rating: 0,
    menu: []
  });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState([]);
  const [confirmAction, setConfirmAction] = useState({ callback: null, message: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Initialize
  useEffect(() => {
    loadAllData();
  }, []);

  // Load data from localStorage
  const loadAllData = () => {
    try {
      // Users
      setUsers(allUsers);
      
      // Shops
      const shopsData = JSON.parse(localStorage.getItem('shops') || '[]');
      setShops(shopsData);
      
      // Ads
      setPendingAds(JSON.parse(localStorage.getItem('pendingAds') || '[]'));
      setApprovedAds(JSON.parse(localStorage.getItem('approvedAds') || '[]'));
      setRejectedAds(JSON.parse(localStorage.getItem('rejectedAds') || '[]'));
      
      // Banners
      const bannersData = JSON.parse(localStorage.getItem('banners') || '[]');
      setBanners(bannersData);
      
    } catch (error) {
      showNotification('Ma\'lumotlarni yuklashda xatolik', 'error');
    }
  };

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const confirmActionModal = (message, callback) => {
    setConfirmAction({ callback, message });
    setShowConfirmModal(true);
  };

  // User Management
  const createNewUser = () => {
    if (!newUserData.login || !newUserData.password) {
      showNotification('Login va parol talab qilinadi', 'error');
      return;
    }

    const newUser = {
      login: newUserData.login.trim(),
      password: newUserData.password,
      token: Math.random().toString(36).substr(2, 9),
      balance: parseInt(newUserData.balance) || 0,
      isPremium: newUserData.isPremium,
      profile: {
        name: newUserData.name || newUserData.login,
        avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      },
      cards: [],
      history: [],
      messages: [],
      blocked: false,
      createdAt: new Date().toISOString()
    };

    // Update allUsers
    const updatedUsers = [...allUsers, newUser];
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    
    // Update parent state
    if (updateUser) {
      // Find the new user and update
      const createdUser = updatedUsers.find(u => u.login === newUser.login);
      if (createdUser) {
        updateUser(createdUser);
      }
    }

    showNotification('Yangi foydalanuvchi yaratildi');
    setShowCreateUser(false);
    setNewUserData({ login: '', password: '', name: '', balance: 0, isPremium: false });
    loadAllData();
  };

  const toggleBlockUser = (user) => {
    const updatedUser = { ...user, blocked: !user.blocked };
    const updatedUsers = users.map(u => u.login === user.login ? updatedUser : u);
    
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    showNotification(updatedUser.blocked ? 'Foydalanuvchi bloklandi' : 'Blok ochildi');
  };

  const addBalanceToUser = (user, amount) => {
    const updatedUser = {
      ...user,
      balance: (user.balance || 0) + amount,
      history: [
        ...(user.history || []),
        {
          id: Date.now(),
          time: new Date().toLocaleString('uz-UZ'),
          action: `Admin tomonidan balans qo'shildi`,
          amount: `+${amount.toLocaleString()} token`,
          type: 'admin_add',
          admin: true
        }
      ]
    };

    const updatedUsers = users.map(u => u.login === user.login ? updatedUser : u);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    showNotification(`${amount.toLocaleString()} token qo'shildi`);
  };

  const resetUserPassword = (user) => {
    const newPassword = Math.random().toString(36).slice(2, 10);
    const updatedUser = {
      ...user,
      password: newPassword,
      history: [
        ...(user.history || []),
        {
          id: Date.now(),
          time: new Date().toLocaleString('uz-UZ'),
          action: 'Parol yangilandi',
          details: `Yangi parol: ${newPassword}`,
          type: 'password_reset'
        }
      ]
    };

    const updatedUsers = users.map(u => u.login === user.login ? updatedUser : u);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    showNotification(`Parol yangilandi: ${newPassword}`);
  };

  const viewUserHistory = (user) => {
    setSelectedUser(user);
    setSelectedUserHistory(user.history || []);
    setShowHistoryModal(true);
  };

  const clearUserHistory = (user) => {
    confirmActionModal(
      `"${user.login}" foydalanuvchi tarixini tozalashni tasdiqlaysizmi?`,
      () => {
        const updatedUser = { ...user, history: [] };
        const updatedUsers = users.map(u => u.login === user.login ? updatedUser : u);
        
        localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setSelectedUserHistory([]);
        
        showNotification('Tarix tozalandi');
      }
    );
  };

  // Shop Management
  const saveShop = () => {
    if (!shopData.name.trim()) {
      showNotification('Do\'kon nomi talab qilinadi', 'error');
      return;
    }

    let updatedShops = [...shops];
    
    if (shopData.id) {
      // Edit existing shop
      updatedShops = shops.map(shop => 
        shop.id === shopData.id ? shopData : shop
      );
    } else {
      // Add new shop
      const newShop = {
        ...shopData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      updatedShops.push(newShop);
    }

    localStorage.setItem('shops', JSON.stringify(updatedShops));
    setShops(updatedShops);
    setShowShopModal(false);
    setShopData({ id: null, name: '', category: '', logo: '', rating: 0, menu: [] });
    
    showNotification(shopData.id ? 'Do\'kon yangilandi' : 'Do\'kon qo\'shildi');
  };

  const deleteShop = (shop) => {
    confirmActionModal(
      `"${shop.name}" do'konini o'chirishni tasdiqlaysizmi?`,
      () => {
        const updatedShops = shops.filter(s => s.id !== shop.id);
        localStorage.setItem('shops', JSON.stringify(updatedShops));
        setShops(updatedShops);
        showNotification('Do\'kon o\'chirildi', 'warning');
      }
    );
  };

  // Banner Management
  const saveBanner = () => {
    if (!bannerData.title.trim()) {
      showNotification('Banner sarlavhasi talab qilinadi', 'error');
      return;
    }

    let updatedBanners = [...banners];
    
    if (bannerData.id) {
      // Edit existing banner
      updatedBanners = banners.map(banner => 
        banner.id === bannerData.id ? bannerData : banner
      );
    } else {
      // Add new banner
      const newBanner = {
        ...bannerData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      updatedBanners.push(newBanner);
    }

    localStorage.setItem('banners', JSON.stringify(updatedBanners));
    setBanners(updatedBanners);
    setShowBannerModal(false);
    setBannerData({ id: null, title: '', description: '', image: '', link: '', active: true, type: 'main' });
    
    showNotification(bannerData.id ? 'Banner yangilandi' : 'Banner qo\'shildi');
  };

  const deleteBanner = (banner) => {
    confirmActionModal(
      `"${banner.title}" bannerini o'chirishni tasdiqlaysizmi?`,
      () => {
        const updatedBanners = banners.filter(b => b.id !== banner.id);
        localStorage.setItem('banners', JSON.stringify(updatedBanners));
        setBanners(updatedBanners);
        showNotification('Banner o\'chirildi', 'warning');
      }
    );
  };

  const toggleBannerActive = (banner) => {
    const updatedBanner = { ...banner, active: !banner.active };
    const updatedBanners = banners.map(b => b.id === banner.id ? updatedBanner : b);
    
    localStorage.setItem('banners', JSON.stringify(updatedBanners));
    setBanners(updatedBanners);
    
    showNotification(updatedBanner.active ? 'Banner faollashtirildi' : 'Banner o\'chirildi');
  };

  // Ad Management
  const approveAd = (ad) => {
    const updatedAd = { ...ad, status: 'approved', approvedAt: new Date().toISOString() };
    
    const updatedApproved = [...approvedAds, updatedAd];
    const updatedPending = pendingAds.filter(a => a.id !== ad.id);
    
    localStorage.setItem('approvedAds', JSON.stringify(updatedApproved));
    localStorage.setItem('pendingAds', JSON.stringify(updatedPending));
    
    setApprovedAds(updatedApproved);
    setPendingAds(updatedPending);
    
    showNotification('Reklama tasdiqlandi');
  };

  const rejectAd = (ad) => {
    const updatedAd = { ...ad, status: 'rejected', rejectedAt: new Date().toISOString() };
    
    const updatedRejected = [...rejectedAds, updatedAd];
    const updatedPending = pendingAds.filter(a => a.id !== ad.id);
    
    localStorage.setItem('rejectedAds', JSON.stringify(updatedRejected));
    localStorage.setItem('pendingAds', JSON.stringify(updatedPending));
    
    setRejectedAds(updatedRejected);
    setPendingAds(updatedPending);
    
    showNotification('Reklama rad etildi');
  };

  // Export Functions
  const exportToJSON = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('JSON fayl yuklab olindi');
  };

  const exportToExcel = () => {
    // Simple Excel export implementation
    const data = users.map(user => ({
      Login: user.login,
      Ism: user.profile?.name || '',
      Balans: user.balance || 0,
      Premium: user.isPremium ? 'Ha' : 'Yo\'q',
      Bloklangan: user.blocked ? 'Ha' : 'Yo\'q',
      Kartalar: user.cards?.length || 0,
      'Tarix yozuvlari': user.history?.length || 0,
      'Yaratilgan sana': new Date(user.createdAt).toLocaleDateString('uz-UZ')
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('Excel fayl yuklab olindi');
  };

  // Statistics
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const activeUsers = users.filter(user => !user.blocked).length;
  const premiumUsers = users.filter(user => user.isPremium).length;
  const blockedUsers = users.filter(user => user.blocked).length;

  // Chart Data
  const balanceChartData = {
    labels: users.slice(0, 10).map(user => user.login),
    datasets: [{
      label: 'Balans',
      data: users.slice(0, 10).map(user => user.balance || 0),
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1
    }]
  };

  const userStatusChartData = {
    labels: ['Aktiv', 'Premium', 'Bloklangan'],
    datasets: [{
      data: [activeUsers, premiumUsers, blockedUsers],
      backgroundColor: [
        'rgba(46, 204, 113, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(231, 76, 60, 0.7)'
      ],
      borderColor: [
        'rgba(46, 204, 113, 1)',
        'rgba(241, 196, 15, 1)',
        'rgba(231, 76, 60, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(user =>
        user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'balance':
          return (b.balance || 0) - (a.balance || 0);
        case 'login':
          return a.login.localeCompare(b.login);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'premium':
          return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [users, searchTerm, sortBy]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Foydalanuvchi statistikasi'
      }
    }
  };

  return (
    <div className="admin-panel">
      {/* Notification */}
      {notification.show && (
        <div className={`admin-notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' && <RiCheckLine />}
            {notification.type === 'error' && <RiCloseLine />}
            {notification.type === 'warning' && <RiAlertLine />}
            {notification.type === 'info' && <RiInformationLine />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1><RiBarChartLine /> Admin Panel</h1>
          <div className="header-stats">
            <div className="stat-item">
              <RiUserLine />
              <span>Foydalanuvchilar: {users.length}</span>
            </div>
            <div className="stat-item">
              <RiWallet3Line />
              <span>Jami balans: {totalBalance.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <RiVipCrownLine />
              <span>Premium: {premiumUsers}</span>
            </div>
          </div>
        </div>
        <div className="admin-header-right">
          <button className="export-btn" onClick={exportToJSON}>
            <RiFileTextLine /> JSON
          </button>
          <button className="export-btn" onClick={exportToExcel}>
            <RiFileExcelLine /> Excel
          </button>
          <button className="logout-btn" onClick={onLogout}>
            <RiLogoutBoxLine /> Chiqish
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <RiBarChartLine /> Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <RiUserLine /> Foydalanuvchilar
        </button>
        <button
          className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
          onClick={() => setActiveTab('shops')}
        >
          <RiStoreLine /> Do'konlar
        </button>
        <button
          className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
          onClick={() => setActiveTab('ads')}
        >
          <RiAdvertisementLine /> Reklamalar
        </button>
        <button
          className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
          onClick={() => setActiveTab('banners')}
        >
          <RiImageLine /> Bannerlar
        </button>
      </div>

      {/* Main Content */}
      <main className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card primary">
                <h3>Jami foydalanuvchilar</h3>
                <p>{users.length}</p>
                <RiUserLine className="stat-icon" />
              </div>
              <div className="stat-card success">
                <h3>Jami balans</h3>
                <p>{totalBalance.toLocaleString()} token</p>
                <RiWallet3Line className="stat-icon" />
              </div>
              <div className="stat-card warning">
                <h3>Premium foydalanuvchilar</h3>
                <p>{premiumUsers}</p>
                <RiVipCrownLine className="stat-icon" />
              </div>
              <div className="stat-card danger">
                <h3>Bloklanganlar</h3>
                <p>{blockedUsers}</p>
                <RiLockLine className="stat-icon" />
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Top 10 balans</h3>
                <Bar data={balanceChartData} options={chartOptions} />
              </div>
              <div className="chart-card">
                <h3>Foydalanuvchi holati</h3>
                <Pie data={userStatusChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="content-header">
              <div className="search-filter">
                <div className="search-box">
                  <RiSearchLine />
                  <input
                    type="text"
                    placeholder="Foydalanuvchi qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="login">Login bo'yicha</option>
                  <option value="balance">Balans bo'yicha</option>
                  <option value="date">Sana bo'yicha</option>
                  <option value="premium">Premium bo'yicha</option>
                </select>
                <button className="add-btn" onClick={() => setShowCreateUser(true)}>
                  <RiAddLine /> Yangi foydalanuvchi
                </button>
              </div>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Login</th>
                    <th>Ism</th>
                    <th>Balans</th>
                    <th>Premium</th>
                    <th>Holat</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.login} className={user.blocked ? 'blocked' : ''}>
                      <td>
                        <div className="user-cell">
                          <img
                            src={user.profile?.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                            alt={user.login}
                            className="user-avatar"
                          />
                          <span>@{user.login}</span>
                        </div>
                      </td>
                      <td>{user.profile?.name || '-'}</td>
                      <td>
                        <span className="balance-badge">
                          {user.balance?.toLocaleString() || 0} token
                        </span>
                      </td>
                      <td>
                        {user.isPremium ? (
                          <span className="premium-badge">
                            <RiVipCrownLine /> Premium
                          </span>
                        ) : (
                          <span className="regular-badge">Oddiy</span>
                        )}
                      </td>
                      <td>
                        {user.blocked ? (
                          <span className="status-badge blocked">Bloklangan</span>
                        ) : (
                          <span className="status-badge active">Aktiv</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn info"
                            onClick={() => viewUserHistory(user)}
                            title="Tarixni ko'rish"
                          >
                            <RiHistoryLine />
                          </button>
                          <div className="balance-actions">
                            <button onClick={() => addBalanceToUser(user, 1000)}>+1K</button>
                            <button onClick={() => addBalanceToUser(user, 5000)}>+5K</button>
                            <button onClick={() => addBalanceToUser(user, 10000)}>+10K</button>
                          </div>
                          <button
                            className="action-btn warning"
                            onClick={() => toggleBlockUser(user)}
                            title={user.blocked ? 'Blokni ochish' : 'Bloklash'}
                          >
                            {user.blocked ? <RiLockUnlockLine /> : <RiLockLine />}
                          </button>
                          <button
                            className="action-btn danger"
                            onClick={() => resetUserPassword(user)}
                            title="Parolni yangilash"
                          >
                            <RiRefreshLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <RiArrowUpLine />
                </button>
                <span>Sahifa {currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <RiArrowDownLine />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div className="shops-content">
            <div className="content-header">
              <h2>Do'konlar</h2>
              <button className="add-btn" onClick={() => setShowShopModal(true)}>
                <RiAddLine /> Yangi do'kon
              </button>
            </div>
            <div className="shops-grid">
              {shops.map((shop) => (
                <div key={shop.id} className="shop-card">
                  <div className="shop-header">
                    <img src={shop.logo || 'https://cdn-icons-png.flaticon.com/512/891/891419.png'} alt={shop.name} />
                    <div className="shop-info">
                      <h3>{shop.name}</h3>
                      <span className="shop-category">{shop.category}</span>
                      <div className="shop-rating">
                        {'★'.repeat(shop.rating)}{'☆'.repeat(5 - shop.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="shop-actions">
                    <button className="action-btn info" onClick={() => {
                      setShopData(shop);
                      setShowShopModal(true);
                    }}>
                      <RiEditLine /> Tahrirlash
                    </button>
                    <button className="action-btn danger" onClick={() => deleteShop(shop)}>
                      <RiDeleteBinLine /> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="ads-content">
            <div className="ads-tabs">
              <button className={`ads-tab-btn ${pendingAds.length > 0 ? 'has-notification' : ''}`}>
                Kutilayotgan ({pendingAds.length})
              </button>
              <button className="ads-tab-btn">
                Tasdiqlangan ({approvedAds.length})
              </button>
              <button className="ads-tab-btn">
                Rad etilgan ({rejectedAds.length})
              </button>
            </div>
            <div className="ads-list">
              {pendingAds.length === 0 ? (
                <div className="empty-state">
                  <RiInformationLine />
                  <p>Kutilayotgan reklamalar yo'q</p>
                </div>
              ) : (
                pendingAds.map((ad) => (
                  <div key={ad.id} className="ad-card">
                    <div className="ad-header">
                      <h3>{ad.title}</h3>
                      <span className="ad-price">{ad.price} token</span>
                    </div>
                    <p className="ad-description">{ad.description}</p>
                    <div className="ad-footer">
                      <span className="ad-seller">@ {ad.seller}</span>
                      <div className="ad-actions">
                        <button className="success-btn" onClick={() => approveAd(ad)}>
                          <RiCheckLine /> Tasdiqlash
                        </button>
                        <button className="danger-btn" onClick={() => rejectAd(ad)}>
                          <RiCloseLine /> Rad etish
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="banners-content">
            <div className="content-header">
              <h2>Banner reklamalar</h2>
              <button className="add-btn" onClick={() => setShowBannerModal(true)}>
                <RiAddLine /> Yangi banner
              </button>
            </div>
            <div className="banners-grid">
              {banners.map((banner) => (
                <div key={banner.id} className={`banner-card ${!banner.active ? 'inactive' : ''}`}>
                  <div className="banner-image">
                    <img src={banner.image || 'https://via.placeholder.com/300x150'} alt={banner.title} />
                    <div className="banner-status">
                      {banner.active ? 'Faol' : 'Nofaol'}
                    </div>
                  </div>
                  <div className="banner-info">
                    <h3>{banner.title}</h3>
                    <p>{banner.description}</p>
                    {banner.link && (
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="banner-link">
                        Havola: {banner.link}
                      </a>
                    )}
                  </div>
                  <div className="banner-actions">
                    <button
                      className={`action-btn ${banner.active ? 'warning' : 'success'}`}
                      onClick={() => toggleBannerActive(banner)}
                    >
                      {banner.active ? <RiEyeOffLine /> : <RiEyeLine />}
                      {banner.active ? 'Ochirish' : 'Yoqish'}
                    </button>
                    <button
                      className="action-btn info"
                      onClick={() => {
                        setBannerData(banner);
                        setShowBannerModal(true);
                      }}
                    >
                      <RiEditLine /> Tahrirlash
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => deleteBanner(banner)}
                    >
                      <RiDeleteBinLine /> O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Create User Modal */}
      {showCreateUser && (
        <div className="modal-overlay" onClick={() => setShowCreateUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Yangi foydalanuvchi</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Login *</label>
                <input
                  type="text"
                  value={newUserData.login}
                  onChange={(e) => setNewUserData({...newUserData, login: e.target.value})}
                  placeholder="foydalanuvchi123"
                />
              </div>
              <div className="form-group">
                <label>Parol *</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Parol"
                />
              </div>
              <div className="form-group">
                <label>Ism</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  placeholder="Foydalanuvchi ismi"
                />
              </div>
              <div className="form-group">
                <label>Boshlang'ich balans</label>
                <input
                  type="number"
                  value={newUserData.balance}
                  onChange={(e) => setNewUserData({...newUserData, balance: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newUserData.isPremium}
                    onChange={(e) => setNewUserData({...newUserData, isPremium: e.target.checked})}
                  />
                  Premium foydalanuvchi
                </label>
              </div>
              <div className="modal-actions">
                <button className="primary-btn" onClick={createNewUser}>
                  Yaratish
                </button>
                <button className="secondary-btn" onClick={() => setShowCreateUser(false)}>
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="modal-overlay" onClick={() => setShowBannerModal(false)}>
          <div className="modal-content wide-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{bannerData.id ? 'Banner tahrirlash' : 'Yangi banner'}</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Sarlavha *</label>
                <input
                  type="text"
                  value={bannerData.title}
                  onChange={(e) => setBannerData({...bannerData, title: e.target.value})}
                  placeholder="Banner sarlavhasi"
                />
              </div>
              <div className="form-group">
                <label>Tavsif</label>
                <textarea
                  value={bannerData.description}
                  onChange={(e) => setBannerData({...bannerData, description: e.target.value})}
                  placeholder="Banner tavsifi"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Rasm URL</label>
                <input
                  type="text"
                  value={bannerData.image}
                  onChange={(e) => setBannerData({...bannerData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>Havola</label>
                <input
                  type="text"
                  value={bannerData.link}
                  onChange={(e) => setBannerData({...bannerData, link: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={bannerData.active}
                    onChange={(e) => setBannerData({...bannerData, active: e.target.checked})}
                  />
                  Faol banner
                </label>
              </div>
              <div className="modal-actions">
                <button className="primary-btn" onClick={saveBanner}>
                  Saqlash
                </button>
                <button className="secondary-btn" onClick={() => setShowBannerModal(false)}>
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Modal */}
      {showShopModal && (
        <div className="modal-overlay" onClick={() => setShowShopModal(false)}>
          <div className="modal-content wide-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{shopData.id ? 'Do\'kon tahrirlash' : 'Yangi do\'kon'}</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Do'kon nomi *</label>
                <input
                  type="text"
                  value={shopData.name}
                  onChange={(e) => setShopData({...shopData, name: e.target.value})}
                  placeholder="Do'kon nomi"
                />
              </div>
              <div className="form-group">
                <label>Kategoriya</label>
                <input
                  type="text"
                  value={shopData.category}
                  onChange={(e) => setShopData({...shopData, category: e.target.value})}
                  placeholder="Kategoriya"
                />
              </div>
              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="text"
                  value={shopData.logo}
                  onChange={(e) => setShopData({...shopData, logo: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="form-group">
                <label>Reyting (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={shopData.rating}
                  onChange={(e) => setShopData({...shopData, rating: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="modal-actions">
                <button className="primary-btn" onClick={saveShop}>
                  Saqlash
                </button>
                <button className="secondary-btn" onClick={() => setShowShopModal(false)}>
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tasdiqlash</h3>
            <p>{confirmAction.message}</p>
            <div className="modal-actions">
              <button
                className="danger-btn"
                onClick={() => {
                  if (confirmAction.callback) confirmAction.callback();
                  setShowConfirmModal(false);
                }}
              >
                Tasdiqlash
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>@{selectedUser?.login} - Tarix</h2>
              <button className="clear-btn" onClick={() => clearUserHistory(selectedUser)}>
                <RiDeleteBinLine /> Tarixni tozalash
              </button>
            </div>
            <div className="history-list">
              {selectedUserHistory.length === 0 ? (
                <div className="empty-state">
                  <RiInformationLine />
                  <p>Tarix bo'sh</p>
                </div>
              ) : (
                selectedUserHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-time">{item.time}</div>
                    <div className="history-action">{item.action}</div>
                    <div className="history-amount">{item.amount}</div>
                    {item.details && (
                      <div className="history-details">{item.details}</div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowHistoryModal(false)}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;