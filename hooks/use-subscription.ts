import { useState, useEffect, useCallback, useRef } from "react";
import { UserSubscriptionStatus } from "@/types/subscription.types";
import { get } from "@/lib/api-client";
import { LocalStorageService } from "@/services/localstorage.services";

export const useSubscription = () => {
  const [subscription_status, setSubscriptionStatus] =
    useState<UserSubscriptionStatus | null>(null);
  const [is_loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const is_mounted_ref = useRef(true);

  const fetchSubscriptionStatus = useCallback(async () => {
    // Check if user is authenticated before making API call
    if (typeof window === "undefined") return;

    const token = LocalStorageService.getAuthToken();
    if (!token) {
      // User not signed in, set default values without API call
      if (is_mounted_ref.current) {
        setSubscriptionStatus({
          has_active_subscription: false,
          subscription: undefined,
        });
        setIsLoading(false);
      }
      return;
    }

    try {
      if (is_mounted_ref.current) {
        setIsLoading(true);
        setError(null);
      }

      const data = await get<{
        has_active_subscription: boolean;
        subscription: UserSubscriptionStatus["subscription"];
      }>("/api/subscription/status");

      if (is_mounted_ref.current) {
        setSubscriptionStatus({
          has_active_subscription: data.has_active_subscription,
          subscription: data.subscription,
        });
      }
    } catch (err) {
      if (is_mounted_ref.current) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch subscription",
        );
        // Set default values on error
        setSubscriptionStatus({
          has_active_subscription: false,
          subscription: undefined,
        });
      }
    } finally {
      if (is_mounted_ref.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    is_mounted_ref.current = true;
    fetchSubscriptionStatus();

    return () => {
      is_mounted_ref.current = false;
    };
  }, [fetchSubscriptionStatus]);

  return {
    subscription_status,
    is_loading,
    error,
    refetch: fetchSubscriptionStatus,
    has_premium: subscription_status?.has_active_subscription || false,
  };
};

export const useSubscriptionInit = () => {
  const [is_loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const is_mounted_ref = useRef(true);

  useEffect(() => {
    is_mounted_ref.current = true;
    return () => {
      is_mounted_ref.current = false;
    };
  }, []);

  const initializePayment = useCallback(
    async (plan_id: string, auto_renew = false) => {
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
          body: JSON.stringify({ plan_id, auto_renew }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.gateway_url) {
          // Redirect to payment gateway
          window.location.href = data.gateway_url;
          return { success: true };
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
    initializePayment,
    is_loading,
    error,
  };
};
