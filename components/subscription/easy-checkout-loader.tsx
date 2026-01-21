"use client";

import { useEffect } from "react";
import type { EasyCheckoutStatic } from "@/types/easy-checkout.types";

declare global {
  interface Window {
    EasyCheckout?: EasyCheckoutStatic;
  }
}

interface EasyCheckoutLoaderProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * SSLCommerz Easy Checkout Script Loader
 * This component loads the SSLCommerz Easy Checkout library
 */
export function EasyCheckoutLoader({
  onLoad,
  onError,
}: EasyCheckoutLoaderProps) {
  useEffect(() => {
    // Check if script is already loaded
    if (window.EasyCheckout) {
      onLoad?.();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="embed.min.js"], script[src*="sslcommerz"]',
    );
    if (existingScript) {
      console.log("SSLCommerz script already exists in DOM");
      existingScript.addEventListener("load", () => {
        console.log("Existing script loaded event triggered");
        setTimeout(() => onLoad?.(), 100);
      });
      return;
    }

    // Load the script - following official SSLCommerz documentation pattern
    const script = document.createElement("script");
    const tag = document.getElementsByTagName("script")[0];

    // Add cache-busting random string as per SSLCommerz documentation
    const cacheBuster = Math.random().toString(36).substring(7);

    // For sandbox: https://sandbox.sslcommerz.com/embed.min.js
    // For live: https://seamless-epay.sslcommerz.com/embed.min.js
    script.src = `https://sandbox.sslcommerz.com/embed.min.js?${cacheBuster}`;
    script.type = "text/javascript";
    script.id = "sslcommerz-easycheckout-script";

    script.onload = () => {
      console.log("SSLCommerz Easy Checkout library loaded");
      console.log("window.EasyCheckout:", typeof window.EasyCheckout);
      console.log(
        "window object keys (filtered):",
        Object.keys(window).filter(
          (k) =>
            k.toLowerCase().includes("easy") ||
            k.toLowerCase().includes("ssl") ||
            k.toLowerCase().includes("checkout"),
        ),
      );

      // Small delay to ensure the library is fully initialized
      setTimeout(() => {
        onLoad?.();
      }, 100);
    };

    script.onerror = () => {
      const error = new Error(
        "Failed to load SSLCommerz Easy Checkout library",
      );
      console.error(error);
      onError?.(error);
    };

    // Insert script before the first script tag as per SSLCommerz documentation
    tag.parentNode?.insertBefore(script, tag);

    // Cleanup
    return () => {
      // Don't remove the script on unmount as it might be used by other components
      // script.remove();
    };
  }, [onLoad, onError]);

  return null; // This component doesn't render anything
}
