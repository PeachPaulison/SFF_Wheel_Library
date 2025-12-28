self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("wheel-library-cache-v3").then((cache) => {
      return cache.addAll(["index.html"]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});