import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminPanel.css';

function AdminPanel({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [marketCards, setMarketCards] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editBalance, setEditBalance] = useState(0);

  useEffect(() => {
    loadUsersData();
    loadMarketCards();
  }, []);

  const loadUsersData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUsers([JSON.parse(storedUser)]);
      setSelectedUser(JSON.parse(storedUser));
    }
  };

  const loadMarketCards = () => {
    const storedMarket = localStorage.getItem('marketCards');
    if (storedMarket) {
      setMarketCards(JSON.parse(storedMarket));
    }
  };

  const updateUserBalance = () => {
    if (selectedUser && editBalance >= 0) {
      const updatedUser = {
        ...selectedUser,
        balance: parseInt(editBalance)
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUsers([updatedUser]);
      setSelectedUser(updatedUser);
      alert('Balans yangilandi!');
    }
  };

  const deleteMarketCard = (cardId) => {
    const newMarketCards = marketCards.filter(card => card.id !== cardId);
    setMarketCards(newMarketCards);
    localStorage.setItem('marketCards', JSON.stringify(newMarketCards));
    alert('Karta o\'chirildi!');
  };

  const clearHistory = () => {
    if (selectedUser) {
      const updatedUser = {
        ...selectedUser,
        history: []
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUsers([updatedUser]);
      setSelectedUser(updatedUser);
      alert('Tarix tozalandi!');
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <button onClick={onLogout} className="logout-btn">Chiqish</button>
        </div>

        <div className="admin-sections">
          {/* Foydalanuvchi boshqaruvi */}
          <div className="admin-section">
            <h2>Foydalanuvchi Boshqaruvi</h2>
            {users.map(user => (
              <div key={user.login} className="user-card">
                <div className="user-info">
                  <h3>@{user.login}</h3>
                  <p>Balans: {user.balance} ball</p>
                  <p>Kartalar: {user.cards.length} ta</p>
                  <p>Tarix: {user.history.length} ta</p>
                </div>
                <div className="user-actions">
                  <input
                    type="number"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    placeholder="Yangi balans"
                    min="0"
                  />
                  <button onClick={updateUserBalance} className="action-btn primary">
                    Balansni yangilash
                  </button>
                  <button onClick={clearHistory} className="action-btn secondary">
                    Tarixni tozalash
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Market kartalari */}
          <div className="admin-section">
            <h2>Market Kartalari ({marketCards.length} ta)</h2>
            <div className="market-cards-list">
              {marketCards.map((card, index) => (
                <div key={index} className="market-card-admin">
                  <div className="card-info">
                    <strong>{card.id}</strong>
                    <p>Balans: {card.balance} ball</p>
                    <p>Sotuvchi: @{card.seller}</p>
                    <p>Narx: {card.price} ball</p>
                    <p>Qo'yilgan: {card.listedAt}</p>
                  </div>
                  <button 
                    onClick={() => deleteMarketCard(card.id)}
                    className="action-btn danger"
                  >
                    O'chirish
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Statistika */}
          <div className="admin-section">
            <h2>Statistika</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{users.length}</span>
                <span className="stat-label">Foydalanuvchi</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{marketCards.length}</span>
                <span className="stat-label">Sotuvdagi karta</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {users.reduce((total, user) => total + user.balance, 0)}
                </span>
                <span className="stat-label">Jami ball</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// BottomNav komponenti
function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="nav-item">
        <div className="nav-icon">⚙️</div>
        <span>Admin</span>
      </div>
      <div className="nav-item">
        <div className="nav-icon">📊</div>
        <span>Statistika</span>
      </div>
      <div className="nav-item">
        <div className="nav-icon">👥</div>
        <span>Foydalanuvchilar</span>
      </div>
      <div className="nav-item">
        <div className="nav-icon">💳</div>
        <span>Kartalar</span>
      </div>
      <div className="nav-item">
        <div className="nav-icon">🏪</div>
        <span>Market</span>
      </div>
    </nav>
  );
}

export default AdminPanel;