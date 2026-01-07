"use client";

import { useEffect, useState } from "react";
import { AdminDashboardStats } from "@/types/admin.types";
import { LocalStorageService } from "@/services/localstorage.services";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = LocalStorageService.getAuthToken();

      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const result = await response.json();

      if (result.success) {
        const { articles, users } = result.data;
        setStats({
          total_articles: articles.total_articles || 0,
          published_articles: articles.published_articles || 0,
          draft_articles: articles.draft_articles || 0,
          total_users: users.total_users || 0,
          active_users: users.active_users || 0,
          articles_today: articles.articles_today || 0,
          users_today: users.users_today || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Article Statistics */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Article Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Articles"
            value={stats?.total_articles || 0}
            variant="primary"
          />
          <StatCard
            title="Published"
            value={stats?.published_articles || 0}
            variant="success"
          />
          <StatCard
            title="Draft"
            value={stats?.draft_articles || 0}
            variant="warning"
          />
          <StatCard
            title="Today's Articles"
            value={stats?.articles_today || 0}
            variant="info"
          />
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          User Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            variant="primary"
          />
          <StatCard
            title="Active Users"
            value={stats?.active_users || 0}
            variant="success"
          />
          <StatCard
            title="New Today"
            value={stats?.users_today || 0}
            variant="info"
          />
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            href="/dashboard/articles/new"
            label="Create Article"
          />
          <QuickActionButton
            href="/dashboard/articles"
            label="Manage Articles"
          />
          <QuickActionButton href="/dashboard/users" label="View Users" />
          <QuickActionButton href="/dashboard/settings" label="Settings" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  variant = "primary",
}: {
  title: string;
  value: number;
  variant?: "primary" | "success" | "warning" | "info";
}) {
  const variantStyles = {
    primary: "border-l-primary/50",
    success: "border-l-green-500/50",
    warning: "border-l-yellow-500/50",
    info: "border-l-blue-500/50",
  };

  return (
    <div
      className={`bg-card rounded-lg border border-border border-l-4 ${variantStyles[variant]} p-5 hover:shadow-md transition-all duration-200`}
    >
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center p-5 bg-card rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
    >
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {label}
      </span>
    </a>
  );
}
