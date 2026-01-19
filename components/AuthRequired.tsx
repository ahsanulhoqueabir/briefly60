"use client";

import { useAuth } from "@/contexts/AuthContext";
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

interface AuthRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional reference ID to track which specific item triggered the auth requirement
   * This will be passed back after successful authentication
   */
  referenceId?: string;
}

/**
 * Authentication wrapper component
 * Wraps children and requires authentication before allowing interaction
 * Shows a dialog if user is not authenticated
 */
export default function AuthRequired({
  children,
  fallback,
  referenceId,
}: AuthRequiredProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (loading) {
      return; // Wait for auth state to load
    }

    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setShowDialog(true);
    }
    // If user is authenticated, allow the click to propagate normally
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

  const handleCancel = () => {
    setShowDialog(false);
  };

  // If loading, show fallback or loading state (DON'T render children)
  if (loading) {
    return <>{fallback || null}</>;
  }

  // If user is authenticated, render children normally
  if (user) {
    return <>{children}</>;
  }

  // User is not authenticated - show fallback or placeholder
  // DON'T render children to prevent API requests
  return (
    <>
      <div onClick={handleClick} className="contents">
        {fallback || children}
      </div>

      {/* Authentication Required Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অথেন্টিকেশন প্রয়োজন</AlertDialogTitle>
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
    </>
  );
}
