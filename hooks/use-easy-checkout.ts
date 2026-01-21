import { useState, useEffect, useCallback, useRef } from "react";
import { LocalStorageService } from "@/services/localstorage.services";

interface InitEasyCheckoutResult {
  success: boolean;
  session_key?: string;
  transaction_id?: string;
  error?: string;
}

/**
 * Hook for initializing Easy Checkout payment
 * This hook is specifically for embedded payment integration
 */
export const useEasyCheckout = () => {
  const [is_loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const is_mounted_ref = useRef(true);

  useEffect(() => {
    is_mounted_ref.current = true;
    return () => {
      is_mounted_ref.current = false;
    };
  }, []);

  const initializeEasyCheckout = useCallback(
    async (
      plan_id: string,
      auto_renew = false,
    ): Promise<InitEasyCheckoutResult> => {
      // Check if user is authenticated
      if (typeof window === "undefined") {
        return { success: false, error: "Window not available" };
      }

      const token = LocalStorageService.getAuthToken();
      if (!token) {
        if (is_mounted_ref.current) {
          setError("অনুগ্রহ করে প্রথমে লগইন করুন");
        }
        return { success: false, error: "Authentication required" };
      }

      try {
        if (is_mounted_ref.current) {
          setIsLoading(true);
          setError(null);
        }

        const response = await fetch("/api/subscription/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan_id,
            auto_renew,
            use_easy_checkout: true, // Enable Easy Checkout
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.session_key) {
          return {
            success: true,
            session_key: data.session_key,
            transaction_id: data.transaction_id,
          };
        } else {
          const error_message = data.error || "পেমেন্ট শুরু করতে ব্যর্থ হয়েছে";
          if (is_mounted_ref.current) {
            setError(error_message);
          }
          return { success: false, error: error_message };
        }
      } catch (err) {
        const error_message =
          err instanceof Error
            ? err.message
            : "পেমেন্ট শুরু করতে সমস্যা হয়েছে";
        if (is_mounted_ref.current) {
          setError(error_message);
        }
        return { success: false, error: error_message };
      } finally {
        if (is_mounted_ref.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  return {
    initializeEasyCheckout,
    is_loading,
    error,
  };
};
