/**
 * Admin-specific types for managing articles and users
 */

import { ArticleStatus } from "./news.types";
import { User } from "./auth.types";

/**
 * User roles for RBAC
 */
export type UserRole = "superadmin" | "admin" | "editor" | "user";

/**
 * User status for admin management
 */
export type UserStatus = "active" | "inactive" | "banned";

/**
 * Extended user type for admin panel
 */
export interface AdminUser extends User {
  status: UserStatus;
  role: UserRole;
  date_created: string;
  last_login?: string;
  total_articles_read?: number;
  preferences?: UserPreferences;
}

/**
 * User preferences stored in MongoDB
 */
export interface UserPreferences {
  categories?: string[];
  language?: "bn" | "en";
  notifications_enabled?: boolean;
  theme?: "light" | "dark" | "system";
}

/**
 * Article management filters
 */
export interface AdminArticleFilters {
  status?: ArticleStatus;
  category?: string;
  source_name?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  importance_min?: number;
  importance_max?: number;
  clickbait_min?: number;
  clickbait_max?: number;
}

/**
 * User management filters
 */
export interface AdminUserFilters {
  status?: UserStatus;
  role?: UserRole;
  plan?: "free" | "pro" | "enterprise";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  rbac?: string;
  registered_from?: string;
  registered_to?: string;
}

/**
 * Bulk action types
 */
export type BulkArticleAction = "delete" | "publish" | "unpublish" | "archive";
export type BulkUserAction =
  | "activate"
  | "deactivate"
  | "ban"
  | "delete"
  | "promote"
  | "demote";

/**
 * Bulk operation payload
 */
export interface BulkActionPayload {
  ids: string[];
  action: BulkArticleAction | BulkUserAction;
}

/**
 * Bulk operation result
 */
export interface BulkActionResult {
  success: number;
  failed: number;
  errors?: { id: string; error: string }[];
}

/**
 * Article form data for create/edit
 */
export interface ArticleFormData {
  title: string;
  content: string;
  category: string;
  banner?: string;
  source_name: string;
  source_url: string;
  published_at: string;
  status: ArticleStatus;
  importance?: number;
  keywords?: string[];
  mcqs?: {
    question: string;
    options: string[];
    correct_answer: string;
  }[];
}

/**
 * Admin dashboard stats
 */
export interface AdminDashboardStats {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_users: number;
  admin_users: number;
  regular_users: number;
  active_users: number;
  articles_today: number;
  users_today: number;
}

/**
 * Pagination metadata for admin tables
 */
export interface AdminPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Admin API response
 */
export interface AdminApiResponse<T> {
  data: T;
  meta?: AdminPaginationMeta;
  success: boolean;
  error?: string;
}
