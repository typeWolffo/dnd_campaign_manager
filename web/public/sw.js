const CACHE_NAME = "dnd-campaign-manager-v2";
const urlsToCache = ["/", "/dashboard", "/sign-in", "/sign-up", "/manifest.json", "/offline.html"];

// Install event - force immediate activation
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(err => {
        console.log("Service Worker cache failed: ", err);
      })
  );
});

// Fetch event with better caching strategy
self.addEventListener("fetch", event => {
  // Skip caching for API calls and dynamic content
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("hot-update") ||
    event.request.url.includes("@vite") ||
    event.request.method !== "GET"
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // For HTML pages, try network first, fallback to cache
      if (event.request.mode === "navigate") {
        return fetch(event.request)
          .then(fetchResponse => {
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
              return fetchResponse;
            }
            return response || caches.match("/offline.html");
          })
          .catch(() => {
            return response || caches.match("/offline.html");
          });
      }

      // For other resources, cache first, then network
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();
      return fetch(fetchRequest)
        .then(response => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
        });
    })
  );
});

// Activate event - clean old caches and take control immediately
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim(),
    ])
  );
});

// Handle background sync
self.addEventListener("sync", event => {
  if (event.tag === "background-sync") {
    console.log("Background sync triggered");
  }
});

// Handle push notifications (for future use)
self.addEventListener("push", event => {
  const options = {
    body: event.data ? event.data.text() : "New update available!",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open App",
        icon: "/android-chrome-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/favicon-32x32.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("D&D Campaign Manager", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard"));
  }
});

// Handle messages from main thread
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
