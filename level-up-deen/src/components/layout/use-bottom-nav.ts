"use client";

import { useState, useEffect } from "react";
import { routes } from "@/lib/routes";

const STORAGE_KEY = "levelup_bottom_nav_pins";

const DEFAULT_PINS = [
  routes.dashboard,
  routes.quests,
  routes.deen,
  routes.finance,
  routes.aiCoach,
];

export function useBottomNav() {
  const [pins, setPins] = useState<string[]>(DEFAULT_PINS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPins(parsed.slice(0, 5)); // max 5
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen to custom event for cross-component sync
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPins(JSON.parse(stored).slice(0, 5));
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("bottom-nav-updated", handleSync);
    return () => window.removeEventListener("bottom-nav-updated", handleSync);
  }, []);

  const togglePin = (href: string) => {
    let newPins = [...pins];
    if (newPins.includes(href)) {
      // Remove
      newPins = newPins.filter((p) => p !== href);
      // Ensure at least 1 item
      if (newPins.length === 0) newPins = [routes.dashboard];
    } else {
      // Add
      if (newPins.length >= 5) {
        newPins.pop(); // remove last to make room
      }
      newPins.push(href);
    }
    
    setPins(newPins);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPins));
    window.dispatchEvent(new Event("bottom-nav-updated"));
  };

  return { pins, togglePin, isLoaded };
}
