import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainMenu.css";
import {
  RiWallet3Line,
  RiSearchLine,
  RiSendPlaneLine,
  RiAddCircleLine,
  RiGiftLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiArrowLeftLine,
  RiVipCrownLine,
  RiShoppingBagLine,
  RiCoinLine,
  RiArrowRightLine,
  RiBankCardLine,
  RiMoneyDollarCircleLine,
  RiSmartphoneLine,
  RiBankLine,
  RiImageLine,
  RiEyeLine,
  RiExternalLinkLine
} from "react-icons/ri";
import {
  MdCampaign,
  MdArrowForward
} from "react-icons/md";
import Logo from "../assets/images/logo.png";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  // ==================== STATES ====================
  const [allUsers, setAllUsers] = useState([]);
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Token yuborish
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [cardSearch, setCardSearch] = useState("");
  const [filteredSendUsers, setFilteredSendUsers] = useState([]);
  
  // To'lov
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Balans to'ldirish
  const [topupStep, setTopupStep] = useState(1);
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedTopupAmount, setSelectedTopupAmount] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  
  // Asosiy sahifa bannerlari
  const [mainBanners, setMainBanners] = useState([]);
  const [activeBanners, setActiveBanners] = useState([]);
  
  // Alert
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
    title: "",
    action: null,
    actionText: "",
  });

  // Kartalar state
  const [userCards, setUserCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // ==================== ASOSIY BANNERLARNI YUKLASH ====================
  useEffect(() => {
    const loadBanners = () => {
      try {
        const stored = localStorage.getItem('mainPageBanners');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Faol bannerlarni filterlash
            const active = parsed.filter(banner => banner.active);
            // Order bo'yicha sort
            const sorted = active.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            setMainBanners(parsed);
            setActiveBanners(sorted.slice(0, 3)); // Faqat 3ta banner ko'rsatamiz
          }
        } else {
          // Default bannerlar
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
              customImage: false
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
              customImage: false
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
              customImage: false
            }
          ];
          setMainBanners(defaultBanners);
          setActiveBanners(defaultBanners);
          localStorage.setItem('mainPageBanners', JSON.stringify(defaultBanners));
        }
      } catch (error) {
        console.error('Bannerlarni yuklashda xatolik:', error);
      }
    };

    loadBanners();
    // Har 60 soniyada yangilash
    const interval = setInterval(loadBanners, 60000);
    return () => clearInterval(interval);
  }, []);

  // ==================== ALERT FUNCTIONS ====================
  const showAlert = (msg, type = "success", title = "", action = null, btn = "OK") => {
    setAlert({ 
      show: true, 
      message: msg, 
      type, 
      title: title || (type === "success" ? "Muvaffaqiyatli" : type === "error" ? "Xato" : "Diqqat"), 
      action, 
      actionText: btn 
    });
  };

  const closeAlert = () => setAlert({ ...alert, show: false });

  const runAction = () => { 
    if (alert.action) {
      alert.action(); 
    }
    closeAlert(); 
  };

  // ==================== BANNER BOSILGANDA ====================
  const handleBannerClick = (banner) => {
    setSelectedBanner(banner);
    setShowBannerModal(true);
    
    // Banner bosilganlar statistikasini oshirish
    try {
      const stored = localStorage.getItem('mainPageBanners');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map(b => {
          if (b.id === banner.id) {
            return {
              ...b,
              clicks: (b.clicks || 0) + 1,
              lastClicked: Date.now()
            };
          }
          return b;
        });
        localStorage.setItem('mainPageBanners', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Banner statistikasini yangilashda xatolik:', error);
    }
  };

  // ==================== BANNER LINK OCHISH ====================
  const handleBannerLink = (e, banner) => {
    e.stopPropagation();
    
    if (banner.link) {
      if (banner.link.startsWith('http')) {
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(banner.link);
      }
      setShowBannerModal(false);
    }
  };

  // ==================== KARTALAR (12 va 16 raqam uchun) ====================
  const getUserCards = () => {
    if (!user?.cards || !Array.isArray(user.cards) || user.cards.length === 0) {
      return [];
    }

    const validCards = user.cards
      .filter(c => !c.deleted && (c.number || c.cardNumber))
      .map(card => {
        let raw = "";
        let holder = "";
        
        if (typeof card === "string") {
          raw = card;
          holder = user?.profile?.name || "Foydalanuvchi";
        } else if (typeof card === "object") {
          raw = card.number || card.cardNumber || "";
          holder = card.holder || user?.profile?.name || "Foydalanuvchi";
        }
        
        raw = raw.toString().replace(/\s/g, "");
        
        if (!raw || raw.length < 12) return null;
        
        if (raw.length === 12) {
          const formatted = raw.replace(/(\d{4})(\d{2})(\d{6})/, "$1 $2** ****");
          return {
            number: formatted,
            holder: holder,
            rawNumber: raw,
            is12Digit: true,
            cardObject: card
          };
        } else if (raw.length === 16) {
          const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
          return {
            number: formatted,
            holder: holder,
            rawNumber: raw,
            is12Digit: false,
            cardObject: card
          };
        } else {
          const last4 = raw.slice(-4);
          return {
            number: `**** **** **** ${last4}`,
            holder: holder,
            rawNumber: raw,
            is12Digit: false,
            cardObject: card
          };
        }
      })
      .filter(card => card !== null);

    return validCards;
  };

  // ==================== KARTA FORMATLASH FUNKSIYASI ====================
  const formatCardNumber = (card) => {
    if (!card) return "Karta";
    
    try {
      let raw = "";
      if (typeof card === "string") {
        raw = card;
      } else if (typeof card === "object") {
        raw = card.number || card.cardNumber || "";
      }
      
      raw = raw.toString().replace(/\s/g, "");
      
      if (!raw || raw.length < 4) return "Karta";
      
      if (raw.length === 12) {
        return raw.replace(/(\d{4})(\d{2})(\d{6})/, "$1 $2** ****");
      } else if (raw.length === 16) {
        return raw.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
      } else {
        const last4 = raw.slice(-4);
        return `**** **** **** ${last4}`;
      }
    } catch (error) {
      return "Karta";
    }
  };

  // ==================== KARTALARNI YUKLASH ====================
  useEffect(() => {
    const cards = getUserCards();
    setUserCards(cards);
    
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0]);
    } else if (selectedCard && cards.length > 0) {
      const stillExists = cards.some(card => card.rawNumber === selectedCard.rawNumber);
      if (!stillExists) {
        setSelectedCard(cards[0]);
      }
    }
  }, [user]);

  const goToCards = () => navigate("/cards");

  // ==================== FAQAT KARTA RAQAMI BO'YICHA QIDIRUV ====================
  useEffect(() => {
    if (!cardSearch.trim()) {
      setFilteredSendUsers([]);
      return;
    }

    const query = cardSearch.replace(/\s/g, "").toLowerCase();

    const filtered = allUsers.filter(u => {
      if (u.login === user?.login) return false;

      if (!u.cards || !Array.isArray(u.cards) || u.cards.length === 0) return false;

      return u.cards.some(card => {
        if (card.deleted) return false;
        
        let raw = "";
        if (typeof card === "string") {
          raw = card;
        } else if (typeof card === "object") {
          raw = card.number || card.cardNumber || "";
        }
        raw = raw.toString().replace(/\s/g, "");
        
        return raw.includes(query);
      });
    });

    setFilteredSendUsers(filtered);
  }, [cardSearch, allUsers, user?.login]);

  // ==================== ALL USERS YUKLASH ====================
  useEffect(() => {
    const loadUsers = () => {
      try {
        const storedUsers = localStorage.getItem("allUsers");
        if (storedUsers) {
          const parsedUsers = JSON.parse(storedUsers);
          if (Array.isArray(parsedUsers)) {
            setAllUsers(parsedUsers);
          }
        }
      } catch (error) {
        console.error("Foydalanuvchilarni yuklashda xatolik:", error);
        setAllUsers([]);
      }
    };

    loadUsers();
    const intervalId = setInterval(loadUsers, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // ==================== TOKEN MIQDORINI O'ZGARTIRISH ====================
  const handleTokenAmountChange = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (cleanValue.length <= 9) {
      setTokenAmount(cleanValue);
    }
  };

  // ==================== TOKEN YUBORISH ====================
  const handleSendTokens = () => {
    const cleanAmount = tokenAmount.replace(/[^0-9]/g, "");
    const amount = parseInt(cleanAmount, 10);
    
    if (!selectedUser) {
      return showAlert("Foydalanuvchi tanlanmadi!", "error", "Xato");
    }
    
    if (!selectedCard) {
      return showAlert("Yuboruvchi karta tanlanmadi!", "error", "Xato");
    }
    
    if (!amount || isNaN(amount) || amount < 100) {
      return showAlert("Token miqdorini kiriting! (min: 100)", "error", "Xato");
    }
    
    if (amount > user.balance) {
      return showAlert(
        `Balansingiz yetarli emas!\n\nSizda: ${user.balance.toLocaleString()} token\nKerak: ${amount.toLocaleString()} token`,
        "error",
        "Balans yetarli emas"
      );
    }
    
    const confirm = () => {
      setIsLoading(true);
      try {
        const currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        
        const updatedUsers = currentUsers.map(u => {
          if (u.login === user.login) {
            return {
              ...u,
              balance: u.balance - amount,
              history: [
                ...(u.history || []),
                {
                  id: Date.now(),
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `Token yuborildi → @${selectedUser.profile?.username || selectedUser.login}`,
                  amount: `-${amount.toLocaleString()} token`,
                  details: `Karta: ${selectedCard.number}`,
                  type: "sent",
                  toUser: selectedUser.login,
                  timestamp: Date.now()
                }
              ]
            };
          }
          
          if (u.login === selectedUser.login) {
            return {
              ...u,
              balance: (u.balance || 0) + amount,
              history: [
                ...(u.history || []),
                {
                  id: Date.now() + 1,
                  time: new Date().toLocaleString("uz-UZ"),
                  action: `Token qabul qilindi ← @${user.profile?.username || user.login}`,
                  amount: `+${amount.toLocaleString()} token`,
                  details: `Karta: ${selectedCard.number}`,
                  type: "received",
                  fromUser: user.login,
                  timestamp: Date.now()
                }
              ],
              messages: [
                ...(u.messages || []),
                {
                  id: Date.now(),
                  from: user.login,
                  to: u.login,
                  text: `Sizga ${amount.toLocaleString()} token yuborildi!\nYuboruvchi: @${user.profile?.username || user.login}\nKarta: ${selectedCard.number}`,
                  time: new Date().toLocaleString("uz-UZ"),
                  type: "token_transfer",
                  amount: amount,
                  read: false,
                  card: selectedCard.number,
                  timestamp: Date.now()
                }
              ]
            };
          }
          
          return u;
        });

        const updatedSender = updatedUsers.find(u => u.login === user.login);
        if (updatedSender) {
          localStorage.setItem("userData", JSON.stringify(updatedSender));
          localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
          
          updateUser(updatedSender);
          setAllUsers(updatedUsers);
        }

        showAlert(
          `✅ Tokenlar muvaffaqiyatli yuborildi!\n\n` +
          `👤 Qabul qiluvchi: @${selectedUser.profile?.username || selectedUser.login}\n` +
          `💰 Miqdor: ${amount.toLocaleString()} token\n` +
          `💳 Karta: ${selectedCard.number}\n` +
          `📊 Yangi balans: ${(user.balance - amount).toLocaleString()} token`,
          "success",
          "Muvaffaqiyatli"
        );

        setShowSendTokens(false);
        setSelectedUser(null);
        setTokenAmount("");
        setCardSearch("");
        setSelectedCard(userCards[0] || null);
        
      } catch (error) {
        console.error("Token yuborishda xatolik:", error);
        showAlert(
          "Token yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
          "error",
          "Xato"
        );
      } finally {
        setIsLoading(false);
      }
    };

    showAlert(
      `Token yuborishni tasdiqlaysizmi?\n\n` +
      `👤 Qabul qiluvchi: @${selectedUser.profile?.username || selectedUser.login}\n` +
      `💰 Miqdor: ${amount.toLocaleString()} token\n` +
      `💳 Karta: ${selectedCard.number}\n` +
      `📊 Joriy balans: ${user.balance.toLocaleString()} token\n` +
      `📊 To'landan keyin: ${(user.balance - amount).toLocaleString()} token`,
      "info",
      "Tasdiqlash",
      confirm,
      "Yuborish"
    );
  };

  // ==================== TOKEN BILAN TO'LOV ====================
  const handleTokenPayment = (product) => {
    if (!product || !product.tokens) {
      return showAlert("Mahsulot ma'lumotlari noto'g'ri!", "error");
    }

    if (user.balance < product.tokens) {
      showAlert(
        `Balansingizda yetarli token mavjud emas!\n\nSizda: ${user.balance.toLocaleString()} token\nKerak: ${product.tokens.toLocaleString()} token`,
        "error",
        "Balans yetarli emas"
      );
      return;
    }

    const confirmPayment = () => {
      setIsLoading(true);
      try {
        const updatedUser = {
          ...user,
          balance: user.balance - product.tokens,
          history: [
            ...(user.history || []),
            {
              id: Date.now(),
              time: new Date().toLocaleString("uz-UZ"),
              action: `To'lov amalga oshirildi - ${product.name}`,
              amount: `-${product.tokens.toLocaleString()} token`,
              details: `Mahsulot: ${product.name}`,
              type: "purchase"
            }
          ]
        };

        const currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const updatedUsers = currentUsers.map(u => 
          u.login === user.login ? updatedUser : u
        );

        localStorage.setItem("userData", JSON.stringify(updatedUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        updateUser(updatedUser);
        
        showAlert(
          `✅ To'lov muvaffaqiyatli amalga oshirildi!\n\n` +
          `📦 Mahsulot: ${product.name}\n` +
          `💰 To'langan: ${product.tokens.toLocaleString()} token\n` +
          `📊 Yangi balans: ${updatedUser.balance.toLocaleString()} token`,
          "success",
          "Muvaffaqiyatli"
        );
        setShowPaymentModal(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error("To'lovda xatolik:", error);
        showAlert(
          "To'lov amalga oshirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
          "error",
          "Xato"
        );
      } finally {
        setIsLoading(false);
      }
    };

    showAlert(
      `${product.name} sotib olish uchun ${product.tokens.toLocaleString()} token to'lashingiz kerak.\n\n` +
      `📊 Joriy balans: ${user.balance.toLocaleString()} token\n` +
      `📊 To'landan keyin: ${(user.balance - product.tokens).toLocaleString()} token`,
      "info",
      "To'lovni tasdiqlash",
      confirmPayment,
      "Token bilan to'lash"
    );
  };

  // ==================== PREMIUM SOTIB OLISH ====================
  const handlePremiumPurchase = () => {
    if (user.isPremium) {
      return showAlert("Sizda allaqachon Premium obuna faol!", "info", "Diqqat");
    }

    const premiumPrice = 10000;
    
    if (user.balance < premiumPrice) {
      return showAlert(
        `Premium obuna uchun yetarli token mavjud emas!\n\nKerak: ${premiumPrice.toLocaleString()} token\nSizda: ${user.balance.toLocaleString()} token`,
        "error",
        "Balans yetarli emas"
      );
    }

    const confirmPurchase = () => {
      setIsLoading(true);
      try {
        const updatedUser = {
          ...user,
          balance: user.balance - premiumPrice,
          isPremium: true,
          premiumSince: new Date().toISOString(),
          history: [
            ...(user.history || []),
            {
              id: Date.now(),
              time: new Date().toLocaleString("uz-UZ"),
              action: "Premium obuna sotib olindi",
              amount: `-${premiumPrice.toLocaleString()} token`,
              type: "premium_purchase"
            }
          ]
        };

        const currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const updatedUsers = currentUsers.map(u => 
          u.login === user.login ? updatedUser : u
        );

        localStorage.setItem("userData", JSON.stringify(updatedUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        updateUser(updatedUser);
        
        setShowPremiumModal(false);
        showAlert(
          "🎉 Tabriklaymiz! Premium obuna muvaffaqiyatli faollashtirildi!\n\n" +
          "Siz endi barcha premium imkoniyatlardan foydalanish huquqiga egasiz!",
          "success",
          "Premium faollashtirildi"
        );
      } catch (error) {
        console.error("Premium sotib olishda xatolik:", error);
        showAlert(
          "Premium obunani faollashtirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
          "error",
          "Xato"
        );
      } finally {
        setIsLoading(false);
      }
    };

    showAlert(
      `Premium obuna sotib olishni tasdiqlaysizmi?\n\n` +
      `💰 Narxi: ${premiumPrice.toLocaleString()} token\n` +
      `📊 Joriy balans: ${user.balance.toLocaleString()} token\n` +
      `📊 To'landan keyin: ${(user.balance - premiumPrice).toLocaleString()} token`,
      "info",
      "Premium obunani tasdiqlash",
      confirmPurchase,
      "Sotib olish"
    );
  };

  // ==================== BALANS TO'LDIRISH FUNKSIYALARI ====================

  const handleTopupClick = () => {
    setShowTopupModal(true);
    setTopupStep(1);
    setTopupAmount("");
    setSelectedTopupAmount(null);
    setSelectedPaymentMethod(null);
    setCustomAmount("");
  };

  const handleAmountSelect = (amount, bonus = 0) => {
    setSelectedTopupAmount(amount);
    setTopupAmount(amount.toString());
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (cleanValue.length <= 9) {
      setCustomAmount(cleanValue);
      setSelectedTopupAmount(null);
      setTopupAmount(cleanValue);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleNextStep = () => {
    if (topupStep === 1) {
      if (!topupAmount || parseInt(topupAmount) < 1000) {
        showAlert("Minimum 1,000 token to'ldirish mumkin!", "error", "Xato");
        return;
      }
      setTopupStep(2);
    } else if (topupStep === 2) {
      if (!selectedPaymentMethod) {
        showAlert("To'lov usulini tanlang!", "error", "Xato");
        return;
      }
      setTopupStep(3);
    }
  };

  const handlePrevStep = () => {
    if (topupStep > 1) {
      setTopupStep(topupStep - 1);
    }
  };

  const handleConfirmTopup = () => {
    const amount = parseInt(topupAmount);
    
    if (!amount || amount < 1000) {
      showAlert("Minimum 1,000 token to'ldirish mumkin!", "error", "Xato");
      return;
    }

    if (!selectedPaymentMethod) {
      showAlert("To'lov usulini tanlang!", "error", "Xato");
      return;
    }

    const confirmTopup = () => {
      setIsLoading(true);
      try {
        const updatedUser = {
          ...user,
          balance: (user.balance || 0) + amount,
          history: [
            ...(user.history || []),
            {
              id: Date.now(),
              time: new Date().toLocaleString("uz-UZ"),
              action: `Balans to'ldirildi (${selectedPaymentMethod.name})`,
              amount: `+${amount.toLocaleString()} token`,
              details: `To'lov usuli: ${selectedPaymentMethod.name}`,
              type: "topup",
              paymentMethod: selectedPaymentMethod.id,
              timestamp: Date.now()
            }
          ]
        };

        const currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const updatedUsers = currentUsers.map(u => 
          u.login === user.login ? updatedUser : u
        );

        localStorage.setItem("userData", JSON.stringify(updatedUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        
        updateUser(updatedUser);
        setAllUsers(updatedUsers);

        showAlert(
          `✅ Balans muvaffaqiyatli to'ldirildi!\n\n` +
          `💰 Miqdor: ${amount.toLocaleString()} token\n` +
          `💳 To'lov usuli: ${selectedPaymentMethod.name}\n` +
          `📊 Yangi balans: ${updatedUser.balance.toLocaleString()} token\n` +
          `⏰ Vaqt: ${new Date().toLocaleString("uz-UZ")}`,
          "success",
          "Muvaffaqiyatli"
        );

        setShowTopupModal(false);
        setTopupStep(1);
        setTopupAmount("");
        setSelectedTopupAmount(null);
        setSelectedPaymentMethod(null);
        setCustomAmount("");
        
      } catch (error) {
        console.error("Balans to'ldirishda xatolik:", error);
        showAlert(
          "Balans to'ldirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
          "error",
          "Xato"
        );
      } finally {
        setIsLoading(false);
      }
    };

    showAlert(
      `Balans to'ldirishni tasdiqlaysizmi?\n\n` +
      `💰 Miqdor: ${amount.toLocaleString()} token\n` +
      `💳 To'lov usuli: ${selectedPaymentMethod.name}\n` +
      `📊 Joriy balans: ${user.balance.toLocaleString()} token\n` +
      `📊 To'ldirilgandan keyin: ${(user.balance + amount).toLocaleString()} token`,
      "info",
      "Balans to'ldirishni tasdiqlash",
      confirmTopup,
      "To'ldirish"
    );
  };

  const topupAmounts = [
    { value: 1000, bonus: 0, label: "1,000" },
    { value: 5000, bonus: 200, label: "5,000", bonusLabel: "+200 bonus" },
    { value: 10000, bonus: 500, label: "10,000", bonusLabel: "+500 bonus" },
    { value: 25000, bonus: 1500, label: "25,000", bonusLabel: "+1,500 bonus" },
    { value: 50000, bonus: 5000, label: "50,000", bonusLabel: "+5,000 bonus" },
    { value: 100000, bonus: 12000, label: "100,000", bonusLabel: "+12,000 bonus" },
  ];

  const paymentMethods = [
    { id: "uzcard", name: "Uzcard", icon: <RiBankCardLine />, desc: "Uzcard/Humo karta orqali" },
    { id: "payme", name: "Payme", icon: <RiMoneyDollarCircleLine />, desc: "Payme to'lov tizimi" },
    { id: "click", name: "Click", icon: <RiSmartphoneLine />, desc: "Click ilovasi orqali" },
    { id: "bank", name: "Bank o'tkazmasi", icon: <RiBankLine />, desc: "Bank hisob raqamiga" },
  ];

  // ==================== MAHSULOTLAR RO'YXATI ====================
  const products = [
    {
      id: 1,
      name: "Premium Kurs",
      description: "1 oylik premium kursga kirish",
      price: 50000,
      tokens: 50000,
      duration: "1 oy",
      features: ["Barcha darslarga kirish", "Premium kontent", "Qo'llab-quvvatlash"],
      category: "education",
      icon: "🎓"
    }
  ];

  const username = user?.profile?.username || "username";

  return (
    <div className="main-menu-container">

      {/* ALERT MODAL */}
      {alert.show && (
        <div className="menu-alert-modal-overlay" onClick={closeAlert}>
          <div className={`menu-alert-modal menu-alert-${alert.type}`} onClick={e => e.stopPropagation()}>
            <div className="menu-alert-header">
              {alert.type === "success" && <RiCheckLine className="menu-alert-header-icon" />}
              {alert.type === "error" && <RiErrorWarningLine className="menu-alert-header-icon" />}
              {alert.type === "info" && <RiInformationLine className="menu-alert-header-icon" />}
              <h3>{alert.title}</h3>
            </div>
            <div className="menu-alert-body">
              <p style={{ whiteSpace: "pre-line" }}>{alert.message}</p>
            </div>
            <div className="menu-alert-footer">
              {alert.action && (
                <button className="menu-alert-action-btn" onClick={runAction}>
                  {alert.actionText}
                </button>
              )}
              <button className="menu-alert-close-btn" onClick={closeAlert}>
                {alert.action ? "Bekor qilish" : "Yopish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="ultra-header">
        <div className="ultra-avatar" onClick={() => navigate("/profile")}>
          <img 
            src={user?.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
            alt="avatar" 
            onError={(e) => {
              e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
            }}
          />
        </div>
        <div className="ultra-username">@{username}</div>
        {user?.isPremium && (
          <div className="ultra-premium-badge">
            <RiVipCrownLine />
          </div>
        )}
      </div>

      {/* BALANS KARTASI */}
      <div className="ultra-card-wrapper" onClick={goToCards}>
        <div className="ultra-card">
          <div className="ultra-card-username">@{username}</div>
          <div className="ultra-card-balance">
            {(user?.balance || 0).toLocaleString()}
            <img src={Logo} alt="token" className="ultra-token-lg" />
          </div>
          <div className="ultra-card-number">
            {selectedCard?.number || (userCards.length > 0 ? userCards[0]?.number : "Karta qo'shing")}
          </div>
          {selectedCard?.is12Digit && (
            <div className="ultra-card-type">12-raqamli karta</div>
          )}
        </div>
      </div>

      {/* TEZ AMALLAR */}
      <div className="ultra-actions">
        <button 
          className="ultra-action" 
          onClick={() => setShowSendTokens(true)}
          disabled={userCards.length === 0}
        >
          <div className={`ultra-icon ${userCards.length === 0 ? 'disabled' : ''}`}>
            <RiSendPlaneLine size={32} />
          </div>
          <span>Token yuborish</span>
          {userCards.length === 0 && (
            <small style={{ fontSize: '11px', opacity: 0.8 }}>Karta kerak</small>
          )}
        </button>
        <button 
          className="ultra-action" 
          onClick={() => setShowPaymentModal(true)}
        >
          <div className="ultra-icon blue">
            <RiShoppingBagLine size={32} />
          </div>
          <span>To'lov qilish</span>
        </button>
        <button 
          className="ultra-action" 
          onClick={() => setShowPremiumModal(true)}
        >
          <div className="ultra-icon pink">
            <RiGiftLine size={32} />
          </div>
          <span>Premium</span>
          {user?.isPremium && (
            <small style={{ fontSize: '11px', opacity: 0.8 }}>Faol</small>
          )}
        </button>
      </div>

      {/* BALANS TO'LDIRISH SEKSIYASI */}
      <div className="balance-topup-section">
        <div className="balance-topup-title">
          <h4>Balans to'ldirish</h4>
          <RiCoinLine size={24} color="#FFD700" />
        </div>
        <div className="topup-methods">
          <div className="topup-method-card" onClick={handleTopupClick}>
            <div className="topup-method-icon">
              <RiBankCardLine size={24} />
            </div>
            <div className="topup-method-info">
              <div className="topup-method-name">Karta orqali to'ldirish</div>
              <div className="topup-method-desc">Uzcard, Humo, Visa, Mastercard</div>
            </div>
            <div className="topup-method-fee">1% komissiya</div>
          </div>
          
          <div className="topup-method-card" onClick={() => showAlert("Tez orada...", "info", "Diqqat")}>
            <div className="topup-method-icon">
              <RiSmartphoneLine size={24} />
            </div>
            <div className="topup-method-info">
              <div className="topup-method-name">Mobil to'lov</div>
              <div className="topup-method-desc">Payme, Click, Apelsin</div>
            </div>
            <div className="topup-method-fee">0.5% komissiya</div>
          </div>
        </div>
      </div>

      {/* ASOSIY REKLAMA BANNERLARI */}
      <div className="main-banners-section">
       
        
        <div className="main-banners-grid">
          {activeBanners.length > 0 ? (
            activeBanners.map((banner, index) => (
            <div className="banner-image">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
            ))
          ) : (
            <div className="no-banners-message">
              <MdCampaign size={48} />
              <p>Hozircha reklamalar yo'q</p>
              <small>Admin tomonidan bannerlar qo'shiladi</small>
            </div>
          )}
        </div>
      </div>

      {/* BANNER MODAL */}
      {showBannerModal && selectedBanner && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content banner-modal">
            <div className="menu-modal-header">
              <h3>Banner ma'lumotlari</h3>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => setShowBannerModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              <div 
                className="banner-modal-preview"
                style={{ background: selectedBanner.backgroundColor }}
              >
                <img 
                  src={selectedBanner.image} 
                  alt={selectedBanner.title}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w-800&q=80';
                  }}
                />
              </div>

              <div className="banner-modal-info">
                <div className="banner-modal-title-row">
                  <h2>{selectedBanner.title}</h2>
                  <div className="banner-modal-type">
                    {selectedBanner.type === 'payment' && '💳 To\'lov'}
                    {selectedBanner.type === 'promotion' && '🎯 Aksiya'}
                    {selectedBanner.type === 'advertisement' && '📢 Reklama'}
                  </div>
                </div>
                
                <p className="banner-modal-description">{selectedBanner.description}</p>
                
                <div className="banner-modal-stats">
                  <div className="stat-item">
                    <RiEyeLine size={16} />
                    <span>Ko'rishlar: {selectedBanner.clicks || 0}</span>
                  </div>
                  {selectedBanner.createdAt && (
                    <div className="stat-item">
                      <RiInformationLine size={16} />
                      <span>
                        {new Date(selectedBanner.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  )}
                </div>

                {selectedBanner.link && (
                  <div className="banner-modal-link-section">
                    <h4>Havola ma'lumotlari:</h4>
                    <div className="link-info">
                      {selectedBanner.link.startsWith('http') ? (
                        <a 
                          href={selectedBanner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="external-link"
                        >
                          <RiExternalLinkLine /> {selectedBanner.link}
                        </a>
                      ) : (
                        <div className="internal-link">
                          <RiArrowRightLine /> {selectedBanner.link}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="menu-modal-footer">
              <button
                className="menu-primary-btn"
                onClick={(e) => handleBannerLink(e, selectedBanner)}
              >
                {selectedBanner.buttonText}
              </button>
              <button 
                className="menu-secondary-btn" 
                onClick={() => setShowBannerModal(false)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN YUBORISH MODALI */}
      {showSendTokens && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-send-tokens-modal">
            <div className="menu-modal-header">
              <button 
                className="menu-back-btn" 
                onClick={() => setShowSendTokens(false)}
                disabled={isLoading}
              >
                <RiArrowLeftLine size={20} />
              </button>
              <div className="menu-send-tokens-title">
                <RiSendPlaneLine size={24} color="#0C73FE" />
                <h3>Token yuborish</h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => setShowSendTokens(false)}
                disabled={isLoading}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {/* Qidiruv seksiyasi */}
              <div className="menu-search-section">
                <div className={`menu-search-bar large card-search`}>
                  <RiSearchLine className="menu-search-icon" />
                  <input
                    type="text"
                    placeholder="Karta raqami bo'yicha qidirish..."
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {cardSearch && (
                  <div className="menu-search-results">
                    {filteredSendUsers.length > 0 ? (
                      <div className="menu-search-user-list scrollable">
                        {filteredSendUsers.map((u) => (
                          <div
                            key={u.login}
                            className="menu-search-user-item large"
                            onClick={() => {
                              setSelectedUser(u);
                              setCardSearch("");
                            }}
                          >
                            <div className="menu-search-user-avatar">
                              <img
                                src={u.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                alt="avatar"
                                onError={(e) => {
                                  e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                }}
                              />
                              {u.isPremium && <div className="menu-user-premium-indicator" />}
                            </div>
                            <div className="menu-search-user-info">
                              <div className="menu-search-username">
                                @{u.profile?.username || u.login}
                                {u.isPremium && (
                                  <span className="menu-premium-dot">PREMIUM</span>
                                )}
                              </div>
                              <div className="menu-search-name">
                                {u.profile?.name || "Foydalanuvchi"}
                              </div>
                              {u.cards && u.cards.length > 0 && (
                                <div className="menu-search-card">
                                  <RiBankCardLine size={12} />
                                  {formatCardNumber(u.cards[0])}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : cardSearch.length >= 4 ? (
                      <div className="menu-no-results">
                        <RiErrorWarningLine size={40} color="#95a5a6" />
                        <p>Foydalanuvchi topilmadi</p>
                        <small>Karta raqamini tekshirib ko'ring</small>
                      </div>
                    ) : (
                      <div className="menu-search-hint">
                        <RiInformationLine size={40} color="#95a5a6" />
                        <p>Karta raqami bo'yicha qidiring</p>
                        <small>Kamida 4 ta raqam kiriting</small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tanlangan foydalanuvchi */}
              {selectedUser && (
                <div className="selected-recipient-card">
                  <div className="recipient-avatar-large">
                    <img
                      src={selectedUser.profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt="avatar"
                      onError={(e) => {
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                      }}
                    />
                    {selectedUser.isPremium && (
                      <div className="premium-crown-large">
                        <RiVipCrownLine size={12} />
                      </div>
                    )}
                  </div>
                  <div className="recipient-info">
                    <h3>@{selectedUser.profile?.username || selectedUser.login}</h3>
                    <p>{selectedUser.profile?.name || "Foydalanuvchi"}</p>
                  </div>
                </div>
              )}

              {/* Karta tanlash */}
              <div className="menu-card-selection">
                <label>Yuboruvchi karta:</label>
                {userCards.length > 0 ? (
                  <div className="menu-card-options grid">
                    {userCards.map((card) => (
                      <div
                        key={card.rawNumber}
                        className={`menu-card-option large ${selectedCard?.rawNumber === card.rawNumber ? 'selected' : ''}`}
                        onClick={() => !isLoading && setSelectedCard(card)}
                      >
                        <div className="card-icon">
                          <RiBankCardLine />
                        </div>
                        <div className="menu-card-number">{card.number}</div>
                        <div className="menu-card-holder">{card.holder}</div>
                        {card.is12Digit && (
                          <div className="card-12-indicator">12-raqamli</div>
                        )}
                        {selectedCard?.rawNumber === card.rawNumber && (
                          <div className="check-mark">
                            <RiCheckLine />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-card-message">
                    <RiErrorWarningLine size={24} />
                    <p>Karta topilmadi</p>
                    <small>Token yuborish uchun karta qo'shing</small>
                  </div>
                )}
              </div>

              {/* Token miqdori */}
              <div className="menu-token-input-section large">
                <label>Token miqdori:</label>
                <div className="menu-token-input-wrapper large">
                  <input
                    type="text"
                    value={tokenAmount}
                    onChange={(e) => handleTokenAmountChange(e.target.value)}
                    placeholder="Kiriting..."
                    disabled={isLoading}
                    className={parseInt(tokenAmount || 0) > user.balance ? 'error-input' : ''}
                  />
                  <div className="menu-token-symbol large">
                    <img src={Logo} alt="token" className="ultra-token-md" />
                    <span>token</span>
                  </div>
                </div>
                <div className="menu-balance-info large">
                  Joriy balans: <strong>{user.balance.toLocaleString()} token</strong>
                </div>
                {parseInt(tokenAmount || 0) > user.balance && (
                  <div className="error-message">
                    <RiErrorWarningLine />
                    Balansingizda yetarli token yo'q
                  </div>
                )}
              </div>
            </div>

            <div className="menu-modal-footer">
              <button
                className={`menu-primary-btn large ${!selectedUser || !selectedCard || !tokenAmount || parseInt(tokenAmount) < 100 || parseInt(tokenAmount) > user.balance || isLoading ? 'menu-btn-disabled' : ''}`}
                onClick={handleSendTokens}
                disabled={!selectedUser || !selectedCard || !tokenAmount || parseInt(tokenAmount) < 100 || parseInt(tokenAmount) > user.balance || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="btn-loading"></div>
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <RiSendPlaneLine size={20} />
                    Token yuborish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN BILAN TO'LOV MODALI */}
      {showPaymentModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content payment-modal">
            <div className="menu-modal-header">
              <div className="payment-modal-title">
                <RiShoppingBagLine size={24} color="#3498db" />
                <h3>Token bilan to'lov</h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => setShowPaymentModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {/* Balans ko'rsatish */}
              <div className="balance-info-section">
                <div className="balance-display">
                  <div className="balance-icon">
                    <RiWallet3Line />
                  </div>
                  <div className="balance-details">
                    <div className="balance-label">Joriy balans:</div>
                    <div className="balance-amount">
                      {user.balance.toLocaleString()} <img src={Logo} alt="token" className="ultra-token-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mahsulotlar */}
              <div className="products-section">
                <h4>Mavjud mahsulotlar</h4>
                <div className="products-grid">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="product-header">
                        <h4 className="product-name">{product.name}</h4>
                        <div className="product-price">
                          <RiCoinLine size={16} />
                          {product.tokens.toLocaleString()}
                        </div>
                      </div>
                      <p className="product-description">{product.description}</p>
                      <div className="product-duration">Davomiylik: {product.duration}</div>
                      <div className="product-features">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="product-feature">
                            <RiCheckLine size={14} color="#27ae60" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tanlangan mahsulot */}
              {selectedProduct && (
                <div className="selected-product-preview">
                  <h4>Tanlangan mahsulot:</h4>
                  <div className="selected-product-details">
                    <div className="selected-product-info">
                      <h5>{selectedProduct.name}</h5>
                      <p>{selectedProduct.description}</p>
                    </div>
                    <div className="selected-product-price">
                      <div className="token-price">
                        <RiCoinLine size={20} />
                        {selectedProduct.tokens.toLocaleString()} token
                      </div>
                      <div className={`balance-check ${user.balance >= selectedProduct.tokens ? 'sufficient-balance' : 'insufficient-balance'}`}>
                        {user.balance >= selectedProduct.tokens ? (
                          <>
                            <RiCheckLine size={16} />
                            Balansingiz yetarli
                          </>
                        ) : (
                          <>
                            <RiErrorWarningLine size={16} />
                            Balansingiz yetarli emas
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="menu-modal-footer">
              <button
                className={`menu-primary-btn ${!selectedProduct || user.balance < selectedProduct.tokens ? 'menu-btn-disabled' : ''}`}
                onClick={() => selectedProduct && handleTokenPayment(selectedProduct)}
                disabled={!selectedProduct || user.balance < selectedProduct.tokens}
              >
                <RiShoppingBagLine size={20} />
                Token bilan to'lash
              </button>
              <button 
                className="menu-secondary-btn" 
                onClick={() => setShowPaymentModal(false)}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALANS TO'LDIRISH MODALI */}
      {showTopupModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-send-tokens-modal">
            <div className="menu-modal-header">
              <button 
                className="menu-back-btn" 
                onClick={topupStep > 1 ? handlePrevStep : () => setShowTopupModal(false)}
                disabled={isLoading}
              >
                <RiArrowLeftLine size={20} />
              </button>
              <div className="menu-send-tokens-title">
                <RiCoinLine size={24} color="#FFD700" />
                <h3>
                  {topupStep === 1 && "Balans to'ldirish"}
                  {topupStep === 2 && "To'lov usuli"}
                  {topupStep === 3 && "Tasdiqlash"}
                </h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => setShowTopupModal(false)}
                disabled={isLoading}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {/* Qadamlar */}
              <div className="topup-steps">
                <div className={`topup-step ${topupStep >= 1 ? 'active' : ''} ${topupStep > 1 ? 'completed' : ''}`}>
                  {topupStep > 1 ? <RiCheckLine size={20} /> : '1'}
                </div>
                <div className={`topup-step ${topupStep >= 2 ? 'active' : ''} ${topupStep > 2 ? 'completed' : ''}`}>
                  {topupStep > 2 ? <RiCheckLine size={20} /> : '2'}
                </div>
                <div className={`topup-step ${topupStep >= 3 ? 'active' : ''}`}>3</div>
              </div>

              {/* 1-qadam: Miqdor tanlash */}
              {topupStep === 1 && (
                <>
                  <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Miqdor tanlang</h4>
                  <div className="topup-amount-grid">
                    {topupAmounts.map((item) => (
                      <div
                        key={item.value}
                        className={`topup-amount-option ${selectedTopupAmount === item.value ? 'selected' : ''}`}
                        onClick={() => handleAmountSelect(item.value, item.bonus)}
                      >
                        <div className="topup-amount-value">{item.label}</div>
                        {item.bonus > 0 && (
                          <div className="topup-amount-bonus">{item.bonusLabel}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Maxsus miqdor */}
                  <div className="custom-topup-input">
                    <label>Yoki maxsus miqdor kiriting:</label>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="Masalan: 15000"
                    />
                  </div>

                  {/* Ko'rish */}
                  {(selectedTopupAmount || customAmount) && (
                    <div className="topup-summary">
                      <div className="topup-summary-item">
                        <span>Asosiy miqdor:</span>
                        <span>{(parseInt(topupAmount) || 0).toLocaleString()} token</span>
                      </div>
                      {selectedTopupAmount && topupAmounts.find(a => a.value === selectedTopupAmount)?.bonus > 0 && (
                        <div className="topup-summary-item">
                          <span>Bonus:</span>
                          <span style={{ color: '#27ae60' }}>
                            +{topupAmounts.find(a => a.value === selectedTopupAmount)?.bonus.toLocaleString()} token
                          </span>
                        </div>
                      )}
                      <div className="topup-summary-item">
                        <span>Jami:</span>
                        <span style={{ fontWeight: 'bold' }}>
                          {(parseInt(topupAmount) + (selectedTopupAmount ? topupAmounts.find(a => a.value === selectedTopupAmount)?.bonus || 0 : 0)).toLocaleString()} token
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 2-qadam: To'lov usuli */}
              {topupStep === 2 && (
                <>
                  <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>To'lov usulini tanlang</h4>
                  <div className="payment-method-options">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`payment-method-card ${selectedPaymentMethod?.id === method.id ? 'selected' : ''}`}
                        onClick={() => handlePaymentMethodSelect(method)}
                      >
                        <div className="payment-method-icon">{method.icon}</div>
                        <div className="payment-method-info">
                          <div className="payment-method-name">{method.name}</div>
                          <div className="payment-method-desc">{method.desc}</div>
                        </div>
                        {selectedPaymentMethod?.id === method.id && (
                          <div className="payment-checkmark">
                            <RiCheckLine />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 3-qadam: Tasdiqlash */}
              {topupStep === 3 && selectedPaymentMethod && (
                <>
                  <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>To'lovni tasdiqlang</h4>
                  
                  <div className="topup-summary">
                    <div className="topup-summary-item">
                      <span>Miqdor:</span>
                      <span>{parseInt(topupAmount).toLocaleString()} token</span>
                    </div>
                    {selectedTopupAmount && topupAmounts.find(a => a.value === selectedTopupAmount)?.bonus > 0 && (
                      <div className="topup-summary-item">
                        <span>Bonus:</span>
                        <span style={{ color: '#27ae60' }}>
                          +{topupAmounts.find(a => a.value === selectedTopupAmount)?.bonus.toLocaleString()} token
                        </span>
                      </div>
                    )}
                    <div className="topup-summary-item">
                      <span>Komissiya:</span>
                      <span style={{ color: '#e74c3c' }}>
                        {Math.floor(parseInt(topupAmount) * 0.01).toLocaleString()} token (1%)
                      </span>
                    </div>
                    <div className="topup-summary-item">
                      <span>To'lov usuli:</span>
                      <span>{selectedPaymentMethod.name}</span>
                    </div>
                    <div className="topup-summary-item">
                      <span>Jami olinadi:</span>
                      <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '18px' }}>
                        {(parseInt(topupAmount) + (selectedTopupAmount ? topupAmounts.find(a => a.value === selectedTopupAmount)?.bonus || 0 : 0)).toLocaleString()} token
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', fontSize: '14px', color: '#666' }}>
                    <RiInformationLine style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    To'lov amalga oshirilgach, tokenlar darhol hisobingizga qo'shiladi.
                  </div>
                </>
              )}
            </div>

            <div className="menu-modal-footer">
              {topupStep < 3 ? (
                <button
                  className="menu-primary-btn"
                  onClick={handleNextStep}
                  disabled={
                    (topupStep === 1 && !topupAmount) ||
                    (topupStep === 2 && !selectedPaymentMethod) ||
                    isLoading
                  }
                >
                  {topupStep === 1 ? 'Keyingi' : 'Tasdiqlash'}
                  <RiArrowRightLine size={20} />
                </button>
              ) : (
                <button
                  className="menu-primary-btn"
                  onClick={handleConfirmTopup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="btn-loading"></div>
                      To'lanmoqda...
                    </>
                  ) : (
                    <>
                      <RiBankCardLine size={20} />
                      To'lovni amalga oshirish
                    </>
                  )}
                </button>
              )}
              
              <button 
                className="menu-secondary-btn" 
                onClick={topupStep > 1 ? handlePrevStep : () => setShowTopupModal(false)}
                disabled={isLoading}
              >
                {topupStep > 1 ? 'Orqaga' : 'Bekor qilish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showPremiumModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-premium-modal">
            <div className="menu-modal-header">
              <div className="menu-premium-modal-title">
                <RiVipCrownLine size={24} color="#FFD700" />
                <h3>Premium Obuna</h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => setShowPremiumModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {user.isPremium ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <RiVipCrownLine size={60} color="#FFD700" />
                  </div>
                  <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>🎉 Siz Premium foydalanuvchisisiz!</h3>
                  <p style={{ color: '#7f8c8d', lineHeight: '1.5' }}>
                    Premium obuna {user.premiumSince ? 
                      new Date(user.premiumSince).toLocaleDateString('uz-UZ') + " dan boshlab faol" : 
                      "faol holatda"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Premium afzalliklari */}
                  <div className="menu-premium-features-list">
                    <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>Premium imkoniyatlar:</h4>
                    <div className="menu-premium-feature-item">
                      <div className="menu-premium-feature-check">
                        <RiCheckLine />
                      </div>
                      <span>Cheksiz token yuborish</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <div className="menu-premium-feature-check">
                        <RiCheckLine />
                      </div>
                      <span>Maxsus karta dizaynlari</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <div className="menu-premium-feature-check">
                        <RiCheckLine />
                      </div>
                      <span>Premium mijozlar qo'llab-quvvatlash</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <div className="menu-premium-feature-check">
                        <RiCheckLine />
                      </div>
                      <span>Reklamalarsiz ishlash</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <div className="menu-premium-feature-check">
                        <RiCheckLine />
                      </div>
                      <span>Maxsus aksiyalar va chegirmalar</span>
                    </div>
                  </div>

                  {/* Narx */}
                  <div className="menu-premium-price-section">
                    <div className="menu-premium-price">10,000 token</div>
                    <div className="menu-premium-balance-info">
                      Joriy balans: {user.balance.toLocaleString()} token
                    </div>
                  </div>

                  {/* Balans yetarli emas xabari */}
                  {user.balance < 10000 && (
                    <div className="menu-insufficient-balance">
                      <RiErrorWarningLine size={20} style={{ marginRight: '8px' }} />
                      Premium obuna uchun balansingiz yetarli emas
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="menu-modal-footer">
              {!user.isPremium ? (
                <>
                  <button
                    className={`menu-primary-btn ${user.balance < 10000 ? 'menu-btn-disabled' : ''}`}
                    onClick={handlePremiumPurchase}
                    disabled={user.balance < 10000 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="btn-loading"></div>
                        Amalga oshirilmoqda...
                      </>
                    ) : (
                      <>
                        <RiVipCrownLine size={20} />
                        Premium sotib olish
                      </>
                    )}
                  </button>
                  <button 
                    className="menu-secondary-btn" 
                    onClick={() => setShowPremiumModal(false)}
                    disabled={isLoading}
                  >
                    Bekor qilish
                  </button>
                </>
              ) : (
                <button 
                  className="menu-primary-btn" 
                  onClick={() => setShowPremiumModal(false)}
                >
                  Tushunarli
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MainMenu;