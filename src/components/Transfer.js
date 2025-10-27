import React, { useState } from 'react';
import '../styles/Transfer.css';

function Transfer({ user }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(0);

  const handleTransfer = () => {
    if (user.balance >= amount && amount > 0) {
      const updatedUser = {
        ...user,
        balance: user.balance - parseInt(amount),
        history: [...user.history, { 
          time: new Date().toLocaleString(), 
          action: 'Ball yuborildi', 
          amount: amount, 
          recipient 
        }],
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert(`${amount} ball ${recipient} ga yuborildi!`);
      setRecipient('');
      setAmount(0);
      window.location.reload();
    } else {
      alert('Yetarli balans yo\'q yoki miqdor noto\'g\'ri!');
    }
  };

  return (
    <div className="transfer">
      <h2>Ball yuborish</h2>
      <input 
        type="text" 
        value={recipient} 
        onChange={(e) => setRecipient(e.target.value)} 
        placeholder="ID/Login" 
        required 
      />
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        placeholder="Miqdor" 
        min="1" 
        required 
      />
      <button onClick={handleTransfer} className="transfer-btn">Yuborish</button>
    </div>
  );
}

export default Transfer;