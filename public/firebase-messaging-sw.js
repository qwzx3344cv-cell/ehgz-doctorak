// Firebase Cloud Messaging & Web Push Service Worker
// Handles immediate push notifications for Doctors, Labs, Patients, and Admin
// Ensures notifications arrive even when the app is in background or closed
// Supports PWA offline asset caching

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

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
  '/favicon.ico'
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

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
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
        if (request.destination === 'image') {
          return caches.match('/icon.svg');
        }
      });
    })
  );
});

// Initialize Firebase in Service Worker using same credentials
const firebaseConfig = {
  projectId: "project-5f7237db-b1ab-4f02-883",
  appId: "1:214307993909:web:3553f23831d8eec08db47c",
  apiKey: "AIzaSyAEzqJPxMaiG22rUPAI7kAebHwMcEmyQzs",
  authDomain: "project-5f7237db-b1ab-4f02-883.firebaseapp.com",
  messagingSenderId: "214307993909",
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || '🔔 احجز عند دكتورك - إشعار جديد';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'لديك تحديث فوري على حجزك الطبي',
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: payload.data?.bookingCode || 'ehgz-notification',
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url: payload.data?.url || '/',
        bookingCode: payload.data?.bookingCode,
        recipientType: payload.data?.recipientType
      }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('[firebase-messaging-sw.js] FCM Compat init note:', e);
}

// Fallback / Direct Push Listener for Web Push
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

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

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
