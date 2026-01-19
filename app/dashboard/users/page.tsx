"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminUser, AdminUserFilters, UserStatus } from "@/types/admin.types";
import { UserRole } from "@/types/auth.types";
import { DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RoleManagementModal } from "@/components/admin/RoleManagementModal";
import { toast, ToastContainer } from "@/components/admin/Toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePrivateAxios from "@/hooks/use-private-axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/use-role-access";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AdminUserFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [userDetailsModal, setUserDetailsModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
  }>({ isOpen: false, user: null });
  const [roleManagementModal, setRoleManagementModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
  }>({ isOpen: false, user: null });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "delete" | "ban" | "activate" | null;
    userId: string | null;
  }>({ isOpen: false, action: null, userId: null });
  const axios = usePrivateAxios();
  const { user: currentUser } = useAuth();
  const { hasPermission, isSuperAdmin } = useRoleAccess();
  const router = useRouter();
  const canViewUsers = hasPermission("view_users");

  const limit = 20;

  // Check permissions on mount
  useEffect(() => {
    if (!canViewUsers) {
      router.push("/dashboard");
      toast.error("You don't have permission to view users");
    }
  }, [canViewUsers, router]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        page: page.toString(),
        limit: limit.toString(),
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.plan) params.plan = filters.plan;
      if (filters.rbac) params.rbac = filters.rbac;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const response = await axios.get("/api/dashboard/users", { params });

      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.meta?.totalPages || 1);
        setTotalItems(response.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, filters, axios]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = useCallback(() => {
    setFilters({ ...filters, search: searchTerm });
    setPage(1);
  }, [filters, searchTerm]);

  const handleUserAction = useCallback(
    async (action: "delete" | "ban" | "activate", userId: string) => {
      try {
        if (action === "delete") {
          await axios.delete(`/api/dashboard/users/${userId}`);
          toast.success("User deleted successfully");
        } else {
          const status = action === "ban" ? "banned" : "active";
          await axios.patch(`/api/dashboard/users/${userId}`, { status });
          toast.success(`User ${action}d successfully`);
        }

        loadUsers();
      } catch (error) {
        console.error(`Failed to ${action} user:`, error);
        toast.error(`Failed to ${action} user`);
      }
    },
    [axios, loadUsers],
  );

  const handleBulkAction = useCallback(
    async (action: "activate" | "ban" | "delete") => {
      try {
        const ids = Array.from(selectedRows);
        const response = await axios.post("/api/dashboard/users/bulk", {
          ids,
          action,
        });

        toast.success(
          `${response.data.data.success} users updated successfully${
            response.data.data.failed > 0
              ? `, ${response.data.data.failed} failed`
              : ""
          }`,
        );
        setSelectedRows(new Set());
        loadUsers();
      } catch (error) {
        console.error("Failed to bulk action:", error);
        toast.error("Failed to perform bulk action");
      }
    },
    [selectedRows, axios, loadUsers],
  );

  const handleUpdateRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      try {
        await axios.patch(`/api/dashboard/users/${userId}`, { role: newRole });
        toast.success("User role updated successfully");
        loadUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Failed to update role:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to update user role";
        toast.error(errorMessage);
        throw error;
      }
    },
    [axios, loadUsers],
  );

  const handleRowSelect = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedRows);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedRows(newSelected);
    },
    [selectedRows],
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRows(new Set(users.map((u) => u.id)));
      } else {
        setSelectedRows(new Set());
      }
    },
    [users],
  );

  const columns = [
    {
      key: "name",
      label: "User",
      render: (user: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {user.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      render: (user: AdminUser) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            user.plan === "pro"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : user.plan === "enterprise"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {user.plan || "free"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user: AdminUser) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : user.status === "banned"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      key: "date_created",
      label: "Registered",
      render: (user: AdminUser) => (
        <span className="text-sm">
          {new Date(user.date_created).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "role",
      label: "RBAC (Role)",
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium capitalize ${
              user.rbac === "superadmin"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                : user.rbac === "admin"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : user.rbac === "editor"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            {user.rbac || "user"}
          </span>
          {hasPermission("change_user_role") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRoleManagementModal({ isOpen: true, user });
              }}
              className="text-xs text-primary hover:text-primary/80 underline"
              title="Manage Role"
            >
              <Edit className="size-4" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "date_updated",
      label: "Last Updated",
      render: (user: AdminUser) => (
        <span className="text-sm">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(user as any).date_updated
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new Date((user as any).date_updated).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserDetailsModal({ isOpen: true, user });
            }}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View
          </button>
          {hasPermission("edit_user") && (
            <>
              {user.status !== "active" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmModal({
                      isOpen: true,
                      action: "activate",
                      userId: user.id,
                    });
                  }}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Activate
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmModal({
                      isOpen: true,
                      action: "ban",
                      userId: user.id,
                    });
                  }}
                  className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  Ban
                </button>
              )}
            </>
          )}
          {hasPermission("delete_user") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmModal({
                  isOpen: true,
                  action: "delete",
                  userId: user.id,
                });
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground">
            Manage all users and their accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 h-10 px-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
              <button
                onClick={handleSearch}
                className="h-10 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === "all" ? undefined : (value as UserStatus),
              })
            }
          >
            <SelectTrigger className="w-full py-5">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          {/* Plan Filter */}
          <Select
            value={filters.plan || "all"}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                plan:
                  value === "all"
                    ? undefined
                    : (value as "free" | "pro" | "enterprise"),
              })
            }
          >
            <SelectTrigger className="w-full py-5">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && hasPermission("edit_user") && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl border-2 border-primary shadow-2xl p-4 md:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {selectedRows.size}
                </span>
                user{selectedRows.size > 1 ? "s" : ""} selected
              </p>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("ban")}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                >
                  Ban
                </button>
                {hasPermission("delete_user") && (
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <DataTable
          data={users}
          columns={columns}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          loading={loading}
          emptyMessage="No users found"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={limit}
        />
      )}

      {/* User Details Modal */}
      {userDetailsModal.isOpen && userDetailsModal.user && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setUserDetailsModal({ isOpen: false, user: null })}
        >
          <div
            className="bg-card rounded-lg border border-border max-w-2xl w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                User Details
              </h3>
              <button
                onClick={() =>
                  setUserDetailsModal({ isOpen: false, user: null })
                }
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  {userDetailsModal.user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h4 className="text-xl font-semibold">
                    {userDetailsModal.user.name}
                  </h4>
                  <p className="text-muted-foreground">
                    {userDetailsModal.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">
                    {userDetailsModal.user.plan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">
                    {userDetailsModal.user.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {new Date(
                      userDetailsModal.user.date_created,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {userDetailsModal.user.last_login
                      ? new Date(
                          userDetailsModal.user.last_login,
                        ).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Articles Read</p>
                  <p className="font-medium">
                    {userDetailsModal.user.total_articles_read || 0}
                  </p>
                </div>
              </div>

              {userDetailsModal.user.preferences && (
                <div className="pt-4 border-t border-border">
                  <h5 className="font-semibold mb-2">Preferences</h5>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Language:</span>{" "}
                      {userDetailsModal.user.preferences.language || "Not set"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Theme:</span>{" "}
                      {userDetailsModal.user.preferences.theme || "Not set"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Notifications:
                      </span>{" "}
                      {userDetailsModal.user.preferences.notifications_enabled
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      <RoleManagementModal
        isOpen={roleManagementModal.isOpen}
        user={roleManagementModal.user}
        currentUserRole={currentUser?.rbac}
        onClose={() => setRoleManagementModal({ isOpen: false, user: null })}
        onUpdateRole={handleUpdateRole}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, action: null, userId: null })
        }
        onConfirm={() => {
          if (confirmModal.action && confirmModal.userId) {
            handleUserAction(confirmModal.action, confirmModal.userId);
          }
        }}
        title={`${
          confirmModal.action === "delete"
            ? "Delete"
            : confirmModal.action === "ban"
              ? "Ban"
              : "Activate"
        } User`}
        message={`Are you sure you want to ${confirmModal.action} this user?${
          confirmModal.action === "delete"
            ? " This action cannot be undone."
            : ""
        }`}
        confirmText={
          confirmModal.action === "delete"
            ? "Delete"
            : confirmModal.action === "ban"
              ? "Ban"
              : "Activate"
        }
        type={confirmModal.action === "delete" ? "danger" : "warning"}
      />
    </div>
  );
}
