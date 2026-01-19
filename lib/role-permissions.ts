import { UserRole } from "@/types/auth.types";

export type Permission =
  | "view_dashboard"
  | "view_analytics"
  | "view_articles"
  | "create_article"
  | "edit_article"
  | "delete_article"
  | "publish_article"
  | "view_users"
  | "create_user"
  | "edit_user"
  | "delete_user"
  | "change_user_role"
  | "view_categories"
  | "manage_categories"
  | "view_stats"
  | "view_own_profile"
  | "view_own_bookmarks";

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

export const ROLE_PERMISSIONS: RolePermissions = {
  superadmin: [
    "view_dashboard",
    "view_analytics",
    "view_articles",
    "create_article",
    "edit_article",
    "delete_article",
    "publish_article",
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    "change_user_role",
    "view_categories",
    "manage_categories",
    "view_stats",
    "view_own_profile",
    "view_own_bookmarks",
  ],
  admin: [
    "view_dashboard",
    "view_analytics",
    "view_articles",
    "create_article",
    "edit_article",
    "delete_article",
    "publish_article",
    "view_users",
    "create_user",
    "edit_user",
    "delete_user",
    // Note: admin cannot change_user_role
    "view_categories",
    "manage_categories",
    "view_stats",
    "view_own_profile",
    "view_own_bookmarks",
  ],
  editor: [
    "view_dashboard",
    "view_articles",
    "create_article",
    "edit_article",
    "delete_article",
    "publish_article",
    "view_categories",
    "view_own_profile",
    "view_own_bookmarks",
  ],
  user: [
    "view_own_profile",
    "view_own_bookmarks",
    // Users don't have dashboard access
  ],
};

export const hasPermission = (
  userRole: UserRole | undefined,
  permission: Permission,
): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (
  userRole: UserRole | undefined,
  permissions: Permission[],
): boolean => {
  if (!userRole) return false;
  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (
  userRole: UserRole | undefined,
  permissions: Permission[],
): boolean => {
  if (!userRole) return false;
  return permissions.every((permission) => hasPermission(userRole, permission));
};

export const canAccessDashboard = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, "view_dashboard");
};
