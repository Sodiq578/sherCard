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
} from "react-icons/ri";
import Logo from "../assets/images/logo.png";

function MainMenu({ user, updateUser }) {
  const navigate = useNavigate();

  // ==================== STATES ====================
  const [allUsers, setAllUsers] = useState([]);
  const [showSendTokens, setShowSendTokens] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false); // <-- BALANS TO'LDIRISH MODALI
  const [isLoading, setIsLoading] = useState(false);
  
  // Token yuborish
  const [selectedUser, setSelectedUser] = useState(null);
  const [tokenAmount, setTokenAmount] = useState("");
  const [cardSearch, setCardSearch] = useState("");
  const [filteredSendUsers, setFilteredSendUsers] = useState([]);
  
  // To'lov
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Balans to'ldirish (YANGI STATE'LAR)
  const [topupStep, setTopupStep] = useState(1); // 1: amount, 2: method, 3: confirm
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedTopupAmount, setSelectedTopupAmount] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  
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

  // ==================== TOKEN YUBORISH (TO'G'IRLANGAN) ====================
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
        // 1. Avval current users olish
        const currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        
        // 2. Yangilangan foydalanuvchilar massivi yaratish
        const updatedUsers = currentUsers.map(u => {
          // Yuboruvchini yangilash
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
          
          // Qabul qiluvchini yangilash
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

        // 3. LocalStorage ga saqlash
        const updatedSender = updatedUsers.find(u => u.login === user.login);
        if (updatedSender) {
          localStorage.setItem("userData", JSON.stringify(updatedSender));
          localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
          
          // 4. Statelarni yangilash
          updateUser(updatedSender);
          setAllUsers(updatedUsers);
        }

        // Muvaffaqiyatli xabar
        showAlert(
          `✅ Tokenlar muvaffaqiyatli yuborildi!\n\n` +
          `👤 Qabul qiluvchi: @${selectedUser.profile?.username || selectedUser.login}\n` +
          `💰 Miqdor: ${amount.toLocaleString()} token\n` +
          `💳 Karta: ${selectedCard.number}\n` +
          `📊 Yangi balans: ${(user.balance - amount).toLocaleString()} token`,
          "success",
          "Muvaffaqiyatli"
        );

        // Holatlarni tozalash
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

    // Tasdiqlash xabari
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

        // Barcha foydalanuvchilarni yangilash
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

        // Barcha foydalanuvchilarni yangilash
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
        // 1. Yangilangan user yaratish
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

        // 2. Barcha foydalanuvchilarni yangilash
        const currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const updatedUsers = currentUsers.map(u => 
          u.login === user.login ? updatedUser : u
        );

        // 3. LocalStorage ga saqlash
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        
        // 4. Statelarni yangilash
        updateUser(updatedUser);
        setAllUsers(updatedUsers);

        // 5. Muvaffaqiyat xabarini ko'rsatish
        showAlert(
          `✅ Balans muvaffaqiyatli to'ldirildi!\n\n` +
          `💰 Miqdor: ${amount.toLocaleString()} token\n` +
          `💳 To'lov usuli: ${selectedPaymentMethod.name}\n` +
          `📊 Yangi balans: ${updatedUser.balance.toLocaleString()} token\n` +
          `⏰ Vaqt: ${new Date().toLocaleString("uz-UZ")}`,
          "success",
          "Muvaffaqiyatli"
        );

        // 6. Modalni yopish va statelarni tozalash
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

    // Tasdiqlash xabari
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

  // ==================== BANNERGA TEZKOR TO'LOV QILISH ====================
  const handleBannerPaymentClick = () => {
    setShowPaymentModal(true);
    // Agar mahsulot tanlanmagan bo'lsa, birinchi mahsulotni tanlash
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  };

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

      {/* BANNER CAROUSEL - TEZKOR TO'LOV */}
      <div className="asosiy-sahifa-reklama" onClick={handleBannerPaymentClick}>
        <div className="reklama-placeholder">
          <RiCoinLine size={24} />
          <span>Token bilan to'lash</span>
          <div className="banner-payment-indicator">
            <small>Bir bosishda to'lash imkoniyati</small>
            <RiArrowRightLine size={12} />
          </div>
        </div>
      </div>

      {/* TOKEN YUBORISH MODALI - FAQAT KARTA RAQAMI BO'YICHA */}
      {showSendTokens && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content menu-send-tokens-modal">
            <div className="menu-modal-header">
              <div className="menu-send-tokens-title">
                <button 
                  className="menu-back-btn" 
                  onClick={() => selectedUser ? setSelectedUser(null) : setShowSendTokens(false)}
                  disabled={isLoading}
                >
                  <RiArrowLeftLine />
                </button>
                <h3>{selectedUser ? `Token yuborish` : "Kimga yubormoqchisiz?"}</h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => {
                  if (!isLoading) {
                    setShowSendTokens(false);
                    setSelectedUser(null);
                    setTokenAmount("");
                    setCardSearch("");
                  }
                }}
                disabled={isLoading}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {!selectedUser ? (
                <>
                  {/* QIDIRUV – faqat karta raqami */}
                  <div className="menu-search-bar large card-search">
                    <RiWallet3Line className="menu-search-icon" />
                    <input
                      type="text"
                      placeholder="Qabul qiluvchi karta raqamini kiriting (masalan: 8600)"
                      value={cardSearch}
                      onChange={(e) => setCardSearch(e.target.value.replace(/[^0-9\s]/g, ""))}
                      autoFocus
                      maxLength="19"
                      disabled={isLoading}
                    />
                  </div>

                  {cardSearch && filteredSendUsers.length === 0 ? (
                    <div className="menu-no-results">
                      <RiErrorWarningLine size={40} />
                      <p>Ushbu karta raqamiga ega foydalanuvchi topilmadi</p>
                      <small>Karta raqamini to'g'ri kiriting (12 yoki 16 raqam)</small>
                    </div>
                  ) : filteredSendUsers.length > 0 ? (
                    <div className="menu-search-user-list scrollable">
                      {filteredSendUsers.map(u => {
                        // Tanlangan foydalanuvchining kartasini topish
                        const userCard = u.cards.find(c => {
                          if (!c || c.deleted) return false;
                          let raw = "";
                          if (typeof c === "string") {
                            raw = c;
                          } else if (typeof c === "object") {
                            raw = c.number || c.cardNumber || "";
                          }
                          raw = raw.toString().replace(/\s/g, "");
                          return raw.includes(cardSearch.replace(/\s/g, ""));
                        });

                        // Karta raqamini formatlash
                        const cardDisplay = formatCardNumber(userCard);
                        const rawCardNumber = userCard ? 
                          (typeof userCard === "string" ? userCard : (userCard.number || userCard.cardNumber || "")) : "";
                        const is12Digit = rawCardNumber.toString().replace(/\s/g, "").length === 12;

                        return (
                          <div 
                            key={u.login} 
                            className="menu-search-user-item large" 
                            onClick={() => !isLoading && setSelectedUser(u)}
                            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
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
                              <p className="menu-search-username">
                                @{u.profile?.username || u.login}
                                {u.isPremium && <span className="menu-premium-dot">Premium</span>}
                              </p>
                              <p className="menu-search-card">
                                <RiWallet3Line size={14} /> {cardDisplay}
                                {is12Digit && 
                                  <span className="card-12-badge">12 raqam</span>
                                }
                              </p>
                              <p className="menu-search-name">
                                {u.profile?.name || "Foydalanuvchi"} {u.profile?.surname || ""}
                              </p>
                            </div>
                            <RiArrowLeftLine style={{ 
                              transform: "rotate(180deg)", 
                              fontSize: 20, 
                              color: "#888",
                              opacity: isLoading ? 0.5 : 1 
                            }} />
                          </div>
                        );
                      })}
                    </div>
                  ) : cardSearch === "" && (
                    <div className="menu-search-hint">
                      <RiWallet3Line size={32} />
                      <p>Karta raqamini kiriting (masalan: 8600, 9860, 1234)</p>
                      <small>12 yoki 16 raqamli kartalar qabul qilinadi</small>
                    </div>
                  )}
                </>
              ) : (
                /* 2-bosqich – karta tanlash va miqdor */
                <>
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
                          <RiVipCrownLine />
                        </div>
                      )}
                    </div>
                    <div className="recipient-info">
                      <h3>@{selectedUser.profile?.username || selectedUser.login}</h3>
                      <p>
                        {selectedUser.profile?.name || "Foydalanuvchi"} {selectedUser.profile?.surname || ""}
                      </p>
                    </div>
                  </div>

                  {/* Yuboruvchi karta */}
                  <div className="menu-card-selection">
                    <label>Yuboruvchi karta</label>
                    {userCards.length > 0 ? (
                      <div className="menu-card-options grid">
                        {userCards.map((card, i) => (
                          <div
                            key={i}
                            className={`menu-card-option large ${selectedCard?.rawNumber === card.rawNumber ? "selected" : ""}`}
                            onClick={() => !isLoading && setSelectedCard(card)}
                            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                          >
                            <div className="card-icon">
                              <RiWallet3Line />
                            </div>
                            <div className="menu-card-number">
                              {card.number}
                            </div>
                            <div className="menu-card-holder">
                              {card.holder}
                            </div>
                            {card.is12Digit && (
                              <div className="card-12-indicator">12 raqam</div>
                            )}
                            {selectedCard?.rawNumber === card.rawNumber && (
                              <RiCheckLine className="check-mark" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-card-warning">
                        <RiErrorWarningLine size={36} />
                        <p>Karta topilmadi</p>
                        <button 
                          className="menu-primary-btn" 
                          onClick={goToCards}
                          disabled={isLoading}
                        >
                          <RiAddCircleLine /> Karta qo'shish
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Token miqdori */}
                  {userCards.length > 0 && (
                    <div className="menu-token-input-section large">
                      <label>Token miqdori (min: 100)</label>
                      <div className="menu-token-input-wrapper large">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="100"
                          value={tokenAmount}
                          onChange={(e) => handleTokenAmountChange(e.target.value)}
                          min="100"
                          max={user.balance}
                          disabled={isLoading}
                          className={tokenAmount && parseInt(tokenAmount) > user.balance ? "error-input" : ""}
                        />
                        <span className="menu-token-symbol large">
                          <img src={Logo} alt="token" className="ultra-token-md" />
                        </span>
                      </div>
                      <div className="menu-balance-info large">
                        Joriy balans: <strong>{user.balance.toLocaleString()} token</strong>
                      </div>
                      {tokenAmount && parseInt(tokenAmount) >= 100 && (
                        <div className="menu-amount-preview large">
                          <div>
                            Yuboriladi: <strong>{parseInt(tokenAmount).toLocaleString()} token</strong>
                          </div>
                          <div>
                            Qoladi: 
                            <strong style={{ 
                              color: user.balance - parseInt(tokenAmount) < 0 ? "#e74c3c" : "#27ae60",
                              marginLeft: "5px"
                            }}>
                              {(user.balance - parseInt(tokenAmount)).toLocaleString()} token
                            </strong>
                          </div>
                          {user.balance - parseInt(tokenAmount) < 0 && (
                            <div className="error-message">
                              <RiErrorWarningLine />
                              Balans yetarli emas!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* FOOTER */}
            {selectedUser && userCards.length > 0 && (
              <div className="menu-modal-footer">
                <button
                  className={`menu-primary-btn large ${isLoading ? 'btn-loading' : ''}`}
                  onClick={handleSendTokens}
                  disabled={
                    isLoading || 
                    !tokenAmount || 
                    parseInt(tokenAmount) < 100 || 
                    parseInt(tokenAmount) > user.balance
                  }
                >
                  {isLoading ? (
                    "Yuborilmoqda..."
                  ) : (
                    <>
                      <RiSendPlaneLine /> 
                      Yuborish — {tokenAmount ? parseInt(tokenAmount).toLocaleString() : 0} token
                    </>
                  )}
                </button>
                <button 
                  className="menu-secondary-btn" 
                  onClick={() => setSelectedUser(null)}
                  disabled={isLoading}
                >
                  Ortga
                </button>
              </div>
            )}

            {selectedUser && userCards.length === 0 && (
              <div className="menu-modal-footer no-card">
                <div className="no-card-message">
                  <RiErrorWarningLine />
                  <p>Token yuborish uchun karta kerak</p>
                </div>
                <button 
                  className="menu-primary-btn" 
                  onClick={goToCards}
                  disabled={isLoading}
                >
                  <RiAddCircleLine /> Karta qo'shish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOKEN BILAN TO'LOV MODALI */}
      {showPaymentModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content payment-modal">
            <div className="menu-modal-header">
              <div className="payment-modal-title">
                <RiCoinLine className="payment-icon" />
                <h3>Token bilan to'lash</h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => !isLoading && setShowPaymentModal(false)}
                disabled={isLoading}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {/* Balans ma'lumoti */}
              <div className="balance-info-section">
                <div className="balance-display">
                  <RiCoinLine className="balance-icon" />
                  <div className="balance-details">
                    <span className="balance-label">Joriy balans</span>
                    <span className="balance-amount">
                      {user?.balance?.toLocaleString() || 0} token
                    </span>
                  </div>
                </div>
              </div>

              {/* Mahsulotlar ro'yxati */}
              <div className="products-section">
                <h4>Mavjud mahsulotlar</h4>
                <div className="products-grid">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                      onClick={() => !isLoading && setSelectedProduct(product)}
                      style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="product-header">
                        <h5 className="product-name">
                          {product.icon} {product.name}
                        </h5>
                        <div className="product-price">
                          <RiCoinLine size={16} />
                          <span>{product.tokens.toLocaleString()} token</span>
                        </div>
                      </div>
                      <p className="product-description">{product.description}</p>
                      <div className="product-duration">
                        <span>Davomiylik: {product.duration}</span>
                      </div>
                      <div className="product-features">
                        {product.features.map((feature, index) => (
                          <div key={index} className="product-feature">
                            <RiCheckLine size={14} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tanlangan mahsulot ma'lumotlari */}
              {selectedProduct && (
                <div className="selected-product-preview">
                  <h4>Tanlangan mahsulot</h4>
                  <div className="selected-product-details">
                    <div className="selected-product-info">
                      <h5>{selectedProduct.icon} {selectedProduct.name}</h5>
                      <p>{selectedProduct.description}</p>
                    </div>
                    <div className="selected-product-price">
                      <div className="token-price">
                        <RiCoinLine size={20} />
                        <span>{selectedProduct.tokens.toLocaleString()} token</span>
                      </div>
                      <div className="balance-check">
                        {user.balance >= selectedProduct.tokens ? (
                          <div className="sufficient-balance">
                            <RiCheckLine size={16} />
                            <span>Balansingiz yetarli</span>
                          </div>
                        ) : (
                          <div className="insufficient-balance">
                            <RiErrorWarningLine size={16} />
                            <span>Balansingiz yetarli emas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="menu-modal-footer">
              <button
                className={`menu-primary-btn payment-btn ${isLoading ? 'btn-loading' : ''}`}
                onClick={() => selectedProduct && handleTokenPayment(selectedProduct)}
                disabled={isLoading || !selectedProduct || user.balance < selectedProduct.tokens}
              >
                {isLoading ? (
                  "To'lanmoqda..."
                ) : selectedProduct ? (
                  <>
                    <RiCoinLine size={18} />
                    To'lash ({selectedProduct.tokens.toLocaleString()} token)
                  </>
                ) : (
                  "Mahsulot tanlang"
                )}
              </button>
              <button 
                className="menu-secondary-btn" 
                onClick={() => !isLoading && setShowPaymentModal(false)}
                disabled={isLoading}
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
              <div className="menu-send-tokens-title">
                <button 
                  className="menu-back-btn" 
                  onClick={topupStep === 1 ? () => setShowTopupModal(false) : handlePrevStep}
                  disabled={isLoading}
                >
                  <RiArrowLeftLine />
                </button>
                <h3>
                  {topupStep === 1 && "Token miqdorini tanlang"}
                  {topupStep === 2 && "To'lov usulini tanlang"}
                  {topupStep === 3 && "To'lovni tasdiqlash"}
                </h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => !isLoading && setShowTopupModal(false)}
                disabled={isLoading}
              >
                <RiCloseLine />
              </button>
            </div>

            <div className="menu-modal-body">
              {/* Step Indicator */}
              <div className="topup-steps">
                <div className={`topup-step ${topupStep >= 1 ? 'active' : ''} ${topupStep > 1 ? 'completed' : ''}`}>
                  {topupStep > 1 ? <RiCheckLine size={16} /> : "1"}
                </div>
                <div className={`topup-step ${topupStep >= 2 ? 'active' : ''} ${topupStep > 2 ? 'completed' : ''}`}>
                  {topupStep > 2 ? <RiCheckLine size={16} /> : "2"}
                </div>
                <div className={`topup-step ${topupStep >= 3 ? 'active' : ''}`}>3</div>
              </div>

              {/* Step 1: Amount Selection */}
              {topupStep === 1 && (
                <>
                  <div className="topup-amount-grid">
                    {topupAmounts.map((item) => (
                      <div
                        key={item.value}
                        className={`topup-amount-option ${
                          selectedTopupAmount === item.value ? 'selected' : ''
                        }`}
                        onClick={() => handleAmountSelect(item.value, item.bonus)}
                        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                      >
                        <div className="topup-amount-value">{item.label}</div>
                        <div className="topup-amount-bonus">{item.bonusLabel}</div>
                      </div>
                    ))}
                  </div>

                  <div className="custom-topup-input">
                    <label>Yoki o'zingiz miqdor kiriting:</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Masalan: 15000"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {topupAmount && (
                    <div className="topup-summary">
                      <div className="topup-summary-item">
                        <span>To'ldiriladi:</span>
                        <span>{parseInt(topupAmount).toLocaleString()} token</span>
                      </div>
                      <div className="topup-summary-item">
                        <span>Komissiya (1%):</span>
                        <span>{Math.round(parseInt(topupAmount) * 0.01).toLocaleString()} token</span>
                      </div>
                      <div className="topup-summary-item">
                        <span>Jami to'lov:</span>
                        <span>{Math.round(parseInt(topupAmount) * 1.01).toLocaleString()} token</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Payment Method */}
              {topupStep === 2 && (
                <div className="payment-method-options">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`payment-method-card ${
                        selectedPaymentMethod?.id === method.id ? 'selected' : ''
                      }`}
                      onClick={() => !isLoading && handlePaymentMethodSelect(method)}
                      style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="payment-method-icon">{method.icon}</div>
                      <div className="payment-method-info">
                        <div className="payment-method-name">{method.name}</div>
                        <div className="payment-method-desc">{method.desc}</div>
                      </div>
                      {selectedPaymentMethod?.id === method.id && (
                        <RiCheckLine className="payment-checkmark" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {topupStep === 3 && (
                <div className="selected-recipient-card">
                  <div className="topup-summary" style={{ width: '100%' }}>
                    <div className="topup-summary-item">
                      <span>Token miqdori:</span>
                      <span>{parseInt(topupAmount).toLocaleString()} token</span>
                    </div>
                    <div className="topup-summary-item">
                      <span>To'lov usuli:</span>
                      <span>{selectedPaymentMethod?.name}</span>
                    </div>
                    <div className="topup-summary-item">
                      <span>Komissiya (1%):</span>
                      <span>{Math.round(parseInt(topupAmount) * 0.01).toLocaleString()} token</span>
                    </div>
                    <div className="topup-summary-item">
                      <span>Jami to'lanadi:</span>
                      <span>{Math.round(parseInt(topupAmount) * 1.01).toLocaleString()} token</span>
                    </div>
                    <div className="topup-summary-item">
                      <span>Joriy balans:</span>
                      <span>{user.balance.toLocaleString()} token</span>
                    </div>
                    <div className="topup-summary-item">
                      <span>Yangi balans:</span>
                      <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                        {(user.balance + parseInt(topupAmount)).toLocaleString()} token
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="menu-modal-footer">
              {topupStep < 3 ? (
                <>
                  <button
                    className={`menu-primary-btn ${isLoading ? 'btn-loading' : ''}`}
                    onClick={handleNextStep}
                    disabled={isLoading || !topupAmount || parseInt(topupAmount) < 1000 || (topupStep === 2 && !selectedPaymentMethod)}
                  >
                    {isLoading ? "Yuklanmoqda..." : topupStep === 1 ? "Davom etish" : "Tasdiqlash"}
                  </button>
                  <button 
                    className="menu-secondary-btn" 
                    onClick={handlePrevStep}
                    disabled={isLoading || topupStep === 1}
                  >
                    Ortga
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`menu-primary-btn ${isLoading ? 'btn-loading' : ''}`}
                    onClick={handleConfirmTopup}
                    disabled={isLoading}
                  >
                    {isLoading ? "To'lanmoqda..." : "To'ldirish"}
                  </button>
                  <button 
                    className="menu-secondary-btn" 
                    onClick={handlePrevStep}
                    disabled={isLoading}
                  >
                    Ortga
                  </button>
                </>
              )}
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
                <RiVipCrownLine className="menu-premium-star-icon" />
                <h3>Premium Obuna</h3>
              </div>
              <button 
                className="menu-modal-close-btn" 
                onClick={() => !isLoading && setShowPremiumModal(false)}
                disabled={isLoading}
              >
                <RiCloseLine />
              </button>
            </div>
            <div className="menu-modal-body">
              {user.isPremium ? (
                <div className="menu-premium-price-section">
                  <div className="menu-premium-price" style={{ color: "#FFD700" }}>
                    Premium faol
                  </div>
                  <div className="menu-premium-balance-info">
                    Sizda Premium obuna faol
                  </div>
                  {user.premiumSince && (
                    <div style={{ 
                      marginTop: "15px", 
                      fontSize: "14px", 
                      color: "#7f8c8d" 
                    }}>
                      Faollashtirilgan: {new Date(user.premiumSince).toLocaleDateString("uz-UZ")}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="menu-premium-price-section">
                    <div className="menu-premium-price">10 000 token</div>
                    <div className="menu-premium-balance-info">
                      Joriy balans: {(user?.balance || 0).toLocaleString()} token
                    </div>
                    {user.balance < 10000 && (
                      <div className="menu-insufficient-balance">
                        Yetarli token mavjud emas!
                      </div>
                    )}
                  </div>
                  
                  <div className="menu-premium-features-list">
                    <div className="menu-premium-feature-item">
                      <RiCheckLine className="menu-premium-feature-check" />
                      <span>Barcha kurslarga cheksiz kirish</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <RiCheckLine className="menu-premium-feature-check" />
                      <span>Premium kontent va materiallar</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <RiCheckLine className="menu-premium-feature-check" />
                      <span>Shaxsiy mentorlik</span>
                    </div>
                    <div className="menu-premium-feature-item">
                      <RiCheckLine className="menu-premium-feature-check" />
                      <span>Maxsus imkoniyatlar</span>
                    </div>
                  </div>

                  <button
                    className={`menu-primary-btn ${user.balance < 10000 ? "menu-btn-disabled" : ""} ${isLoading ? 'btn-loading' : ''}`}
                    onClick={handlePremiumPurchase}
                    disabled={user.balance < 10000 || user.isPremium || isLoading}
                  >
                    {isLoading ? "Amalga oshirilmoqda..." : "Sotib olish"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MainMenu;