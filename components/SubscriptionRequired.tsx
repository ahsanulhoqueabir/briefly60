"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubscriptionRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional reference ID to track which specific item triggered the requirement
   */
  referenceId?: string;
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
}: SubscriptionRequiredProps) {
  const { user, loading: auth_loading } = useAuth();
  const { has_premium, is_loading: subscription_loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"auth" | "subscription">("auth");

  const handleClick = (e: React.MouseEvent) => {
    if (auth_loading || subscription_loading) {
      return; // Wait for state to load
    }

    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setDialogType("auth");
      setShowDialog(true);
      return;
    }

    if (!has_premium) {
      e.preventDefault();
      e.stopPropagation();
      setDialogType("subscription");
      setShowDialog(true);
      return;
    }

    // If user is authenticated and has premium, allow the click to propagate normally
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
    router.push(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
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

  // If loading, show fallback or children
  if (auth_loading || subscription_loading) {
    return <>{fallback || children}</>;
  }

  // User needs auth or subscription - wrap with click handler
  return (
    <>
      <div onClick={handleClick} className="contents">
        {children}
      </div>

      {/* Authentication Required Dialog */}
      <AlertDialog
        open={showDialog && dialogType === "auth"}
        onOpenChange={setShowDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>লগইন প্রয়োজন</AlertDialogTitle>
            <AlertDialogDescription>
              এই ফিচারটি ব্যবহার করার জন্য আপনাকে লগইন করতে হবে। আপনি কি এখন
              লগইন পেজে যেতে চান?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              বাতিল করুন
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              লগইন করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Required Dialog */}
      <AlertDialog
        open={showDialog && dialogType === "subscription"}
        onOpenChange={setShowDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>সাবস্ক্রিপশন প্রয়োজন</AlertDialogTitle>
            <AlertDialogDescription>
              এই ফিচারটি ব্যবহার করার জন্য আপনার একটি পেইড সাবস্ক্রিপশন
              প্রয়োজন। আপনি কি এখন সাবস্ক্রিপশন পেজে যেতে চান?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              বাতিল করুন
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubscriptionRedirect}>
              প্ল্যান দেখুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
