"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PushSubscriptionCard() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!("Notification" in window)) return;
    setLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Izin notifikasi ditolak.");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // In a real app, use environment variables for VAPID public key
      // using a dummy VAPID public key here for the demo / until configured
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5MEKKKjNDR_O91b-6v9bW8"; 
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Send to server
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error("Gagal menyimpan langganan di server.");
      
      setIsSubscribed(true);
      alert("Berhasil berlangganan notifikasi!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengaktifkan notifikasi: " + (err instanceof Error ? err.message : "Error tidak diketahui"));
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-5">
        <h2 className="section-title">Notifikasi Push</h2>
        <p className="mt-2 text-sm text-text-dim">
          Browser atau perangkat Anda tidak mendukung notifikasi push.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="section-title">Notifikasi Push</h2>
      <p className="mt-2 mb-4 text-sm text-text-dim">
        Aktifkan notifikasi untuk menerima pengingat target harian, status quest, dan pesan dari AI Coach.
      </p>
      {loading ? (
        <p className="text-sm text-brand animate-pulse">Memeriksa status...</p>
      ) : isSubscribed ? (
        <div className="flex items-center gap-3 text-success">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-medium">Notifikasi Aktif</p>
            <p className="text-xs text-text-dim">Anda sudah berlangganan notifikasi pada perangkat ini.</p>
          </div>
        </div>
      ) : (
        <Button onClick={handleSubscribe} disabled={loading}>
          Aktifkan Notifikasi
        </Button>
      )}
    </Card>
  );
}
