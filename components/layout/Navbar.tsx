"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  User as UserIcon,
  LogIn,
  LayoutDashboard,
  Bookmark,
  Brain,
  CreditCard,
  LogOut,
  ChevronDown,
  Settings,
  Menu,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCacheClear } from "@/hooks/use-cache-clear";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { clear_cache, is_clearing } = useCacheClear();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      setIsMobileMenuOpen(false);
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

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

          {/* Desktop Navigation - Only show on large screens */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-6">
            {/* Main Navigation */}
            <div className="flex items-center space-x-1 xl:space-x-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Navigation (authenticated only) */}
            {isAuthenticated && userNavItems.length > 0 && (
              <>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center space-x-1 xl:space-x-2">
                  {userNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        )}
                      >
                        <Icon className="size-4" />
                        <span className="hidden xl:inline">{item.label}</span>
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
                    "flex items-center gap-2 px-2 xl:px-3 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                    pathname === dashboardItem.href
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <dashboardItem.icon className="size-4" />
                  <span className="hidden xl:inline">
                    {dashboardItem.label}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Menu - Large screens only */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className={cn(
                    "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <UserIcon className="size-4" />
                  <span className="hidden xl:inline max-w-[120px] truncate">
                    {user?.name || "Account"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      isDropdownOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserIcon className="size-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="size-4" />
                        Settings
                      </Link>
                      <Link
                        href="/subscription"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <CreditCard className="size-4" />
                        Subscription
                      </Link>
                      <button
                        onClick={() => {
                          clear_cache();
                          setIsDropdownOpen(false);
                        }}
                        disabled={is_clearing}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-4" />
                        {is_clearing ? "Clearing..." : "Clear Cache"}
                      </button>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors w-full text-left"
                      >
                        <LogOut className="size-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={profileItem.href}
                className={cn(
                  "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all font-inter",
                  pathname === profileItem.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <profileItem.icon className="size-4" />
                <span className="hidden xl:inline">{profileItem.label}</span>
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile & Tablet Menu */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Sheet Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-full p-0 flex flex-col">
          <SheetHeader className="px-6 py-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Logo size="md" />
            </div>
          </SheetHeader>

          {/* Navigation Grid */}
          <div className="flex-1 overflow-y-auto px-6 ">
            <SheetTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Navigation
            </SheetTitle>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Main Navigation */}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    <Icon className="size-8" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* User Navigation */}
              {isAuthenticated &&
                userNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-accent",
                      )}
                    >
                      <Icon
                        className="size-8"
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}

              {/* Dashboard */}
              {dashboardItem && (
                <Link
                  href={dashboardItem.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                    pathname === dashboardItem.href
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-accent",
                  )}
                >
                  <dashboardItem.icon
                    className="size-8"
                    strokeWidth={pathname === dashboardItem.href ? 2.5 : 2}
                  />
                  <span className="text-sm font-medium">
                    {dashboardItem.label}
                  </span>
                </Link>
              )}
            </div>

            {/* Account Section */}
            {isAuthenticated ? (
              <>
                <SheetTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Account
                </SheetTitle>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                      pathname === "/profile"
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    <UserIcon
                      className="size-8"
                      strokeWidth={pathname === "/profile" ? 2.5 : 2}
                    />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all",
                      pathname === "/settings"
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    <Settings
                      className="size-8"
                      strokeWidth={pathname === "/settings" ? 2.5 : 2}
                    />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      clear_cache();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={is_clearing}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="size-8" strokeWidth={2} />
                    <span className="text-sm font-medium">
                      {is_clearing ? "Clearing..." : "Clear Cache"}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-all col-span-2"
                  >
                    <LogOut className="size-8" strokeWidth={2} />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <SheetTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Account
                </SheetTitle>
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg"
                  >
                    <LogIn className="size-6" />
                    <span className="text-base font-semibold">Login</span>
                  </Link>
                  <button
                    onClick={() => {
                      clear_cache();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={is_clearing}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    <Trash2 className="size-5" />
                    <span className="text-sm font-medium">
                      {is_clearing ? "Clearing..." : "Clear Cache"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
          {isAuthenticated && user && (
            <div className="mt-4 p-4 border-t border-border">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {user.email}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
