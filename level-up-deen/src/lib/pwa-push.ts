"use client";

// VAPID Public Key for Web Push (Should be in env, but for now we'll throw if missing)
export async function getPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by the browser.");
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription;
}

export async function subscribeToPush(applicationServerKey: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by the browser.");
  }

  const registration = await navigator.serviceWorker.ready;

  // Ask for permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Push notification permission denied.");
  }

  // Subscribe
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  return subscription;
}
