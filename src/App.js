import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MainMenu from './components/MainMenu';
import BuyCard from './components/BuyCard';
import Marketplace from './components/Marketplace';
import History from './components/History';
import Transfer from './components/Transfer';
import BannerTransfer from './components/BannerTransfer';
import Profile from './components/Profile';
import Cards from './components/Cards';
import AdminPanel from './components/AdminPanel';
import BottomNavbar from './components/BottomNav';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null); // boshlanishida null

  // 🔹 LocalStorage dan foydalanuvchini yuklash
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // 🔹 Login funksiyasi
  const handleLogin = (userData) => {
    // Admin foydalanuvchi
    if (userData.login === 'sodiqjon' && userData.password === 'sodiqjon123') {
      setIsAdmin(true);
      setIsAuthenticated(true);
      return;
    }

    // Oddiy foydalanuvchi
    const newUser = {
      login: userData.login,
      balance: 10000,
      cards: [],
      history: [],
      profile: {
        name: userData.login,
        phone: '',
        email: '',
      },
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAdmin(false);
  };

  // 🔹 Logout funksiyasi
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // 🔹 Foydalanuvchi ma’lumotlarini yangilash
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Agar user hali yuklanmagan bo‘lsa
  if (isAuthenticated && !user) {
    return <p className="loading-text">Yuklanmoqda...</p>;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Login sahifa */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/main" replace />
              )
            }
          />

          {/* Admin panel */}
          <Route
            path="/admin"
            element={
              isAuthenticated && isAdmin ? (
                <AdminPanel onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Asosiy foydalanuvchi sahifalari */}
          <Route
            path="/main"
            element={
              isAuthenticated && !isAdmin ? (
                <MainMenu
                  user={user}
                  onLogout={handleLogout}
                  updateUser={updateUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/buy-card"
            element={
              isAuthenticated && !isAdmin ? (
                <BuyCard user={user} updateUser={updateUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/marketplace"
            element={
              isAuthenticated && !isAdmin ? (
                <Marketplace user={user} updateUser={updateUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/history"
            element={
              isAuthenticated && !isAdmin ? (
                <History user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/transfer"
            element={
              isAuthenticated && !isAdmin ? (
                <Transfer user={user} updateUser={updateUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/banner-transfer"
            element={
              isAuthenticated && !isAdmin ? (
                <BannerTransfer user={user} updateUser={updateUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/profile"
            element={
              isAuthenticated && !isAdmin ? (
                <Profile user={user} updateUser={updateUser} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/cards"
            element={
              isAuthenticated && !isAdmin ? (
                <Cards user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>

        {/* 🔹 Pastki navigatsiya har doim ko‘rinsin */}
        {isAuthenticated && !isAdmin && <BottomNavbar />}
      </div>
    </BrowserRouter>
  );
}

export default App;
