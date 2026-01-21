"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { EasyCheckoutLoader } from "./easy-checkout-loader";
import type {
  EasyCheckoutInstance,
  PaymentSuccessData,
  PaymentFailureData,
} from "@/types/easy-checkout.types";

interface EasyCheckoutModalProps {
  is_open: boolean;
  session_key: string | null;
  plan_name: string;
  amount: number;
  onClose: () => void;
  onSuccess: (payment_data: PaymentSuccessData) => void;
  onError: (error: string) => void;
}

/**
 * SSLCommerz Easy Checkout Modal Component
 * Displays embedded payment form using SSLCommerz Easy Checkout
 */
export function EasyCheckoutModal({
  is_open,
  session_key,
  plan_name,
  amount,
  onClose,
  onSuccess,
  onError,
}: EasyCheckoutModalProps) {
  const [is_loading, setIsLoading] = useState(true);
  const [is_initializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library_loaded, setLibraryLoaded] = useState(false);
  const checkout_ref = useRef<EasyCheckoutInstance | null>(null);
  const container_ref = useRef<HTMLDivElement>(null);

  // Initialize Easy Checkout when library is loaded and session_key is available
  useEffect(() => {
    console.log("Easy Checkout useEffect triggered:", {
      library_loaded,
      has_session_key: !!session_key,
      is_open,
    });

    if (!library_loaded || !session_key || !is_open) {
      console.log("Skipping initialization - conditions not met");
      return;
    }

    console.log("Basic conditions met, waiting for container...");

    // Wait for container to be available in DOM
    const initWithRetry = () => {
      if (!container_ref.current) {
        console.log("Container not ready yet, retrying...");
        setTimeout(initWithRetry, 50);
        return;
      }

      console.log("Container ready, initializing Easy Checkout...");

      // Clear previous checkout instance
      if (checkout_ref.current) {
        try {
          checkout_ref.current.destroy();
        } catch (e) {
          console.warn("Failed to destroy previous checkout instance:", e);
        }
        checkout_ref.current = null;
      }

      // Clear container
      container_ref.current.innerHTML = "";

      const initializeCheckout = async () => {
        try {
          setIsInitializing(true);
          setIsLoading(true);
          setError(null);

          // Debug: Log all window properties starting with 'Easy' or 'SSL'
          const windowKeys = Object.keys(window).filter(
            (key) =>
              key.toLowerCase().includes("easy") ||
              key.toLowerCase().includes("ssl") ||
              key.toLowerCase().includes("checkout") ||
              key.toLowerCase().includes("embed"),
          );
          console.log(
            "Window properties (ssl/easy/checkout/embed):",
            windowKeys,
          );
          console.log("window.EasyCheckout:", typeof window.EasyCheckout);
          console.log("Full window dump for debugging:", {
            EasyCheckout: window.EasyCheckout,
            availableKeys: windowKeys,
          });

          // Wait for EasyCheckout library to be available (max 3 seconds with detailed logging)
          let retry_count = 0;
          const max_retries = 60; // 60 * 50ms = 3 seconds

          const waitForLibrary = (): Promise<void> => {
            return new Promise((resolve, reject) => {
              const checkLibrary = () => {
                // Log every attempt for detailed debugging
                console.log(
                  `Checking for window.EasyCheckout... (attempt ${retry_count + 1}/${max_retries})`,
                );

                if (retry_count % 10 === 0) {
                  // Log detailed info every 500ms
                  console.log(
                    "  typeof window.EasyCheckout:",
                    typeof window.EasyCheckout,
                  );
                  console.log(
                    "  window.EasyCheckout exists:",
                    !!window.EasyCheckout,
                  );
                  console.log(
                    "  window keys:",
                    Object.keys(window).filter(
                      (k) =>
                        k.toLowerCase().includes("easy") ||
                        k.toLowerCase().includes("ssl") ||
                        k.toLowerCase().includes("checkout") ||
                        k.toLowerCase().includes("embed"),
                    ),
                  );
                }

                // Check if EasyCheckout is available
                if (
                  window.EasyCheckout &&
                  typeof window.EasyCheckout.init === "function"
                ) {
                  console.log("✓ EasyCheckout library found with init method!");
                  resolve();
                } else if (retry_count >= max_retries) {
                  console.error("❌ Timeout waiting for EasyCheckout library");
                  console.error("  window.EasyCheckout:", window.EasyCheckout);
                  console.error("  typeof:", typeof window.EasyCheckout);
                  console.error(
                    "  Available globals:",
                    Object.keys(window).filter(
                      (k) =>
                        k.toLowerCase().includes("ssl") ||
                        k.toLowerCase().includes("easy") ||
                        k.toLowerCase().includes("checkout") ||
                        k.toLowerCase().includes("embed"),
                    ),
                  );
                  console.error(
                    "  Possible issue: Script loaded but global not exposed",
                  );
                  console.error(
                    "  Script tags:",
                    Array.from(
                      document.querySelectorAll(
                        'script[src*="ssl"], script[src*="embed"]',
                      ),
                    ).map((s) => (s as HTMLScriptElement).src),
                  );
                  reject(
                    new Error(
                      "EasyCheckout library not loaded after " +
                        (max_retries * 50) / 1000 +
                        " seconds",
                    ),
                  );
                } else {
                  retry_count++;
                  setTimeout(checkLibrary, 50);
                }
              };
              checkLibrary();
            });
          };

          // Wait for library
          await waitForLibrary();

          // Initialize Easy Checkout
          const obj = {
            session_key: session_key,
            embedded: true,
            container_id: "sslc-embed-container",
          };

          console.log(
            "Calling EasyCheckout.init() with session key:",
            session_key.substring(0, 20) + "...",
          );
          checkout_ref.current = window.EasyCheckout.init(obj);
          console.log("EasyCheckout.init() completed");

          // Listen for payment completion
          checkout_ref.current.on("success", (payment_data) => {
            console.log("Payment successful:", payment_data);
            setIsLoading(false);
            onSuccess(payment_data as PaymentSuccessData);
          });

          checkout_ref.current.on("failure", (error_data) => {
            console.error("Payment failed:", error_data);
            setIsLoading(false);
            const failure_data = error_data as PaymentFailureData | undefined;
            const error_message =
              failure_data?.error_message ||
              "Payment failed. Please try again.";
            setError(error_message);
            onError(error_message);
          });

          checkout_ref.current.on("close", () => {
            console.log("Payment modal closed by user");
            setIsLoading(false);
          });

          // Use MutationObserver for more reliable form detection
          const observer = new MutationObserver((mutations) => {
            const container = container_ref.current;
            if (!container) return;

            // Check if content has been added
            if (
              container.querySelector("iframe") ||
              container.querySelector("form") ||
              container.children.length > 0
            ) {
              console.log("Payment form detected via MutationObserver");
              observer.disconnect();
              setIsLoading(false);
              setIsInitializing(false);
            }
          });

          // Start observing
          if (container_ref.current) {
            observer.observe(container_ref.current, {
              childList: true,
              subtree: true,
            });
            console.log("MutationObserver started");
          }

          // Fallback timeout in case MutationObserver doesn't catch it
          const fallbackTimer = setTimeout(() => {
            console.log("Fallback timeout reached, hiding loader");
            observer.disconnect();
            setIsLoading(false);
            setIsInitializing(false);
          }, 5000); // 5 seconds max

          // Cleanup
          return () => {
            console.log("Cleaning up Easy Checkout");
            observer.disconnect();
            clearTimeout(fallbackTimer);
          };
        } catch (err) {
          console.error("Error initializing Easy Checkout:", err);
          const error_message =
            err instanceof Error ? err.message : "Failed to initialize payment";
          setError(error_message);
          setIsLoading(false);
          setIsInitializing(false);
          onError(error_message);
        }
      };

      initializeCheckout();
    };

    // Start initialization with retry
    initWithRetry();

    // Cleanup
    return () => {
      if (checkout_ref.current) {
        try {
          checkout_ref.current.destroy();
        } catch (e) {
          console.warn("Failed to destroy checkout instance:", e);
        }
        checkout_ref.current = null;
      }
    };
  }, [library_loaded, session_key, is_open, onSuccess, onError]);

  const handleClose = () => {
    if (checkout_ref.current) {
      try {
        checkout_ref.current.destroy();
      } catch (e) {
        console.warn("Failed to destroy checkout instance:", e);
      }
      checkout_ref.current = null;
    }
    onClose();
  };

  return (
    <>
      <EasyCheckoutLoader
        onLoad={() => {
          console.log("Easy Checkout library loaded successfully");
          setLibraryLoaded(true);
        }}
        onError={(err) => {
          console.error("Failed to load Easy Checkout library:", err);
          setError("Failed to load payment system. Please try again later.");
          setIsLoading(false);
        }}
      />

      <Dialog open={is_open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              {plan_name} - ৳{amount}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {is_loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <span className="text-muted-foreground">
                  {is_initializing
                    ? "Initializing payment..."
                    : "Loading payment form..."}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Please wait...
                </span>
              </div>
            )}

            {error && !is_loading && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* SSLCommerz Easy Checkout Container */}
            <div
              id="sslc-embed-container"
              ref={container_ref}
              className="min-h-[400px] w-full"
              style={{
                display: is_loading ? "none" : "block",
                visibility: is_loading ? "hidden" : "visible",
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
