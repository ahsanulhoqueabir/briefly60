import { useAuth } from "@/contexts/AuthContext";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  Permission,
  canAccessDashboard,
} from "@/lib/role-permissions";
import { UserRole } from "@/types/auth.types";
import { useMemo } from "react";

export const useRoleAccess = () => {
  const { user } = useAuth();

  // Memoize to prevent unnecessary re-renders
  const roleAccess = useMemo(() => {
    const userRole = user?.rbac as UserRole | undefined;

    return {
      userRole,
      hasPermission: (permission: Permission) =>
        hasPermission(userRole, permission),
      hasAnyPermission: (permissions: Permission[]) =>
        hasAnyPermission(userRole, permissions),
      hasAllPermissions: (permissions: Permission[]) =>
        hasAllPermissions(userRole, permissions),
      canAccessDashboard: () => canAccessDashboard(userRole),
      isSuperAdmin: userRole === "superadmin",
      isAdmin: userRole === "admin",
      isEditor: userRole === "editor",
      isUser: userRole === "user",
    };
  }, [user?.rbac]);

  return roleAccess;
};
