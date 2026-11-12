// Service Worker for Ehgz 3nd Doctorak
// Supports background push notifications, offline caching, and PWA installability

const CACHE_NAME = 'doctorak-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/assets/icon.png',
  '/assets/badge.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first / Network-fallback for assets, Network-first for navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests or Firebase Firestore / Auth / API calls
  if (
    request.method !== 'GET' ||
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('identitytoolkit.googleapis.com') ||
    request.url.includes('fcm.googleapis.com') ||
    request.url.includes('firebaseinstallations.googleapis.com') ||
    request.url.includes('chrome-extension')
  ) {
    return;
  }

  // Handle navigation requests (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // For static assets, try cache first, then fetch and update cache
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and refresh in background
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      }).catch(() => {
        // Offline fallback for images
        if (request.destination === 'image') {
          return caches.match('/icon.svg');
        }
      });
    })
  );
});

// Handle incoming Push notifications in background
self.addEventListener('push', (event) => {
  let title = '🔔 احجز عند دكتورك';
  let body = 'لديك إشعار جديد في تطبيق احجز عند دكتورك';
  let url = '/';
  let tag = 'ehgz-push';

  if (event.data) {
    try {
      const json = event.data.json();
      title = json.title || json.notification?.title || title;
      body = json.body || json.notification?.body || body;
      url = json.url || json.data?.url || url;
      tag = json.bookingCode || tag;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag,
    renotify: true,
    vibrate: [250, 100, 250, 100, 250],
    data: { url },
    actions: [
      { action: 'open', title: 'عرض التفاصيل' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click to bring app to focus
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
