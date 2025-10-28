import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // 🆕 qo‘shildi

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🆕 PWA uchun service worker'ni ro‘yxatdan o‘tkazamiz
serviceWorkerRegistration.register(); 

reportWebVitals();
