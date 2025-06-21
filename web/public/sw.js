const CACHE_NAME = "dnd-campaign-manager-v1";
const urlsToCache = ["/", "/dashboard", "/sign-in", "/sign-up", "/manifest.json", "/offline.html"];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log("Service Worker cache failed: ", err);
      })
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }

      // Clone the request because it's a stream
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
        });
    })
  );
});

// Activate event
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
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
