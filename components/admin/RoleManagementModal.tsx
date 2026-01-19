"use client";

import { AdminUser } from "@/types/admin.types";
import { UserRole } from "@/types/auth.types";
import { useState, useEffect } from "react";

interface RoleManagementModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  currentUserRole: UserRole | undefined;
  onClose: () => void;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

export function RoleManagementModal({
  isOpen,
  user,
  currentUserRole,
  onClose,
  onUpdateRole,
}: RoleManagementModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    user?.role || "user",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update selected role when user changes
  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: "superadmin",
      label: "Super Admin",
      description: "Full access including role management",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Can manage articles and users",
    },
    {
      value: "editor",
      label: "Editor",
      description: "Can create and edit articles",
    },
    {
      value: "user",
      label: "User",
      description: "Regular user with basic access",
    },
  ];

  const isSuperAdmin = currentUserRole === "superadmin";

  const handleSubmit = async () => {
    if (!isSuperAdmin) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdateRole(user.id, selectedRole);
      onClose();
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground">
            Manage User Role
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!isSuperAdmin ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  Access Denied
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Only superadmin users can change user roles.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              {user.first_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.first_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Current Role: <span className="text-primary">{user.role}</span>
            </label>

            <div className="space-y-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  } ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as UserRole)
                    }
                    disabled={!isSuperAdmin}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{role.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !isSuperAdmin || isSubmitting || selectedRole === user.role
            }
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
