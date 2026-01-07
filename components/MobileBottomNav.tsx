"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

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
    {
      label: isAuthenticated ? "Profile" : "Login",
      href: isAuthenticated ? "/profile" : "/auth/login",
      icon: isAuthenticated ? User : LogIn,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[70px]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "size-6" : "size-5"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    isActive ? "font-semibold" : "font-normal"
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
  );
};

export default MobileBottomNav;
