// Service Worker for Briefly60
const CACHE_NAME = "briefly60-v1";
const RUNTIME_CACHE = "briefly60-runtime";

// Assets to cache on install
const PRECACHE_URLS = ["/", "/offline", "/site.webmanifest"];

// Install event - precache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - network first, falling back to cache
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        // Update cache in background
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          })
          .catch(() => {
            // Network error, but we have cached version
          });
        return cachedResponse;
      }

      // Try network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Network failed, try to return offline page
          return caches.match("/offline");
        });
    }),
  );
});

// Handle background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-articles") {
    event.waitUntil(syncArticles());
  }
});

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Briefly60";
  const options = {
    body: data.body || "New articles available!",
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    data: data.url || "/",
    tag: "briefly60-notification",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});

// Helper function for syncing articles
async function syncArticles() {
  try {
    const response = await fetch("/api/articles?limit=20");
    if (response.ok) {
      const data = await response.json();
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(
        "/api/articles?limit=20",
        new Response(JSON.stringify(data)),
      );
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
