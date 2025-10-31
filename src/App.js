// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Hello from './components/Hello';
import MainMenu from './components/MainMenu';
import BuyCard from './components/BuyCard';
import Marketplace from './components/Marketplace';
import History from './components/History';
import Transfer from './components/Transfer';
import BannerTransfer from './components/BannerTransfer';
import Profile from './components/Profile';
import Cards from './components/Cards';
import AdminPanel from './components/AdminPanel';
import ShopDetail from './components/ShopDetail'; // YANGI
import BottomNav from './components/BottomNav';
import './styles/App.css';

const BottomNavWrapper = ({ isAuthenticated, isAdmin }) => {
  const location = useLocation();

  const userPages = [
    '/main', '/marketplace', '/buy-card', '/cards',
    '/profile', '/transfer', '/banner-transfer', '/history'
  ];

  const isUserPage = userPages.some(page => location.pathname.startsWith(page)) ||
                     /^\/shop\/\d+$/.test(location.pathname);

  return isAuthenticated && !isAdmin && isUserPage ? <BottomNav /> : null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const usersData = JSON.parse(localStorage.getItem('allUsers') || '[]');
    setAllUsers(usersData);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setIsAuthenticated(true);
      setIsAdmin(parsed.login === 'sodiqjon');
    }
    setIsLoading(false);
  }, []);

  const generateToken = () =>
    'token_' + Math.random().toString(36).substr(2, 9) + Date.now();

  const handleLogin = (data) => {
    if (data.token) {
      const found = allUsers.find((u) => u.token === data.token);
      if (found) {
        localStorage.setItem('user', JSON.stringify(found));
        setUser(found);
        setIsAuthenticated(true);
        setIsAdmin(false);
        navigate('/main');
        return;
      } else {
        alert('Noto‘g‘ri token!');
        return;
      }
    }

    if (data.login === 'sodiqjon' && data.password === 'sodiqjon123') {
      const admin = {
        login: 'sodiqjon',
        balance: 999999,
        cards: [],
        history: [],
        profile: { name: 'Admin', phone: '', email: '', avatar: '' },
        token: 'admin_token_999',
      };
      localStorage.setItem('user', JSON.stringify(admin));
      setUser(admin);
      setIsAuthenticated(true);
      setIsAdmin(true);
      navigate('/admin');
      return;
    }

    const newUser = {
      login: data.login,
      balance: 500,
      cards: [],
      history: [],
      profile: {
        name: data.profile.name,
        phone: data.profile.phone,
        email: '',
        avatar: ''
      },
      token: generateToken(),
    };

    const updatedUsers = [
      ...allUsers.filter((u) => u.login !== data.login),
      newUser,
    ];

    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('user', JSON.stringify(newUser));
    setAllUsers(updatedUsers);
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAdmin(false);
    navigate('/hello');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/');
  };

  const updateUser = (updated) => {
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    const updatedAll = allUsers.map((u) =>
      u.login === updated.login ? updated : u
    );
    localStorage.setItem('allUsers', JSON.stringify(updatedAll));
    setAllUsers(updatedAll);
  };

  useEffect(() => {
    const handleTokenPaste = (e) => {
      if (e.ctrlKey && e.altKey && e.key === 'e') {
        e.preventDefault();
        navigator.clipboard
          .readText()
          .then((text) => {
            const token = text.trim();
            if (token.startsWith('token_')) {
              handleLogin({ token });
            } else {
              alert('Noto‘g‘ri token!');
            }
          })
          .catch(() => alert('Tokenni o‘qishda xato'));
      }
    };
    window.addEventListener('keydown', handleTokenPaste);
    return () => window.removeEventListener('keydown', handleTokenPaste);
  }, [allUsers]);

  if (isLoading) return <div className="loading">Yuklanmoqda...</div>;

  return (
    <div className="App">
      <Routes>
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
        <Route
          path="/hello"
          element={
            isAuthenticated && !isAdmin ? <Hello /> : <Navigate to="/" />
          }
        />
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
        <Route
          path="/shop/:id"
          element={
            isAuthenticated && !isAdmin ? (
              <ShopDetail user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/buy-card"
          element={
            isAuthenticated && !isAdmin ? (
              <BuyCard user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/marketplace"
          element={
            isAuthenticated && !isAdmin ? (
              <Marketplace user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/history"
          element={
            isAuthenticated && !isAdmin ? (
              <History user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/transfer"
          element={
            isAuthenticated && !isAdmin ? (
              <Transfer user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/banner-transfer"
          element={
            isAuthenticated && !isAdmin ? (
              <BannerTransfer user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/cards"
          element={
            isAuthenticated && !isAdmin ? (
              <Cards user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated && !isAdmin ? (
              <Profile
                user={user}
                updateUser={updateUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNavWrapper isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}