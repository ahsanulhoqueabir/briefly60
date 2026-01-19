"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  User as UserIcon,
  LogIn,
  LayoutDashboard,
  Bookmark,
  Brain,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  // Check if user has dashboard access
  const hasDashboardAccess =
    user?.rbac && ["admin", "superadmin", "editor"].includes(user.rbac);

  // Main navigation items (always visible)
  const mainNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Discover", href: "/discover", icon: Search },
  ];

  // User-specific items (only for authenticated users)
  const userNavItems = isAuthenticated
    ? [
        { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
        { label: "Quizzes", href: "/quiz-history", icon: Brain },
        { label: "Subscription", href: "/subscription", icon: CreditCard },
      ]
    : [];

  // Dashboard item (only for admin/editor/superadmin)
  const dashboardItem = hasDashboardAccess
    ? { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
    : null;

  // Profile/Login item
  const profileItem = {
    label: isAuthenticated ? "Profile" : "Login",
    href: isAuthenticated ? "/profile" : "/auth/login",
    icon: isAuthenticated ? UserIcon : LogIn,
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Main Navigation */}
            <div className="flex items-center space-x-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Navigation (authenticated only) */}
            {isAuthenticated && userNavItems.length > 0 && (
              <>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center space-x-2">
                  {userNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {/* Dashboard (admin only) */}
            {dashboardItem && (
              <>
                <div className="h-6 w-px bg-border" />
                <Link
                  href={dashboardItem.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                    pathname === dashboardItem.href
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <dashboardItem.icon className="size-4" />
                  {dashboardItem.label}
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href={profileItem.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                pathname === profileItem.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <profileItem.icon className="size-4" />
              {profileItem.label}
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Right Menu - Only Theme Toggle */}
          <div className="md:hidden flex items-center">
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
