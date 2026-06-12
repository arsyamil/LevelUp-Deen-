"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service Workers not supported");
      return;
    }

    const cleanupKey = "level-up-deen-sw-cleaned";

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        }

        if (registrations.length > 0 && sessionStorage.getItem(cleanupKey) !== "true") {
          sessionStorage.setItem(cleanupKey, "true");
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error("[PWA] Service Worker cleanup failed:", err);
      });

    // Monitor online/offline status
    const handleOnline = () => {
      console.log("[PWA] Application is online");
    };

    const handleOffline = () => {
      console.log("[PWA] Application is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null;
}
