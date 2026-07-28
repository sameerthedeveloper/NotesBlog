const CACHE_NAME = "opennotes-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/logo.svg",
  "/header-logo.svg",
  "/header-logo-dark.svg",
  "/icons.svg"
];

// Service Worker Install Event - Precache static app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Service Worker Fetch Event - Stale-While-Revalidate Caching Strategy
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests or Firebase API calls (handled by Firestore offline SDK)
  if (event.request.method !== "GET" || event.request.url.includes("firestore.googleapis.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails and no cached asset, return cached index.html for SPA routes
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
