// Service Worker for cache management
const CACHE_NAME = 'ai-news-v1.0.2';
const STATIC_CACHE = 'ai-news-static-v1.0.2';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
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
  const request = event.request;
  const url = new URL(request.url);

  // 跳过跨域请求，避免第三方脚本失败导致 SW 报错（如 hm.baidu.com）
  if (url.origin !== self.location.origin) {
    return; // 不拦截，交给浏览器默认处理
  }

  // 对于页面导航请求，统一回退到 index.html（支持 SPA 路由刷新/直达）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html').catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 对于新闻数据和版本信息，使用网络优先策略
  if (NETWORK_FIRST.some(path => url.pathname.includes(path))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 其他资源使用缓存优先，并在网络失败时兜底
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => caches.match('/index.html'));
    })
  );
});
