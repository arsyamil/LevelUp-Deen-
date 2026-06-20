const CACHE_NAME = "levelupdeen-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Hanya cache aset statis dan navigasi internal (hindari cache API/Supabase)
  if (
    url.origin === location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      STATIC_ASSETS.includes(url.pathname))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Level Up Deen";
    const options = {
      body: data.body || "Waktunya mengecek progres harian Anda!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: data.url || "/",
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error parsing push payload:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
