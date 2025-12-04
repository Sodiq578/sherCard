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
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import asosiyReklamaImage from '../assets/images/asosiyReklama.png';

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
  const [marketCards, setMarketCards] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ 
    balance: 0, 
    name: '', 
    phone: '', 
    email: '' 
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('login');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('users');
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });

  // Shop states
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState({ 
    name: '', 
    logo: '' 
  });
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ 
    name: '', 
    price: '' 
  });
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  // History modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);

  // REKLAMA STATES
  const [marketAds, setMarketAds] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [rejectedAds, setRejectedAds] = useState([]);
  const [adSearch, setAdSearch] = useState('');
  const [adFilter, setAdFilter] = useState('all');
  const [adSort, setAdSort] = useState('newest');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adStats, setAdStats] = useState(null);
  const [showAdStats, setShowAdStats] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [adsToday, setAdsToday] = useState(0);
  const [activeAds, setActiveAds] = useState(0);

  // Banner states
  const [banners, setBanners] = useState([]);
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [showEditBanner, setShowEditBanner] = useState(false);
  const [newBanner, setNewBanner] = useState({
    id: '',
    title: '',
    description: '',
    image: asosiyReklamaImage,
    link: '',
    active: true,
    type: 'payment',
    buttonText: 'To\'lash',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    order: 0,
    customImage: false
  });
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerTab, setBannerTab] = useState('all');
  const [bannerSearch, setBannerSearch] = useState('');
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [bannerStats, setBannerStats] = useState({
    totalClicks: 0,
    totalBanners: 0,
    activeBanners: 0,
    mostClicked: null
  });

  // Initial load
  useEffect(() => {
    setUsers(allUsers || []);
    loadMarketCards();
    loadShops();
    loadBanners();
    loadMarketAds();
  }, [allUsers]);

  // Load market ads
  const loadMarketAds = () => {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingMarketAds') || '[]');
      setPendingAds(pending);
      
      const approved = JSON.parse(localStorage.getItem('approvedMarketAds') || '[]');
      setMarketAds(approved);
      
      const rejected = JSON.parse(localStorage.getItem('rejectedMarketAds') || '[]');
      setRejectedAds(rejected);
      
      const now = Date.now();
      const active = approved.filter(ad => ad.expiresAt > now);
      setActiveAds(active.length);
      
      const today = new Date().setHours(0, 0, 0, 0);
      const todayAds = pending.concat(approved, rejected)
        .filter(ad => new Date(ad.createdAt).setHours(0, 0, 0, 0) === today);
      setAdsToday(todayAds.length);
      
      const total = approved.reduce((sum, ad) => sum + (ad.cost || 0), 0);
      setTotalRevenue(total);
      
    } catch (error) {
      console.error('Reklamalarni yuklashda xato:', error);
    }
  };

  // Load market cards
  const loadMarketCards = () => {
    const stored = localStorage.getItem('marketCards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMarketCards(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("marketCards o'qishda xato:", e);
        setMarketCards([]);
      }
    } else {
      setMarketCards([]);
    }
  };

  // Load shops
  const loadShops = () => {
    const data = getShops();
    if (Array.isArray(data)) {
      const fixed = data.map(shop => ({
        ...shop,
        menu: Array.isArray(shop.menu) ? shop.menu : []
      }));
      setShops(fixed);
    } else {
      setShops([]);
    }
  };

  // Load banners with statistics
  const loadBanners = () => {
    const stored = localStorage.getItem('mainPageBanners');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBanners(parsed);
          
          // Calculate banner statistics
          const totalClicks = parsed.reduce((sum, banner) => sum + (banner.clicks || 0), 0);
          const activeBanners = parsed.filter(banner => banner.active).length;
          const mostClicked = parsed.reduce((max, banner) => 
            (banner.clicks || 0) > (max?.clicks || 0) ? banner : max, null);
          
          setBannerStats({
            totalClicks,
            totalBanners: parsed.length,
            activeBanners,
            mostClicked
          });
          
        } else {
          const defaultBanners = [
            {
              id: 1,
              title: 'Token bilan to\'lash',
              description: 'Bir bosishda to\'lov qilish imkoniyati',
              image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              link: '/payment',
              active: true,
              type: 'payment',
              buttonText: 'To\'lash',
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textColor: '#ffffff',
              createdAt: new Date().toISOString(),
              order: 1,
              customImage: false,
              clicks: 0
            },
            {
              id: 2,
              title: 'Premium kurslar',
              description: 'Maxsus chegirmalar faqat bugun',
              image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              link: '/premium',
              active: true,
              type: 'promotion',
              buttonText: 'Ko\'rish',
              backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              textColor: '#ffffff',
              createdAt: new Date().toISOString(),
              order: 2,
              customImage: false,
              clicks: 0
            },
            {
              id: 3,
              title: 'Market Reklama',
              description: '30,000+ foydalanuvchiga yetib boring',
              image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
              link: '/market',
              active: true,
              type: 'advertisement',
              buttonText: 'Reklama berish',
              backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              textColor: '#ffffff',
              createdAt: new Date().toISOString(),
              order: 3,
              customImage: false,
              clicks: 0
            }
          ];
          setBanners(defaultBanners);
          saveBanners(defaultBanners);
          setBannerStats({
            totalClicks: 0,
            totalBanners: 3,
            activeBanners: 3,
            mostClicked: null
          });
        }
      } catch (e) {
        console.error("Bannerlarni yuklashda xato:", e);
        const defaultBanners = [
          {
            id: 1,
            title: 'Token bilan to\'lash',
            description: 'Bir bosishda to\'lov qilish imkoniyati',
            image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            link: '/payment',
            active: true,
            type: 'payment',
            buttonText: 'To\'lash',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textColor: '#ffffff',
            createdAt: new Date().toISOString(),
            order: 1,
            customImage: false,
            clicks: 0
          }
        ];
        setBanners(defaultBanners);
        saveBanners(defaultBanners);
        setBannerStats({
          totalClicks: 0,
          totalBanners: 1,
          activeBanners: 1,
          mostClicked: null
        });
      }
    } else {
      const defaultBanners = [
        {
          id: 1,
          title: 'Token bilan to\'lash',
          description: 'Bir bosishda to\'lov qilish imkoniyati',
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          link: '/payment',
          active: true,
          type: 'payment',
          buttonText: 'To\'lash',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textColor: '#ffffff',
          createdAt: new Date().toISOString(),
          order: 1,
          customImage: false,
          clicks: 0
        }
      ];
      setBanners(defaultBanners);
      saveBanners(defaultBanners);
      setBannerStats({
        totalClicks: 0,
        totalBanners: 1,
        activeBanners: 1,
        mostClicked: null
      });
    }
  };

  // Save banners
  const saveBanners = (bannersList) => {
    localStorage.setItem('mainPageBanners', JSON.stringify(bannersList));
  };

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ===================== BANNER MANAGEMENT =====================

  // Filter banners
  const filteredBanners = useMemo(() => {
    let result = [...banners];
    
    if (bannerSearch) {
      const term = bannerSearch.toLowerCase();
      result = result.filter(banner => 
        (banner.title || '').toLowerCase().includes(term) ||
        (banner.description || '').toLowerCase().includes(term) ||
        (banner.type || '').toLowerCase().includes(term)
      );
    }
    
    if (bannerTab === 'active') {
      result = result.filter(b => b.active);
    } else if (bannerTab === 'inactive') {
      result = result.filter(b => !b.active);
    } else if (bannerTab === 'payment') {
      result = result.filter(b => b.type === 'payment');
    } else if (bannerTab === 'promotion') {
      result = result.filter(b => b.type === 'promotion');
    } else if (bannerTab === 'advertisement') {
      result = result.filter(b => b.type === 'advertisement');
    }
    
    result.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return result;
  }, [banners, bannerTab, bannerSearch]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      showNotification('Faqat rasm fayllari yuklash mumkin!', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Rasm hajmi 5MB dan oshmasligi kerak!', 'error');
      return;
    }
    
    setImageUploadProgress(0);
    
    const interval = setInterval(() => {
      setImageUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      clearInterval(interval);
      setImageUploadProgress(100);
      
      setTimeout(() => {
        setNewBanner({ ...newBanner, image: e.target.result, customImage: true });
        setImageUploadProgress(0);
        showNotification('Rasm muvaffaqiyatli yuklandi!', 'success');
      }, 500);
    };
    
    reader.onerror = () => {
      clearInterval(interval);
      setImageUploadProgress(0);
      showNotification('Rasm yuklashda xatolik!', 'error');
    };
    
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = () => {
    setNewBanner({ 
      ...newBanner, 
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      customImage: false 
    });
    showNotification('Rasm olib tashlandi, standart rasm qo\'yildi!', 'warning');
  };

  // Add image by URL
  const handleImageUrl = () => {
    const url = prompt('Rasm URL manzilini kiriting:');
    if (url && url.trim()) {
      if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
        showNotification('Noto\'g\'ri rasm URL formati!', 'error');
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        setNewBanner({ ...newBanner, image: url.trim(), customImage: true });
        showNotification('Rasm URL manzili qo\'shildi!', 'success');
      };
      img.onerror = () => {
        showNotification('Rasm URL manzili ishlamayapti yoki noto\'g\'ri!', 'error');
      };
      img.src = url;
    }
  };

  // Add new banner
  const addBanner = () => {
    const title = newBanner.title.trim();
    const description = newBanner.description.trim();
    const buttonText = newBanner.buttonText.trim();
    
    if (!title) {
      showNotification('Banner sarlavhasi kiritilishi shart!', 'error');
      return;
    }
    
    if (!description) {
      showNotification('Banner tavsifi kiritilishi shart!', 'error');
      return;
    }
    
    if (!buttonText) {
      showNotification('Tugma matni kiritilishi shart!', 'error');
      return;
    }

    const getBackgroundByType = (type) => {
      switch (type) {
        case 'payment':
          return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        case 'promotion':
          return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        case 'advertisement':
          return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        default:
          return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }
    };

    const banner = {
      id: Date.now(),
      title: title,
      description: description,
      image: newBanner.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      link: newBanner.link.trim(),
      active: newBanner.active,
      type: newBanner.type,
      buttonText: buttonText,
      backgroundColor: getBackgroundByType(newBanner.type),
      textColor: '#ffffff',
      createdAt: new Date().toISOString(),
      order: banners.length + 1,
      customImage: newBanner.customImage || false,
      updatedAt: new Date().toISOString(),
      clicks: 0
    };

    const updatedBanners = [...banners, banner];
    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    loadBanners(); // Reload stats
    
    setNewBanner({
      title: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      link: '',
      active: true,
      type: 'payment',
      buttonText: 'To\'lash',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      customImage: false
    });
    setShowAddBanner(false);
    showNotification('Yangi banner muvaffaqiyatli qo\'shildi!');
  };

  // Edit banner
  const startEditBanner = (banner) => {
    setEditingBanner(banner);
    setNewBanner({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      link: banner.link,
      active: banner.active,
      type: banner.type,
      buttonText: banner.buttonText || 'To\'lash',
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      customImage: banner.customImage || false
    });
    setShowEditBanner(true);
  };

  // Save edited banner
  const saveEditBanner = () => {
    if (!editingBanner) {
      showNotification('Tahrirlash uchun banner tanlanmagan!', 'error');
      return;
    }

    const title = newBanner.title.trim();
    const description = newBanner.description.trim();
    const buttonText = newBanner.buttonText.trim();
    
    if (!title) {
      showNotification('Banner sarlavhasi kiritilishi shart!', 'error');
      return;
    }
    
    if (!description) {
      showNotification('Banner tavsifi kiritilishi shart!', 'error');
      return;
    }
    
    if (!buttonText) {
      showNotification('Tugma matni kiritilishi shart!', 'error');
      return;
    }

    const getBackgroundByType = (type) => {
      switch (type) {
        case 'payment':
          return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        case 'promotion':
          return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        case 'advertisement':
          return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        default:
          return editingBanner.backgroundColor;
      }
    };

    const updatedBanners = banners.map(b =>
      b.id === editingBanner.id
        ? {
            ...b,
            title: title,
            description: description,
            image: newBanner.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            link: newBanner.link.trim(),
            active: newBanner.active,
            type: newBanner.type,
            buttonText: buttonText,
            backgroundColor: getBackgroundByType(newBanner.type),
            textColor: newBanner.textColor,
            customImage: newBanner.customImage || false,
            updatedAt: new Date().toISOString()
          }
        : b
    );

    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    setShowEditBanner(false);
    setEditingBanner(null);
    loadBanners();
    
    setNewBanner({
      title: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      link: '',
      active: true,
      type: 'payment',
      buttonText: 'To\'lash',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      customImage: false
    });
    showNotification('Banner muvaffaqiyatli yangilandi!');
  };

  // Confirm delete
  const confirmDeleteBanner = (id) => {
    setShowDeleteConfirm(id);
  };

  // Delete banner
  const deleteBanner = (id) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    const filtered = banners.filter(b => b.id !== id);
    
    const reordered = filtered.map((b, index) => ({
      ...b,
      order: index + 1
    }));
    
    setBanners(reordered);
    saveBanners(reordered);
    setShowDeleteConfirm(null);
    loadBanners();
    showNotification(`"${banner.title}" banneri o'chirildi!`, 'warning');
  };

  // Toggle banner status
  const toggleBannerStatus = (id) => {
    const updatedBanners = banners.map(b =>
      b.id === id ? { ...b, active: !b.active } : b
    );

    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    loadBanners();
    showNotification(`Banner ${banners.find(b => b.id === id)?.active ? 'faolsizlantirildi' : 'faollashtirildi'}!`);
  };

  // Change banner order
  const moveBannerUp = (id) => {
    const index = banners.findIndex(b => b.id === id);
    if (index <= 0) return;

    const updatedBanners = [...banners];
    const temp = updatedBanners[index];
    updatedBanners[index] = updatedBanners[index - 1];
    updatedBanners[index - 1] = temp;

    updatedBanners.forEach((b, i) => {
      b.order = i + 1;
    });

    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    showNotification('Banner joylashuvi o\'zgartirildi!');
  };

  const moveBannerDown = (id) => {
    const index = banners.findIndex(b => b.id === id);
    if (index >= banners.length - 1) return;

    const updatedBanners = [...banners];
    const temp = updatedBanners[index];
    updatedBanners[index] = updatedBanners[index + 1];
    updatedBanners[index + 1] = temp;

    updatedBanners.forEach((b, i) => {
      b.order = i + 1;
    });

    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    showNotification('Banner joylashuvi o\'zgartirildi!');
  };

  // Export banners
  const exportBanners = () => {
    if (banners.length === 0) {
      showNotification('Eksport qilish uchun bannerlar mavjud emas!', 'error');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `banners-${timestamp}.json`;
    
    const dataStr = JSON.stringify(banners, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, filename);
    showNotification('Bannerlar muvaffaqiyatli yuklandi!');
  };

  // Import banners
  const importBanners = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedBanners = JSON.parse(e.target.result);
        if (Array.isArray(importedBanners)) {
          const newBanners = importedBanners.map((banner, index) => ({
            ...banner,
            id: Date.now() + index,
            order: banners.length + index + 1,
            image: banner.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            createdAt: banner.createdAt || new Date().toISOString(),
            customImage: banner.customImage || false
          }));
          
          const updatedBanners = [...banners, ...newBanners];
          setBanners(updatedBanners);
          saveBanners(updatedBanners);
          loadBanners();
          showNotification(`${newBanners.length} ta banner muvaffaqiyatli import qilindi!`);
        } else {
          showNotification('Import qilinayotgan fayl noto\'g\'ri formatda!', 'error');
        }
      } catch (error) {
        console.error('Import xatosi:', error);
        showNotification('Faylni o\'qishda xato yuz berdi!', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Duplicate banner
  const duplicateBanner = (banner) => {
    const duplicated = {
      ...banner,
      id: Date.now(),
      title: `${banner.title} (nusxa)`,
      order: banners.length + 1,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
    
    const updatedBanners = [...banners, duplicated];
    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    loadBanners();
    showNotification('Banner nusxalandi!', 'success');
  };

  // ===================== REKLAMA MANAGEMENT =====================

  // Filter ads
  const filteredAds = useMemo(() => {
    let result = [];
    
    if (adFilter === 'pending') {
      result = [...pendingAds];
    } else if (adFilter === 'approved') {
      result = [...marketAds];
    } else if (adFilter === 'rejected') {
      result = [...rejectedAds];
    } else {
      result = [...pendingAds, ...marketAds, ...rejectedAds];
    }
    
    if (adSearch) {
      const term = adSearch.toLowerCase();
      result = result.filter(ad => 
        (ad.text || '').toLowerCase().includes(term) ||
        (ad.seller || '').toLowerCase().includes(term) ||
        (ad.category || '').toLowerCase().includes(term) ||
        (ad.id || '').toLowerCase().includes(term)
      );
    }
    
    result.sort((a, b) => {
      if (adSort === 'newest') {
        return b.createdAt - a.createdAt;
      } else if (adSort === 'oldest') {
        return a.createdAt - b.createdAt;
      } else if (adSort === 'price-high') {
        return (b.cost || 0) - (a.cost || 0);
      } else if (adSort === 'price-low') {
        return (a.cost || 0) - (b.cost || 0);
      } else if (adSort === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
    
    return result;
  }, [pendingAds, marketAds, rejectedAds, adSearch, adFilter, adSort]);

  // Open ad details
  const openAdDetails = (ad) => {
    setSelectedAd(ad);
    setShowAdModal(true);
  };

  // Approve ad
  const approveAd = (ad) => {
    if (!window.confirm(`"${ad.text.substring(0, 50)}..." reklamasini tasdiqlaysizmi?`)) {
      return;
    }
    
    try {
      const newPending = pendingAds.filter(a => a.id !== ad.id);
      setPendingAds(newPending);
      localStorage.setItem('pendingMarketAds', JSON.stringify(newPending));
      
      const approvedAd = {
        ...ad,
        status: 'approved',
        approvedAt: Date.now(),
        approvedBy: 'Admin',
        adminComment: 'Reklama tasdiqlandi'
      };
      
      const newApproved = [...marketAds, approvedAd];
      setMarketAds(newApproved);
      localStorage.setItem('approvedMarketAds', JSON.stringify(newApproved));
      
      updateUserAdStatus(ad.sellerId, ad.id, 'approved');
      
      showNotification('Reklama muvaffaqiyatli tasdiqlandi!', 'success');
      setShowAdModal(false);
      loadMarketAds();
      
    } catch (error) {
      console.error('Reklamani tasdiqlashda xato:', error);
      showNotification('Tasdiqlashda xatolik yuz berdi!', 'error');
    }
  };

  // Reject ad
  const rejectAd = () => {
    if (!selectedAd || !rejectionReason.trim()) {
      showNotification('Rad etish sababini kiriting!', 'error');
      return;
    }
    
    if (!window.confirm('Reklamani rad etishni tasdiqlaysizmi?')) {
      return;
    }
    
    try {
      const newPending = pendingAds.filter(a => a.id !== selectedAd.id);
      setPendingAds(newPending);
      localStorage.setItem('pendingMarketAds', JSON.stringify(newPending));
      
      const rejectedAd = {
        ...selectedAd,
        status: 'rejected',
        rejectedAt: Date.now(),
        rejectedBy: 'Admin',
        rejectionReason: rejectionReason.trim(),
        adminComment: `Rad etildi: ${rejectionReason}`
      };
      
      const newRejected = [...rejectedAds, rejectedAd];
      setRejectedAds(newRejected);
      localStorage.setItem('rejectedMarketAds', JSON.stringify(newRejected));
      
      updateUserAdStatus(selectedAd.sellerId, selectedAd.id, 'rejected', true);
      
      showNotification('Reklama rad etildi va pul qaytarildi!', 'warning');
      setRejectionReason('');
      setShowAdModal(false);
      loadMarketAds();
      
    } catch (error) {
      console.error('Reklamani rad etishda xato:', error);
      showNotification('Rad etishda xatolik yuz berdi!', 'error');
    }
  };

  // Update user ad status
  const updateUserAdStatus = (userId, adId, status, refund = false) => {
    const allUsersData = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = allUsersData.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const user = allUsersData[userIndex];
      
      const updatedHistory = (user.history || []).map(hist => {
        if (hist.adId === adId) {
          return {
            ...hist,
            status: status,
            date: new Date().toLocaleString('uz-UZ'),
            ...(status === 'rejected' && refund ? {
              refund: true,
              refundAmount: hist.amount * -1,
              refundDate: new Date().toLocaleString('uz-UZ')
            } : {})
          };
        }
        return hist;
      });
      
      if (status === 'rejected' && refund) {
        const ad = filteredAds.find(a => a.id === adId);
        if (ad) {
          user.balance = (user.balance || 0) + (ad.cost || 0);
          
          updatedHistory.push({
            id: `refund_${Date.now()}`,
            date: new Date().toLocaleString('uz-UZ'),
            action: `Reklama rad etildi - ${ad.text.substring(0, 30)}...`,
            amount: ad.cost || 0,
            status: 'completed',
            type: 'refund',
            adId: adId,
            details: {
              reason: rejectionReason
            }
          });
        }
      }
      
      user.history = updatedHistory;
      allUsersData[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(allUsersData));
      
      updateUser(user);
    }
  };

  // Delete ad
  const deleteAd = (ad) => {
    if (!window.confirm('Bu reklamani o\'chirishni istaysizmi?')) {
      return;
    }
    
    try {
      let updated = [];
      let storageKey = '';
      
      if (ad.status === 'pending') {
        updated = pendingAds.filter(a => a.id !== ad.id);
        setPendingAds(updated);
        storageKey = 'pendingMarketAds';
      } else if (ad.status === 'approved') {
        updated = marketAds.filter(a => a.id !== ad.id);
        setMarketAds(updated);
        storageKey = 'approvedMarketAds';
      } else if (ad.status === 'rejected') {
        updated = rejectedAds.filter(a => a.id !== ad.id);
        setRejectedAds(updated);
        storageKey = 'rejectedMarketAds';
      }
      
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        showNotification('Reklama o\'chirildi!', 'warning');
        loadMarketAds();
      }
      
    } catch (error) {
      console.error('Reklamani o\'chirishda xato:', error);
      showNotification('O\'chirishda xatolik yuz berdi!', 'error');
    }
  };

  // View ad stats
  const viewAdStats = (ad) => {
    setAdStats(ad);
    setShowAdStats(true);
  };

  // Export ads
  const exportAds = () => {
    const allAds = [...pendingAds, ...marketAds, ...rejectedAds];
    if (allAds.length === 0) {
      showNotification('Eksport qilish uchun reklamalar mavjud emas!', 'error');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `market-ads-${timestamp}.xlsx`;
    
    const excelData = allAds.map(ad => ({
      'ID': ad.id,
      'Matn': ad.text,
      'Sotuvchi': ad.seller,
      'Kategoriya': ad.category,
      'Holat': ad.status,
      'Narx': ad.cost,
      'Muddati (kun)': ad.duration,
      'Ko\'rishlar': ad.views || 0,
      'Bosishlar': ad.clicks || 0,
      'CTR': ad.ctr || 0,
      'Yaratilgan': new Date(ad.createdAt).toLocaleString('uz-UZ'),
      'Tugash': new Date(ad.expiresAt).toLocaleString('uz-UZ'),
      'Admin izohi': ad.adminComment || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reklamalar');
    XLSX.writeFile(wb, filename);
    showNotification(`${allAds.length} ta reklama eksport qilindi!`);
  };

  // Get status label
  const getAdStatusLabel = (status) => {
    switch(status) {
      case 'pending': return { text: '⏳ Kutilmoqda', color: '#FFA500', bg: '#FFF3E0' };
      case 'approved': return { text: '✅ Tasdiqlangan', color: '#00C853', bg: '#E8F5E9' };
      case 'rejected': return { text: '❌ Rad etilgan', color: '#FF3D00', bg: '#FFEBEE' };
      default: return { text: '❓ Noma\'lum', color: '#757575', bg: '#F5F5F5' };
    }
  };

  // Get category label
  const getAdCategoryLabel = (category) => {
    switch(category) {
      case 'gaming': return { text: '🎮 Gaming', color: '#9C27B0' };
      case 'premium': return { text: '⭐ Premium', color: '#FFD700' };
      case 'urgent': return { text: '⚡ Shoshilinch', color: '#FF5252' };
      case 'discount': return { text: '🏷️ Chegirma', color: '#4CAF50' };
      default: return { text: '📢 Umumiy', color: '#2196F3' };
    }
  };

  // Chart data for ads
  const getAdsChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('uz-UZ', { weekday: 'short' });
    }).reverse();
    
    const dailyStats = last7Days.map(day => {
      const count = filteredAds.filter(ad => {
        const adDate = new Date(ad.createdAt).toLocaleDateString('uz-UZ', { weekday: 'short' });
        return adDate === day;
      }).length;
      return count;
    });
    
    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Reklamalar soni',
          data: dailyStats,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    };
  };

  // ===================== BANNER STATISTICS =====================
  const getBannerStatsData = () => {
    const bannerTypes = ['payment', 'promotion', 'advertisement'];
    const typeLabels = ['💳 To\'lov', '🎯 Aksiya', '📢 Reklama'];
    
    const data = bannerTypes.map(type => {
      return banners.filter(b => b.type === type).reduce((sum, b) => sum + (b.clicks || 0), 0);
    });
    
    return {
      labels: typeLabels,
      datasets: [
        {
          label: 'Banner bosilishlari',
          data: data,
          backgroundColor: [
            'rgba(102, 126, 234, 0.7)',
            'rgba(240, 147, 251, 0.7)',
            'rgba(79, 172, 254, 0.7)'
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(240, 147, 251, 1)',
            'rgba(79, 172, 254, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  // ===================== RENDER =====================
  
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
            <h1>👑 Admin Panel</h1>
            <div className="header-stats">
              <span>👥 Foydalanuvchilar: {users.length}</span>
              <span>💳 Kartalar: {marketCards.length}</span>
              <span>🏪 Do'konlar: {shops.length}</span>
              <span>📢 Reklamalar: {filteredAds.length}</span>
              <span>🎯 Bannerlar: {banners.length}</span>
              <span>💰 Daromad: {totalRevenue.toLocaleString()} so'm</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={onLogout} className="logout-btn">
              Chiqish
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Foydalanuvchilar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
            onClick={() => setActiveTab('ads')}
          >
            📢 Reklamalar ({filteredAds.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            🎯 Asosiy Sahifa Bannerlari ({banners.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            💳 Market Kartalar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => setActiveTab('shops')}
          >
            🏪 Do'konlar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            📊 Statistika
          </button>
        </div>
        
        {/* REKLAMALAR TAB */}
        {activeTab === 'ads' && (
          <div className="admin-section">
            <div className="section-header">
              <div>
                <h2>📢 Market Reklamalari ({filteredAds.length})</h2>
                <div className="ads-stats-small">
                  <span>⏳ Kutilmoqda: {pendingAds.length}</span>
                  <span>✅ Tasdiqlangan: {marketAds.length}</span>
                  <span>❌ Rad etilgan: {rejectedAds.length}</span>
                  <span>💰 Bugungi daromad: {totalRevenue.toLocaleString()} so'm</span>
                </div>
              </div>
              <div className="ads-header-actions">
                <input 
                  type="text" 
                  placeholder="Reklama qidirish..." 
                  value={adSearch}
                  onChange={(e) => setAdSearch(e.target.value)}
                  className="search-input"
                />
                <select 
                  value={adFilter}
                  onChange={(e) => setAdFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">📋 Barchasi</option>
                  <option value="pending">⏳ Kutilmoqda</option>
                  <option value="approved">✅ Tasdiqlangan</option>
                  <option value="rejected">❌ Rad etilgan</option>
                </select>
                <select 
                  value={adSort}
                  onChange={(e) => setAdSort(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">🕐 Yangilari</option>
                  <option value="oldest">🕐 Eskilari</option>
                  <option value="price-high">💰 Qimmatlari</option>
                  <option value="price-low">💰 Arzonlari</option>
                  <option value="views">👁️ Ko'p ko'rilganlar</option>
                </select>
                <button 
                  onClick={exportAds}
                  className="export-btn"
                >
                  📥 Export Excel
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-value">{totalRevenue.toLocaleString()}</div>
                  <div className="stat-label">Jami daromad</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{filteredAds.length}</div>
                  <div className="stat-label">Jami reklama</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{activeAds}</div>
                  <div className="stat-label">Faol reklama</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-value">{pendingAds.length}</div>
                  <div className="stat-label">Kutilayotgan</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👁️</div>
                <div className="stat-content">
                  <div className="stat-value">
                    {marketAds.reduce((sum, ad) => sum + (ad.views || 0), 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Jami ko'rishlar</div>
                </div>
              </div>
            </div>

            {/* Ads Grid */}
            <div className="ads-grid">
              {filteredAds.length > 0 ? (
                filteredAds.map(ad => {
                  const status = getAdStatusLabel(ad.status);
                  const category = getAdCategoryLabel(ad.category);
                  return (
                    <div key={ad.id} className="ad-admin-card">
                      <div className="ad-preview">
                        <div className="ad-image-preview">
                          <img 
                            src={ad.image} 
                            alt={ad.text}
                            onError={(e) => {
                              e.target.src = '/default-story.jpg';
                            }}
                          />
                          <div className="ad-category-badge" style={{ background: category.color }}>
                            {category.text}
                          </div>
                        </div>
                        <div className="ad-info">
                          <div className="ad-header">
                            <div>
                              <h4>{ad.text.length > 60 ? ad.text.substring(0, 60) + "..." : ad.text}</h4>
                              <div className="ad-meta">
                                <span className="ad-seller">@{ad.seller}</span>
                                <span className="ad-date">
                                  {new Date(ad.createdAt).toLocaleDateString('uz-UZ')}
                                </span>
                              </div>
                            </div>
                            <div className="ad-status-badge" style={{ 
                              color: status.color, 
                              background: status.bg 
                            }}>
                              {status.text}
                            </div>
                          </div>
                          
                          <div className="ad-details">
                            <div className="ad-stats">
                              <span>💰 Narx: {(ad.cost || 0).toLocaleString()} so'm</span>
                              <span>📅 Muddati: {ad.duration} kun</span>
                              {ad.views > 0 && (
                                <span>👁️ Ko'rishlar: {ad.views}</span>
                              )}
                              {ad.clicks > 0 && (
                                <span>👆 Bosishlar: {ad.clicks}</span>
                              )}
                            </div>
                            
                            {ad.adminComment && (
                              <div className="ad-admin-comment">
                                <strong>Admin izohi:</strong> {ad.adminComment}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ad-actions">
                        <button 
                          onClick={() => openAdDetails(ad)}
                          className="action-btn info"
                        >
                          👁️ Batafsil
                        </button>
                        
                        {ad.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => approveAd(ad)}
                              className="action-btn success"
                            >
                              ✅ Tasdiqlash
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedAd(ad);
                                setShowAdModal(true);
                              }}
                              className="action-btn warning"
                            >
                              ❌ Rad etish
                            </button>
                          </>
                        )}
                        
                        {ad.status === 'approved' && (
                          <button 
                            onClick={() => viewAdStats(ad)}
                            className="action-btn stats"
                          >
                            📊 Statistika
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deleteAd(ad)}
                          className="action-btn danger"
                        >
                          🗑️ O'chirish
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">📢</div>
                  <p>Hech qanday reklama topilmadi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BANNERLAR TAB */}
        {activeTab === 'banners' && (
          <div className="admin-section">
            <div className="section-header">
              <div>
                <h2>🎯 Asosiy Sahifa Bannerlari ({filteredBanners.length})</h2>
                <div className="banner-stats-small">
                  <span>Faol: {bannerStats.activeBanners}</span>
                  <span>Jami bosishlar: {bannerStats.totalClicks}</span>
                  <span>Eng ko'p bosilgan: {bannerStats.mostClicked?.title || 'Yo\'q'}</span>
                </div>
              </div>
              <div className="banner-header-actions">
                <input 
                  type="text" 
                  placeholder="Banner qidirish..." 
                  value={bannerSearch}
                  onChange={(e) => setBannerSearch(e.target.value)}
                  className="search-input"
                />
                <button 
                  onClick={exportBanners}
                  className="export-btn"
                >
                  📥 Export JSON
                </button>
                <label className="import-btn">
                  📤 Import JSON
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={importBanners}
                    style={{ display: 'none' }}
                  />
                </label>
                <button 
                  onClick={() => setShowAddBanner(true)}
                  className="add-btn primary"
                >
                  ➕ Yangi banner
                </button>
              </div>
            </div>

            {/* Banner filter tabs */}
            <div className="banner-tabs">
              <button 
                className={`banner-tab-btn ${bannerTab === 'all' ? 'active' : ''}`}
                onClick={() => setBannerTab('all')}
              >
                📋 Barchasi
              </button>
              <button 
                className={`banner-tab-btn ${bannerTab === 'active' ? 'active' : ''}`}
                onClick={() => setBannerTab('active')}
              >
                ✅ Faol
              </button>
              <button 
                className={`banner-tab-btn ${bannerTab === 'inactive' ? 'active' : ''}`}
                onClick={() => setBannerTab('inactive')}
              >
                ⭕ Nofaol
              </button>
              <button 
                className={`banner-tab-btn ${bannerTab === 'payment' ? 'active' : ''}`}
                onClick={() => setBannerTab('payment')}
              >
                💳 To'lov
              </button>
              <button 
                className={`banner-tab-btn ${bannerTab === 'promotion' ? 'active' : ''}`}
                onClick={() => setBannerTab('promotion')}
              >
                🎯 Aksiya
              </button>
              <button 
                className={`banner-tab-btn ${bannerTab === 'advertisement' ? 'active' : ''}`}
                onClick={() => setBannerTab('advertisement')}
              >
                📢 Reklama
              </button>
            </div>

            {/* Banner Statistics */}
            <div className="banner-statistics">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">{bannerStats.totalBanners}</div>
                    <div className="stat-label">Jami bannerlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-value">{bannerStats.activeBanners}</div>
                    <div className="stat-label">Faol bannerlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👆</div>
                  <div className="stat-content">
                    <div className="stat-value">{bannerStats.totalClicks}</div>
                    <div className="stat-label">Jami bosishlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {bannerStats.mostClicked ? (bannerStats.mostClicked.clicks || 0) : 0}
                    </div>
                    <div className="stat-label">Eng ko'p bosilgan</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🖼️</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {banners.filter(b => b.customImage).length}
                    </div>
                    <div className="stat-label">Maxsus rasmlar</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Banners Grid */}
            <div className="banners-grid">
              {filteredBanners.length > 0 ? (
                filteredBanners.map(banner => (
                  <div key={banner.id} className="banner-admin-card">
                    <div className="banner-preview">
                      <div 
                        className="banner-image-preview"
                        style={{ background: banner.backgroundColor }}
                      >
                        <img 
                          src={banner.image} 
                          alt={banner.title}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        {!banner.customImage && (
                          <div className="default-image-badge">
                            Standart
                          </div>
                        )}
                      </div>
                      <div className="banner-info">
                        <div className="banner-header">
                          <div>
                            <h4>{banner.title}</h4>
                            <div className="banner-meta-small">
                              <span className={`banner-status ${banner.active ? 'active' : 'inactive'}`}>
                                {banner.active ? '✅ Faol' : '❌ Nofaol'}
                              </span>
                              <span className={`banner-type ${banner.type}`}>
                                {banner.type === 'payment' ? '💳 To\'lov' : 
                                 banner.type === 'promotion' ? '🎯 Aksiya' : '📢 Reklama'}
                              </span>
                              <span className="banner-order">
                                #{banner.order}
                              </span>
                              <span className="banner-clicks">
                                👆 {banner.clicks || 0}
                              </span>
                              {banner.customImage && (
                                <span className="custom-image-badge">
                                  🖼️ Maxsus
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="banner-order-controls">
                            <button 
                              onClick={() => moveBannerUp(banner.id)}
                              className="order-btn"
                              disabled={banner.order === 1}
                              title="Yuqoriga ko'tarish"
                            >
                              ↑
                            </button>
                            <button 
                              onClick={() => moveBannerDown(banner.id)}
                              className="order-btn"
                              disabled={banner.order === banners.length}
                              title="Pastga tushirish"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                        <p className="banner-description">{banner.description}</p>
                        <div className="banner-details">
                          {banner.link && (
                            <div className="banner-link">
                              <strong>Havola:</strong> 
                              {banner.link.length > 50 ? banner.link.substring(0, 50) + "..." : banner.link}
                            </div>
                          )}
                          <div className="banner-dates">
                            <small>
                              Yaratilgan: {new Date(banner.createdAt).toLocaleDateString('uz-UZ')}
                            </small>
                            {banner.updatedAt && (
                              <small>
                                Yangilangan: {new Date(banner.updatedAt).toLocaleDateString('uz-UZ')}
                              </small>
                            )}
                          </div>
                          <div className="banner-button-preview">
                            <button 
                              className="preview-btn"
                              style={{ 
                                background: 'rgba(255,255,255,0.2)',
                                color: banner.textColor,
                                border: `1px solid ${banner.textColor}`
                              }}
                            >
                              {banner.buttonText}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="banner-actions">
                      <button 
                        onClick={() => toggleBannerStatus(banner.id)}
                        className={`action-btn ${banner.active ? 'warning' : 'success'}`}
                      >
                        {banner.active ? '❌ Faolsizlantirish' : '✅ Faollashtirish'}
                      </button>
                      <button 
                        onClick={() => startEditBanner(banner)}
                        className="action-btn edit"
                      >
                        ✏️ Tahrirlash
                      </button>
                      <button 
                        onClick={() => duplicateBanner(banner)}
                        className="action-btn duplicate"
                      >
                        📋 Nusxalash
                      </button>
                      <button 
                        onClick={() => confirmDeleteBanner(banner.id)}
                        className="action-btn danger"
                      >
                        🗑️ O'chirish
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">🎯</div>
                  <p>Hech qanday banner topilmadi</p>
                  <button 
                    onClick={() => setShowAddBanner(true)}
                    className="add-btn primary"
                  >
                    Birinchi bannerni qo'shing
                  </button>
                </div>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="confirm-modal-overlay">
                <div className="confirm-modal">
                  <div className="confirm-modal-header">
                    <h3>🗑️ Bannerni o'chirish</h3>
                  </div>
                  <div className="confirm-modal-body">
                    <p>Bu bannerni o'chirishni istaysizmi?</p>
                    <p className="warning-text">
                      Bu amalni bekor qilib bo'lmaydi!
                    </p>
                  </div>
                  <div className="confirm-modal-footer">
                    <button 
                      onClick={() => deleteBanner(showDeleteConfirm)}
                      className="confirm-btn danger"
                    >
                      Ha, o'chirish
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(null)}
                      className="confirm-btn secondary"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Details Modal (qisqartirilgan) */}
        {showAdModal && selectedAd && (
          <div className="modal">
            {/* ... ad modal kodi ... */}
          </div>
        )}

        {/* Ad Stats Modal (qisqartirilgan) */}
        {showAdStats && adStats && (
          <div className="modal">
            {/* ... stats modal kodi ... */}
          </div>
        )}

        {/* Add Banner Modal */}
        {showAddBanner && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => {
              setShowAddBanner(false);
              setNewBanner({
                title: '',
                description: '',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                link: '',
                active: true,
                type: 'payment',
                buttonText: 'To\'lash',
                backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textColor: '#ffffff',
                customImage: false
              });
            }}></div>
            <div className="modal-content banner-modal">
              {/* ... add banner modal kodi ... */}
            </div>
          </div>
        )}

        {/* Edit Banner Modal */}
        {showEditBanner && (
          <div className="modal">
            <div className="modal-overlay" onClick={() => {
              setShowEditBanner(false);
              setEditingBanner(null);
              setNewBanner({
                title: '',
                description: '',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                link: '',
                active: true,
                type: 'payment',
                buttonText: 'To\'lash',
                backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textColor: '#ffffff',
                customImage: false
              });
            }}></div>
            <div className="modal-content banner-modal">
              {/* ... edit banner modal kodi ... */}
            </div>
          </div>
        )}

        {/* CHART TAB */}
        {activeTab === 'chart' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>📊 Statistika</h2>
            </div>
            
            <div className="charts-grid">
              <div className="chart-container">
                <h3>📈 Reklamalar soni (oxirgi 7 kun)</h3>
                <Bar 
                  data={getAdsChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    }
                  }}
                />
              </div>
              
              <div className="chart-container">
                <h3>📊 Banner bosilishlari</h3>
                <Pie 
                  data={getBannerStatsData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="revenue-stats">
              <h3>💰 Daromad statistikasi</h3>
              <div className="revenue-grid">
                <div className="revenue-card">
                  <div className="revenue-icon">💰</div>
                  <div className="revenue-content">
                    <div className="revenue-value">{totalRevenue.toLocaleString()} so'm</div>
                    <div className="revenue-label">Jami daromad</div>
                  </div>
                </div>
                <div className="revenue-card">
                  <div className="revenue-icon">📅</div>
                  <div className="revenue-content">
                    <div className="revenue-value">{adsToday}</div>
                    <div className="revenue-label">Bugungi reklamalar</div>
                  </div>
                </div>
                <div className="revenue-card">
                  <div className="revenue-icon">✅</div>
                  <div className="revenue-content">
                    <div className="revenue-value">{activeAds}</div>
                    <div className="revenue-label">Faol reklamalar</div>
                  </div>
                </div>
                <div className="revenue-card">
                  <div className="revenue-icon">🎯</div>
                  <div className="revenue-content">
                    <div className="revenue-value">{bannerStats.totalClicks}</div>
                    <div className="revenue-label">Banner bosishlari</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;