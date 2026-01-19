"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  User,
  LogIn,
  Bookmark,
  Brain,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MobileBottomNav: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Search",
      href: "/discover",
      icon: Search,
    },
    ...(isAuthenticated
      ? [
          {
            label: "Saved",
            href: "/bookmarks",
            icon: Bookmark,
          },
          {
            label: "Quizzes",
            href: "/quiz-history",
            icon: Brain,
          },
        ]
      : []),
    {
      label: isAuthenticated ? "Profile" : "Login",
      href: isAuthenticated ? "/profile" : "/auth/login",
      icon: isAuthenticated ? User : LogIn,
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              // Handle Profile/Login item specially
              if (item.label === "Profile" && isAuthenticated) {
                return (
                  <button
                    key="profile-menu"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[70px]",
                      pathname === "/profile" || pathname === "/settings"
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "transition-all duration-200",
                        pathname === "/profile" || pathname === "/settings"
                          ? "size-6"
                          : "size-5",
                      )}
                      strokeWidth={
                        pathname === "/profile" || pathname === "/settings"
                          ? 2.5
                          : 2
                      }
                    />
                    <span
                      className={cn(
                        "text-xs font-medium transition-all duration-200",
                        pathname === "/profile" || pathname === "/settings"
                          ? "font-semibold"
                          : "font-normal",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[70px]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "size-6" : "size-5",
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isActive ? "font-semibold" : "font-normal",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Profile Menu */}
      {isMenuOpen && isAuthenticated && (
        <>
          {/* Backdrop with fade-in animation */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Bottom Sheet with slide-up animation */}
          <div className="fixed bottom-0 left-0 right-0 h-[50vh] bg-background border-t border-border rounded-t-3xl shadow-2xl z-50 md:hidden overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* User Info */}
            <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10">
              <p className="text-base font-semibold truncate">{user?.name}</p>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {user?.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent active:bg-accent/80 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <User className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent active:bg-accent/80 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Settings className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Settings</span>
              </Link>
              <Link
                href="/subscription"
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent active:bg-accent/80 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Subscription</span>
              </Link>
            </div>

            {/* Logout Button */}
            <div className="border-t border-border py-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors w-full text-left group"
              >
                <div className="p-1.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                  <LogOut className="size-4" />
                </div>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileBottomNav;
