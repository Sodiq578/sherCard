// src/components/ShopDetail.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { getShops } from "../data/shops";
import Logo from "../assets/images/logo.png";
import "../styles/ShopDetail.css"; // Yangi CSS fayl

function ShopDetail({ user, updateUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const shops = getShops();
  const shop = shops.find((s) => s.id === parseInt(id));

  const handleBuyItem = (item) => {
    if (!user || user.balance < item.price) {
      alert(`Yetarli token yo‘q! Kerak: ${item.price.toLocaleString()} token`);
      return;
    }
    const confirmBuy = window.confirm(
      `"${item.name}" ni ${item.price.toLocaleString()} token ga sotib olasizmi?`
    );
    if (confirmBuy) {
      const updatedUser = {
        ...user,
        balance: user.balance - item.price,
        history: [
          ...(user.history || []),
          {
            time: new Date().toLocaleString(),
            action: `Sotib olindi: ${shop.name} → ${item.name}`,
            amount: -item.price,
          },
        ],
      };
      updateUser(updatedUser);
      alert(`Muvaffaqiyatli! ${item.name} sotib olindi!`);
    }
  };

  if (!shop) {
    return (
      <div className="shop-detail">
        <div className="header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiArrowLeft size={24} />
          </button>
          <h2>Do'kon topilmadi</h2>
        </div>
        <p className="no-data">Bunday do'kon mavjud emas.</p>
      </div>
    );
  }

  return (
    <div className="shop-detail">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft size={24} />
        </button>
        <img src={shop.logo} alt={shop.name} className="shop-logo" />
        <h2>{shop.name}</h2>
      </div>

      <div className="balance-info">
        <p>
          Joriy balansingiz:{" "}
          <strong>{(user?.balance || 0).toLocaleString()} token</strong>
        </p>
      </div>

      <div className="menu-list">
        {shop.menu && shop.menu.length > 0 ? (
          shop.menu.map((item) => (
            <div key={item.id} className="menu-item-card">
              <img
                src={item.image}
                alt={item.name}
                className="item-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/100?text=No+Image";
                }}
              />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p className="price">{item.price.toLocaleString()} token</p>
              </div>
              <button
                className="buy-btn"
                onClick={() => handleBuyItem(item)}
                disabled={!user || user.balance < item.price}
              >
                <FiShoppingCart /> Sotib olish
              </button>
            </div>
          ))
        ) : (
          <p className="no-menu">Bu do‘konda taomlar mavjud emas</p>
        )}
      </div>
    </div>
  );
}

export default ShopDetail;