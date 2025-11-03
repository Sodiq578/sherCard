// src/pages/ShopPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShops } from "../data/shops";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import "../styles/ShopPage.css";

function ShopPage({ user, updateUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const shop = getShops().find((s) => s.id === parseInt(id));

  if (!shop) {
    return (
      <div className="shop-not-found">
        <p>Do'kon topilmadi</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Orqaga
        </button>
      </div>
    );
  }

  const handleBuy = (item) => {
    if ((user?.balance || 0) < item.price) {
      alert("Balans yetarli emas!");
      return;
    }

    const updatedUser = {
      ...user,
      balance: (user.balance || 0) - item.price,
      history: [
        ...(user.history || []),
        {
          time: new Date().toLocaleString("uz-UZ"),
          action: `Sotib olindi: ${item.name} (${shop.name})`,
          amount: -item.price,
        },
      ],
    };

    localStorage.setItem("userData", JSON.stringify(updatedUser));
    updateUser(updatedUser);
    alert(`${item.name} muvaffaqiyatli sotib olindi!`);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FiArrowLeft size={24} />
        </button>
        <div className="shop-info-mobile">
          <img src={shop.logo} alt={shop.name} className="shop-logo" />
          <div className="shop-title">
            <h2>{shop.name}</h2>
            <p className="shop-description-mobile">{shop.description}</p>
          </div>
        </div>
      </div>

      <div className="shop-info-desktop">
        <p>{shop.description}</p>
      </div>

      <div className="menu-list">
        <h3>
          <FiShoppingBag /> Menyu
        </h3>
        {shop.menu.map((item) => (
          <div key={item.id} className="menu-item">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-price">{item.price.toLocaleString()} UZS</span>
            </div>
            <button
              className={`buy-btn ${(user?.balance || 0) < item.price ? 'disabled' : ''}`}
              onClick={() => handleBuy(item)}
              disabled={(user?.balance || 0) < item.price}
            >
              Sotib olish
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopPage;