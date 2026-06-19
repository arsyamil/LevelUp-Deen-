/// <reference lib="webworker" />

// @ts-expect-error - Expected for SW
const sw = self as ServiceWorkerGlobalScope;

sw.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || "Level Up Deen";
      const options = {
        body: data.body || "Waktunya melanjutkan quest Anda!",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: data.data || { url: "/" },
      };

      event.waitUntil(sw.registration.showNotification(title, options));
    } catch {
      // Fallback if not JSON
      event.waitUntil(
        sw.registration.showNotification("Level Up Deen", {
          body: event.data.text(),
          icon: "/icon-192x192.png",
        })
      );
    }
  }
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    sw.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(urlToOpen);
        }
      })
  );
});
