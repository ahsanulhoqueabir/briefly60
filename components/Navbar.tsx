"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  TrendingUp,
  Grid3x3,
  User as UserIcon,
  Settings,
  LogIn,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Sliders,
} from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { NEWS_CATEGORIES } from "@/lib/constants";

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Categories", href: "/categories", icon: Grid3x3 },
  ];

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent || Icons.Circle;
  };

  const userDropdownItems = [
    { label: "Profile", href: "/profile", icon: UserIcon },
    { label: "Preferences", href: "/preferences", icon: Sliders },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors font-inter",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            {user && (
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative rounded-md hover:bg-accent">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></span>
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {getUserInitials(user.name)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground hidden lg:block">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      {userDropdownItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors font-inter"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle size="sm" />
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            {/* Main Navigation Items */}
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors font-inter",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}

            {/* Categories Section */}
            <div className="pt-4">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-inter">
                Categories
              </div>
              <div className="grid grid-cols-4 gap-3 px-3 py-2">
                {NEWS_CATEGORIES.map((category) => {
                  const Icon = getIcon(category.icon);
                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 w-8 h-8 mb-1",
                          category.color
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-muted-foreground text-center font-inter leading-tight">
                        {category.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile User Menu */}
            <div className="border-t border-border pt-4 mt-4">
              {/* Theme Toggle Section */}
              <div className="flex items-center justify-between px-3 py-2 mb-2">
                <span className="text-sm font-medium text-foreground font-inter">
                  Theme
                </span>
                <ThemeToggle />
              </div>

              {user ? (
                <>
                  <div className="flex items-center px-3 py-2 mb-2">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {getUserInitials(user.name)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground font-inter">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-inter">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {userDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-inter"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-inter text-left"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-inter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
