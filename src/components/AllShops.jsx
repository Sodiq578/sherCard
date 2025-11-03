// src/components/AllShops.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getShops } from "../data/shops";
import { FiShoppingBag, FiClock, FiStar } from "react-icons/fi";
import "../styles/AllShops.css";

function AllShops({ user }) {
  const navigate = useNavigate();
  const shops = getShops();

  return (
    <div className="allshops-page">
      <div className="allshops-container">
        
        {/* Header */}
        <div className="allshops-header">
          <h1 className="allshops-title">
            <FiShoppingBag className="title-icon" />
            Barcha Do‘konlar
          </h1>
          <p className="allshops-subtitle">{shops.length} ta restoran va fastfood</p>
        </div>

        {/* Do‘konlar Grid */}
        <div className="allshops-grid">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="allshops-card"
              onClick={() => navigate(`/shop/${shop.id}`)}
            >
              {/* LOGO - KATTA VA CHIROYLILI */}
              <div className="allshops-logo-wrapper">
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="allshops-logo"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300/2d2d2d/ffffff?text=${shop.name.substring(0, 2).toUpperCase()}`;
                  }}
                />
                <div className="allshops-rating">
                  <FiStar className="rating-star" /> 4.8
                </div>
              </div>

              {/* INFO */}
              <div className="allshops-info">
                <h3 className="allshops-name">{shop.name}</h3>
                <p className="allshops-category">{getCategory(shop.name)}</p>
                
                <div className="allshops-footer">
                  <span className="allshops-time">
                    <FiClock className="footer-icon" /> 30-40 daqiqa
                  </span>
                  <span className="allshops-min-order">
                    Min: 50 000 so‘m
                  </span>
                </div>
              </div>

              {/* Menu soni */}
              <div className="allshops-menu-count">
                {shop.menu?.length || 0} ta taom
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Kategoriya aniqlash
const getCategory = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("burger") || lower.includes("kfc") || lower.includes("mcdonald")) return "Fastfood";
  if (lower.includes("pizza")) return "Pitsa";
  if (lower.includes("osh") || lower.includes("plov")) return "Milliy taomlar";
  if (lower.includes("döner") || lower.includes("shaurma")) return "Döner";
  if (lower.includes("starbucks") || lower.includes("kofe")) return "Kofe va ichimliklar";
  return "Restoran";
};

export default AllShops;