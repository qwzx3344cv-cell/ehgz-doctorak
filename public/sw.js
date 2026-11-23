// Service Worker for Ehgz 3nd Doctorak
// Supports background push notifications, offline caching, and PWA installability

const CACHE_NAME = 'doctorak-cache-v3';
const IMAGE_CACHE_NAME = 'doctorak-images-v1';
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
  '/assets/badge.png',
  '/assets/aistudio/857393128_2357599598318724_1090210002570918881_n_2720673a.webp'
];

function isCacheableImageRequest(request) {
  const url = request.url;
  return (
    request.destination === 'image' ||
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('storage.googleapis.com') ||
    /\.(webp|png|jpe?g|svg|gif)(\?.*)?$/i.test(url)
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== IMAGE_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first / Network-fallback for assets and images, Network-first for navigation
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

  // Persistent cache for local & Firebase Storage images so they are not re-downloaded unless changed
  if (isCacheableImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          const cachedEtag = cachedResponse.headers.get('etag');
          const cachedMod = cachedResponse.headers.get('last-modified');
          if ((cachedEtag || cachedMod) && !request.url.includes('_r=')) {
            fetch(request, { method: 'HEAD' })
              .then((headRes) => {
                if (!headRes || !headRes.ok) return;
                const newEtag = headRes.headers.get('etag');
                const newMod = headRes.headers.get('last-modified');
                const changed =
                  (cachedEtag && newEtag && cachedEtag !== newEtag) ||
                  (cachedMod && newMod && cachedMod !== newMod);
                if (changed) {
                  fetch(request).then((freshRes) => {
                    if (freshRes && (freshRes.status === 200 || freshRes.type === 'opaque')) {
                      cache.put(request, freshRes.clone());
                    }
                  }).catch(() => {});
                }
              })
              .catch(() => {});
          }
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return (await caches.match('/icon.svg')) || Response.error();
        }
      })
    );
    return;
  }

  // Handle navigation requests (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html') || caches.match('/'))
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
      }).catch(() => caches.match('/index.html'));
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
