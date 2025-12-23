// Service Worker - HP Tracker v1.1.0
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `hp-tracker-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/styles.css',
  '/auth.js',
  '/dashboard.js',
  '/exams.js',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[HP Tracker SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[HP Tracker SW] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[HP Tracker SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[HP Tracker SW] Installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[HP Tracker SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('hp-tracker-')) {
              console.log('[HP Tracker SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[HP Tracker SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: Skip caching for non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    console.log('[HP Tracker SW] Skipping non-GET request:', request.method, url.pathname);
    return; // Let the browser handle it normally
  }

  // Skip caching for Firebase APIs and external APIs
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('google') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('firebaseio') ||
    url.hostname.includes('onrender.com') ||
    url.pathname.includes('/api/')
  ) {
    console.log('[HP Tracker SW] Skipping external API:', url.hostname);
    return; // Let the browser handle it normally
  }

  // Cache strategy: Cache-first for our assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[HP Tracker SW] Serving from cache:', url.pathname);
          return cachedResponse;
        }

        console.log('[HP Tracker SW] Fetching from network:', url.pathname);
        return fetch(request)
          .then((networkResponse) => {
            // Only cache successful GET responses
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                })
                .catch((error) => {
                  console.error('[HP Tracker SW] Cache put failed:', error);
                });
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[HP Tracker SW] Fetch failed:', error);
            
            // Return offline page if available
            return caches.match('/index.html');
          });
      })
  );
});

// Message handler - for version checks and cache clearing
self.addEventListener('message', (event) => {
  console.log('[HP Tracker SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    console.log('[HP Tracker SW] Skipping waiting...');
    self.skipWaiting();
  }

  if (event.data.type === 'GET_VERSION') {
    console.log('[HP Tracker SW] Sending version:', CACHE_VERSION);
    event.ports[0].postMessage({
      version: CACHE_VERSION
    });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    console.log('[HP Tracker SW] Clearing all caches...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[HP Tracker SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

console.log('[HP Tracker SW] Service Worker loaded, version:', CACHE_VERSION);