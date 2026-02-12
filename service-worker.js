const CACHE_NAME = "wheel-library-v1.0.7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png"
];

// Don't cache these URLs - always fetch fresh
const NEVER_CACHE = [
  "https://docs.google.com/spreadsheets", // Your Google Sheets data
  "chrome-extension://", // Browser extensions
  "jsdelivr.net" // Let CDN scripts load directly, bypass service worker
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log("[SW] Deleting old cache:", k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Never cache these URLs - always go to network
  if (NEVER_CACHE.some((pattern) => url.includes(pattern))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first strategy for everything else
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Only cache successful responses
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return res;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("./");
        });
      })
  );
});
