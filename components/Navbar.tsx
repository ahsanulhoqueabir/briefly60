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

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/discover", icon: Search },
    ...(hasDashboardAccess
      ? [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }]
      : []),
    {
      label: isAuthenticated ? "Profile" : "Login",
      href: isAuthenticated ? "/profile" : "/auth/login",
      icon: isAuthenticated ? UserIcon : LogIn,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
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
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center">
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
