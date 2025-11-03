// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// ==================== KOMPONENTLAR ====================
import Login from "./components/Login";
import Hello from "./components/Hello";
import MainMenu from "./components/MainMenu";
import BuyCard from "./components/BuyCard";
import Marketplace from "./components/Marketplace";
import History from "./components/History";
import Transfer from "./components/Transfer";
import BannerTransfer from "./components/BannerTransfer";
import Profile from "./components/Profile";
import Cards from "./components/Cards";
import AdminPanel from "./components/AdminPanel";
import ShopDetail from "./components/ShopDetail";
import Market from "./components/Market";
import BottomNav from "./components/BottomNav";

// CHAT
import ChatList from "./components/ChatList";
import ChatDetail from "./components/ChatDetail";

import "./styles/App.css";

// ==================== BOTTOM NAV WRAPPER ====================
// BottomNav faqat quyidagi sahifalarda ko‘rinsin
const BottomNavWrapper = ({ isAuthenticated, isAdmin }) => {
  const location = useLocation();

  const allowedPaths = [
    "/main",
    "/market",
    "/marketplace",
    "/buy-card",
    "/cards",
    "/profile",
    "/transfer",
    "/banner-transfer",
    "/history",
  ];

  const isShopPage = /^\/shop\/\d+$/.test(location.pathname);
  const isAllowedPage = allowedPaths.includes(location.pathname);

  const shouldShow = isAuthenticated && !isAdmin && (isAllowedPage || isShopPage);

  return shouldShow ? <BottomNav /> : null;
};

