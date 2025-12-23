// ===============================
// HP Tracker Service Worker
// Version: v1.2.0  (CACHE FIXED)
// ===============================

const CACHE_VERSION = "v1.2.0";
const CACHE_NAME = `hp-tracker-${CACHE_VERSION}`;

// Cache ONLY static assets (NO JS, NO JSON)
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/styles.css",
  "/auth.js",
  "/manifest.json"
];

// -------------------------------
// INSTALL
// -------------------------------
self.addEventListener("install", (event) => {
  console.log("[HP Tracker SW] Installing:", CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// -------------------------------
// ACTIVATE
// -------------------------------
self.addEventListener("activate", (event) => {
  console.log("[HP Tracker SW] Activating:", CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache.startsWith("hp-tracker-")) {
            console.log("[HP Tracker SW] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// -------------------------------
// FETCH
// -------------------------------
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // ❌ Never cache non-GET requests
  if (request.method !== "GET") return;

  // ❌ Always fetch latest JS & JSON (CRITICAL FIX)
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".json")
  ) {
    console.log("[HP Tracker SW] Bypass cache:", url.pathname);
    event.respondWith(fetch(request));
    return;
  }

  // ❌ Skip external APIs & Firebase
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("google") ||
    url.hostname.includes("gstatic") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("firebaseio") ||
    url.hostname.includes("onrender.com") ||
    url.pathname.includes("/api/")
  ) {
    return;
  }

  // ✅ Cache-first for static files
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        console.log("[HP Tracker SW] From cache:", url.pathname);
        return cached;
      }

      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(() => caches.match("/index.html"));
    })
  );
});

// -------------------------------
// MESSAGE HANDLER
// -------------------------------
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) =>
        Promise.all(cacheNames.map((c) => caches.delete(c)))
      )
    );
  }
});

console.log("[HP Tracker SW] Loaded:", CACHE_VERSION);
