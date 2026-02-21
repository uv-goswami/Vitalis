const CACHE_VERSION = 'vitalai-v4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
             .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 1. Let the SDK handle Model/WASM/Workers via OPFS
  if (
    url.hostname.includes('huggingface') ||
    url.pathname.endsWith('.gguf') ||
    url.pathname.endsWith('.wasm') ||
    (url.pathname.includes('worker') && url.pathname.endsWith('.js')) ||
    e.request.headers.get('x-sdk-fetch')
  ) return;

  // 2. Navigation requests: Network-First, fallback to cached index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. Static Assets: Cache-First, then Update (Stale-While-Revalidate)
  if (e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE).then(c => c.put(e.request, copy));
          }
          return response;
        }).catch(() => null);

        // Return cached version if exists, otherwise wait for fetch
        return cached || fetchPromise || caches.match('/index.html');
      })
    );
  }
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});