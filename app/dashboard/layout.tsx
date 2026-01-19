"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderTree,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useRoleAccess } from "@/hooks/use-role-access";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { canAccessDashboard, hasPermission } = useRoleAccess();
  const hasDashboardAccess = canAccessDashboard();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      if (!hasDashboardAccess) {
        router.push("/");
      }
    }
  }, [loading, isAuthenticated, hasDashboardAccess, router]);

  if (loading || !isAuthenticated || !hasDashboardAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? "240px" : "64px",
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="bg-card border-r border-border flex flex-col shadow-sm relative"
      >
        {/* User Profile Section */}
        <div className="border-b border-border p-4">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="user-expanded"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-primary/10">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                      {user?.rbac}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="user-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-primary/10">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
          <NavLink
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            collapsed={!sidebarOpen}
            isActive={pathname === "/dashboard"}
          />
          {hasPermission("view_analytics") && (
            <NavLink
              href="/dashboard/analytics"
              label="Analytics"
              icon={BarChart3}
              collapsed={!sidebarOpen}
              isActive={pathname.startsWith("/dashboard/analytics")}
            />
          )}
          {hasPermission("view_articles") && (
            <NavLink
              href="/dashboard/articles"
              label="Articles"
              icon={FileText}
              collapsed={!sidebarOpen}
              isActive={pathname.startsWith("/dashboard/articles")}
            />
          )}
          {hasPermission("view_users") && (
            <NavLink
              href="/dashboard/users"
              label="Users"
              icon={Users}
              collapsed={!sidebarOpen}
              isActive={pathname.startsWith("/dashboard/users")}
            />
          )}
          {hasPermission("view_categories") && (
            <NavLink
              href="/dashboard/categories"
              label="Categories"
              icon={FolderTree}
              collapsed={!sidebarOpen}
              isActive={pathname.startsWith("/dashboard/categories")}
            />
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 space-y-1 border-t border-border">
          <NavLink
            href="/"
            label="View Site"
            icon={ExternalLink}
            collapsed={!sidebarOpen}
            isExternal
          />

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              signOut();
              router.push("/auth/login");
            }}
            className="w-full px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-3 text-destructive group"
          >
            <LogOut className="h-4 w-4" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border-2 border-border shadow-md flex items-center justify-center hover:border-primary transition-colors z-10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto ">
        <div className="p-4 md:p-6  mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  isExternal = false,
  isActive = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  isExternal?: boolean;
  isActive?: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-3 px-3 py-2 my-1 rounded-lg transition-all group cursor-pointer
          ${
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent text-foreground"
          }
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <Icon
          className={`h-4 w-4 shrink-0 ${
            isActive ? "text-primary-foreground" : "text-muted-foreground "
          }`}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 flex-1"
            >
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-primary-foreground" : ""
                }`}
              >
                {label}
              </span>
              {isExternal && (
                <ExternalLink
                  className={`h-3 w-3 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute left-16 bg-popover text-popover-foreground group-hover:text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-lg border border-border whitespace-nowrap pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}
