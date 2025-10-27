import React from 'react';
import '../styles/Cards.css';

function Cards({ user }) {
  const formatCardNumber = (number) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="cards-page">
      <div className="cards-container">
        <h2>Mening Kartalarim ({user.cards.length} ta)</h2>

        <div className="cards-grid">
          {user.cards.length > 0 ? (
            user.cards.map((card, index) => (
              <div key={index} className="card-item-real">
                <div className="card-front">
                  <div className="card-header">
                    <div className="card-chip"></div>
                    <div className="card-type">VIRTUAL CARD</div>
                  </div>

                  <div className="card-number">
                    {formatCardNumber(card.id)}
                  </div>

                  <div className="card-footer">
                    <div className="card-balance">
                      {card.balance.toLocaleString()} ball
                    </div>
                    <div className="card-design">{card.design}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-cards">
              <div className="no-cards-icon">💳</div>
              <p>Hozircha kartalar yo‘q</p>
              <p>Birinchi kartangizni sotib oling!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cards;
