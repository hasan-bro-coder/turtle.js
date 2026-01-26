const CACHE_NAME = 'noter-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.ts', // Vite will resolve this in dev, but in build it will be different
  '/style.css',
  '/manifest.json'
];

// 1. Install Event: Cache all essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Fetch Event: Serve files from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
    //   return response || fetch(event.request);
      return fetch(event.request);

    })
  );
});

