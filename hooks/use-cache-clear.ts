"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useCacheClear() {
  const [is_clearing, set_is_clearing] = useState(false);

  const clear_cache = async () => {
    set_is_clearing(true);
    try {
      // Clear all caches
      if ("caches" in window) {
        const cache_names = await caches.keys();
        await Promise.all(cache_names.map((name) => caches.delete(name)));
      }

      // Unregister all service workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      toast.success("Cache cleared successfully! Reloading...", {
        duration: 2000,
      });

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear cache. Please try again.");
      set_is_clearing(false);
    }
  };

  return { clear_cache, is_clearing };
}
