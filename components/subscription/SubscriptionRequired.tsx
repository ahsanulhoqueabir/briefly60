"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import { AlertTriangle, Crown, X } from "lucide-react";

interface SubscriptionRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional reference ID to track which specific item triggered the requirement
   */
  referenceId?: string;
  /**
   * Callback to check if action should proceed
   * Returns true if action is allowed, false otherwise
   */
  onActionAttempt?: () => boolean;
}

/**
 * Subscription wrapper component
 * Wraps children and requires both authentication and subscription before allowing interaction
 * Shows appropriate dialog based on user state
 */
export default function SubscriptionRequired({
  children,
  fallback,
  referenceId,
  onActionAttempt,
}: SubscriptionRequiredProps) {
  const { user, loading: auth_loading } = useAuth();
  const { has_premium, is_loading: subscription_loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"auth" | "subscription">("auth");

  const checkAccess = (): boolean => {
    if (auth_loading || subscription_loading) {
      return false; // Wait for state to load
    }

    if (!user) {
      setDialogType("auth");
      setShowDialog(true);
      return false;
    }

    if (!has_premium) {
      setDialogType("subscription");
      setShowDialog(true);
      return false;
    }

    return true;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // Use capture phase to intercept events before they reach children
    if (!checkAccess()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // If onActionAttempt is provided, call it to determine if action should proceed
    if (onActionAttempt && !onActionAttempt()) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleLoginRedirect = () => {
    // Build return URL with current path and reference ID
    const currentUrl = pathname;
    const params = new URLSearchParams(searchParams);

    // Add reference ID if provided
    if (referenceId) {
      params.set("ref", referenceId);
    }

    const queryString = params.toString();
    const returnUrl = queryString ? `${currentUrl}?${queryString}` : currentUrl;

    // Navigate to login with return URL
    router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleSubscriptionRedirect = () => {
    router.push("/subscription");
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  // If user is authenticated and has premium, render children normally
  if (user && has_premium) {
    return <>{children}</>;
  }

  // If loading, show fallback or children (but still wrap with protection)
  if (auth_loading || subscription_loading) {
    return (
      <>
        <div onClickCapture={handleClickCapture} className="contents">
          {fallback || children}
        </div>
      </>
    );
  }

  // User needs auth or subscription - wrap with click handler
  return (
    <>
      <div onClickCapture={handleClickCapture} className="contents">
        {children}
      </div>

      {/* Authentication Required Dialog */}
      {showDialog && dialogType === "auth" && (
        <div className="fixed inset-0 z-10000 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
              {/* Header with warning color */}
              <div className="bg-warning/10 dark:bg-warning/20 border-b border-warning/20 dark:border-warning/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-warning/20 dark:bg-warning/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      লগইন প্রয়োজন
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-foreground leading-relaxed">
                  এই ফিচারটি ব্যবহার করার জন্য আপনাকে লগইন করতে হবে।
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  লগইন করার পর আপনি এই পেজে ফিরে আসবেন।
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 pt-0">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-sm"
                >
                  লগইন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Required Dialog */}
      {showDialog && dialogType === "subscription" && (
        <div className="fixed inset-0 z-10000 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
              {/* Header with premium color */}
              <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary/20 dark:border-primary/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      প্রিমিয়াম ফিচার
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-foreground leading-relaxed">
                  এই ফিচারটি ব্যবহার করার জন্য আপনার একটি পেইড সাবস্ক্রিপশন
                  প্রয়োজন।
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  আমাদের প্রিমিয়াম প্ল্যান দেখুন এবং সব ফিচার আনলক করুন।
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 pt-0">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleSubscriptionRedirect}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-sm"
                >
                  প্ল্যান দেখুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook to check if user has required access (auth + subscription)
 * Returns a function that checks access and shows appropriate modal if needed
 */
export function useSubscriptionCheck() {
  const { user, loading: auth_loading } = useAuth();
  const { has_premium, is_loading: subscription_loading } = useSubscription();

  const checkAccess = (): boolean => {
    if (auth_loading || subscription_loading) {
      return false;
    }

    if (!user || !has_premium) {
      return false;
    }

    return true;
  };

  return {
    checkAccess,
    has_premium,
    user,
    is_loading: auth_loading || subscription_loading,
  };
}
