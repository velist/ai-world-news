// Service Worker for cache management
const CACHE_NAME = 'ai-news-v1.0.1';
const STATIC_CACHE = 'ai-news-static-v1.0.1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon.ico'
];

// 需要网络优先的资源
const NETWORK_FIRST = [
  '/news-data.json',
  '/version.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 对于新闻数据和版本信息，使用网络优先策略
  if (NETWORK_FIRST.some(path => url.pathname.includes(path))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 对于其他资源，使用缓存优先策略
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});