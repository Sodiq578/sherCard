import React from 'react';
import '../styles/History.css';

function History({ user }) {
  return (
    <div className="history">
      <h2>Tarix</h2>
      <ul className="history-list">
        {user.history.length > 0 ? (
          user.history.map((item, index) => (
            <li key={index} className="history-item">
              {item.time} - {item.action} - {item.amount} ball
              {item.recipient && ` - ${item.recipient}`}
            </li>
          ))
        ) : (
          <li className="history-item">Hozircha tarix yo'q</li>
        )}
      </ul>
    </div>
  );
}

export default History;