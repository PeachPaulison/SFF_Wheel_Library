self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("wheel-library-cache-v3").then((cache) => {
      return cache.addAll(["index.html"]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    // Always try network for index.html
    e.respondWith(
      fetch(e.request).catch(() => caches.match("index.html"))
    );
    return;
  }

  // Other assets: cache-first
  e.respondWith(
    caches.match(e.request).then((response) =>
      response || fetch(e.request)
    )
  );
});