// public/service-worker.js

// Install event
self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker o‘rnatilmoqda...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker faollashdi.');
});

// Fetch event (offline uchun)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