// ==================== ASOSIY APP ====================
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==================== localStorage dan yuklash ====================
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("userData") || "null");
      const storedUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");

      setAllUsers(storedUsers);

      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
        setIsAdmin(storedUser.login === "sodiqjon");
      }
    } catch (err) {
      console.error("localStorage o‘qishda xato:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==================== Token yaratish ====================
  const generateToken = () =>
    "token_" + Math.random().toString(36).substr(2, 9) + Date.now();

  // ==================== Username yaratish ====================
  const generateUsername = (name) => {
    const cleaned = name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    return cleaned + "_" + Math.floor(Math.random() * 1000);
  };

  // ==================== LOGIN ====================
  const handleLogin = (data) => {
    // 1. Token orqali
    if (data.token) {
      const found = allUsers.find((u) => u.token === data.token);
      if (found) {
        localStorage.setItem("userData", JSON.stringify(found));
        setUser(found);
        setIsAuthenticated(true);
        setIsAdmin(false);
        return "/main";
      } else {
        alert("Noto‘g‘ri token!");
        return null;
      }
    }

    // 2. Admin
    if (data.login === "sodiqjon" && data.password === "sodiqjon123") {
      const admin = {
        login: "sodiqjon",
        password: "sodiqjon123",
        balance: 999999,
        cards: [],
        history: [],
        messages: [],
        profile: {
          name: "Admin",
          phone: "",
          email: "admin@system.com",
          avatar: "",
          username: "admin_master",
        },
        token: "admin_token_999",
      };

      localStorage.setItem("userData", JSON.stringify(admin));
      setUser(admin);
      setIsAuthenticated(true);
      setIsAdmin(true);
      return "/admin";
    }

    // 3. Yangi foydalanuvchi
    const username = generateUsername(data.profile.name);
    const newUser = {
      login: data.login,
      password: data.password || "",
      balance: 10000,
      cards: [],
      history: [],
      messages: [],
      token: generateToken(),
      profile: {
        ...data.profile,
        username,
      },
    };

    const updatedAll = [
      ...allUsers.filter((u) => u.login !== data.login),
      newUser,
    ];

    localStorage.setItem("allUsers", JSON.stringify(updatedAll));
    localStorage.setItem("userData", JSON.stringify(newUser));
    setAllUsers(updatedAll);
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAdmin(false);
    return "/hello";
  };

  // ==================== LOGOUT ====================
  const handleLogout = () => {
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // ==================== Foydalanuvchi yangilash ====================
  const updateUser = (updated) => {
    localStorage.setItem("userData", JSON.stringify(updated));
    setUser(updated);

    const updatedAll = allUsers.map((u) =>
      u.login === updated.login ? updated : u
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedAll));
    setAllUsers(updatedAll);
  };

  // ==================== Ctrl + Alt + E → Token joylash ====================
  useEffect(() => {
    const handleTokenPaste = (e) => {
      if (e.ctrlKey && e.altKey && e.key === "e") {
        e.preventDefault();
        navigator.clipboard
          .readText()
          .then((text) => {
            const token = text.trim();
            if (token.startsWith("token_")) {
              const redirect = handleLogin({ token });
              if (redirect) {
                window.location.href = redirect;
              }
            } else {
              alert("Noto‘g‘ri token!");
            }
          })
          .catch(() => alert("Tokenni o‘qib bo‘lmadi!"));
      }
    };

    window.addEventListener("keydown", handleTokenPaste);
    return () => window.removeEventListener("keydown", handleTokenPaste);
  }, [allUsers]);

  // ==================== LOADING ====================
  if (isLoading) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  // ==================== ROUTES ====================
  return (
    <div className="App">
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : isAdmin ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/hello" />
            )
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ? (
              <AdminPanel
                onLogout={handleLogout}
                allUsers={allUsers}
                updateUser={updateUser}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* HELLO */}
        <Route
          path="/hello"
          element={isAuthenticated && !isAdmin ? <Hello /> : <Navigate to="/" />}
        />

        {/* MAIN MENU */}
        <Route
          path="/main"
          element={
            isAuthenticated && !isAdmin ? (
              <MainMenu user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* CHAT LIST */}
        <Route
          path="/chat"
          element={isAuthenticated && !isAdmin ? <ChatList /> : <Navigate to="/" />}
        />

        {/* CHAT DETAIL */}
        <Route
          path="/chat/:id"
          element={isAuthenticated && !isAdmin ? <ChatDetail /> : <Navigate to="/" />}
        />

        {/* MARKET */}
        <Route
          path="/market"
          element={isAuthenticated && !isAdmin ? <Market user={user} updateUser={updateUser} /> : <Navigate to="/" />}
        />

        {/* SHOP DETAIL */}
        <Route
          path="/shop/:id"
          element={isAuthenticated && !isAdmin ? <ShopDetail user={user} updateUser={updateUser} /> : <Navigate to="/" />}
        />

        {/* BUY CARD */}
        <Route
          path="/buy-card"
          element={isAuthenticated && !isAdmin ? <BuyCard user={user} updateUser={updateUser} /> : <Navigate to="/" />}
        />

        {/* MARKETPLACE */}
        <Route
          path="/marketplace"
          element={isAuthenticated && !isAdmin ? <Marketplace user={user} updateUser={updateUser} /> : <Navigate to="/" />}
        />

        {/* HISTORY */}
        <Route
          path="/history"
          element={isAuthenticated && !isAdmin ? <History user={user} /> : <Navigate to="/" />}
        />

        {/* TRANSFER */}
        <Route
          path="/transfer"
          element={isAuthenticated && !isAdmin ? <Transfer user={user} updateUser={updateUser} /> : <Navigate to="/" />}
        />

        {/* BANNER TRANSFER */}
        <Route
          path="/banner-transfer"
          element={isAuthenticated && !isAdmin ? <BannerTransfer user={user} updateUser={updateUser} /> : <Navigate to="/" />}
        />


<Route
  path="/cards"
  element={isAuthenticated && !isAdmin ? <Cards user={user} updateUser={updateUser} /> : <Navigate to="/" />}
/>
        {/* CARDS */}
        <Route
          path="/cards"
          element={isAuthenticated && !isAdmin ? <Cards user={user} /> : <Navigate to="/" />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            isAuthenticated && !isAdmin ? (
              <Profile user={user} updateUser={updateUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* BOTTOM NAV – faqat kerakli sahifalarda */}
      <BottomNavWrapper isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
    </div>
  );
}

// ==================== BROWSER ROUTER ====================
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}