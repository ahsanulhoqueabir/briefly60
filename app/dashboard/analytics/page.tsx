"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import usePrivateAxios from "@/hooks/use-private-axios";
import type { AnalyticsData } from "@/types/analytics.types";
import StatCard from "@/components/admin/StatCard";
import AnalyticsBarChart from "@/components/admin/charts/AnalyticsBarChart";
import AnalyticsLineChart from "@/components/admin/charts/AnalyticsLineChart";
import AnalyticsDonutChart from "@/components/admin/charts/AnalyticsDonutChart";

const COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#ef4444",
};

export default function AnalyticsPage() {
  const privateAxios = usePrivateAxios();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await privateAxios.get("/api/dashboard/analytics");
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [privateAxios]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const { overview } = analytics;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          News Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Deep insights into your news content and clickbait patterns
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Articles"
          value={overview.totalArticles}
          subtitle="Published articles"
          icon={
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          }
          color="bg-primary"
          delay={0}
        />
        <StatCard
          title="Avg Clickbait Score"
          value={overview.avgClickbaitScore.toFixed(2)}
          subtitle="out of 10"
          trend={
            overview.avgClickbaitScore >= 7
              ? "up"
              : overview.avgClickbaitScore <= 3
              ? "down"
              : "neutral"
          }
          trendValue={
            overview.avgClickbaitScore >= 7
              ? "High"
              : overview.avgClickbaitScore <= 3
              ? "Low"
              : "Medium"
          }
          icon={
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          color="bg-yellow-500"
          delay={0.1}
        />
        <StatCard
          title="High Clickbait"
          value={overview.highClickbaitCount}
          subtitle={`${(
            (overview.highClickbaitCount / overview.totalArticles) *
            100
          ).toFixed(1)}% of total`}
          icon={
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
          color="bg-red-500"
          delay={0.2}
        />
        <StatCard
          title="Categories"
          value={overview.categoriesCount}
          subtitle="Unique categories"
          icon={
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          }
          color="bg-primary"
          delay={0.3}
        />
      </div>

      {/* Publishing Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Today</p>
          <p className="text-2xl font-bold text-foreground">
            {overview.publishedToday}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-2xl font-bold text-foreground">
            {overview.publishedThisWeek}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-2xl font-bold text-foreground">
            {overview.publishedThisMonth}
          </p>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Clickbait Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Clickbait Score Distribution
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            How articles are distributed across clickbait severity levels
          </p>
          <AnalyticsDonutChart
            data={analytics.clickbaitDistribution.map((d) => ({
              label:
                d.score === 0
                  ? "Low (0-3)"
                  : d.score === 4
                  ? "Medium (4-6)"
                  : "High (7-10)",
              value: d.count,
              color:
                d.score === 0
                  ? COLORS.low
                  : d.score === 4
                  ? COLORS.medium
                  : COLORS.high,
            }))}
            height={350}
          />
        </motion.div>

        {/* Clickbait Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            7-Day Clickbait Trend
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Average clickbait score over the last week
          </p>
          <AnalyticsLineChart
            data={analytics.clickbaitTrends.map((t) => ({
              label: new Date(t.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              value: t.avgScore,
            }))}
            height={280}
            color="hsl(var(--secondary))"
          />
        </motion.div>
      </div>

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border rounded-xl p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">
          Category Performance
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Article count and average clickbait score by category
        </p>
        <AnalyticsBarChart
          data={analytics.categoryDistribution.slice(0, 8).map((c) => ({
            label: c.category,
            value: c.count,
            color:
              c.avgClickbaitScore >= 7
                ? COLORS.high
                : c.avgClickbaitScore >= 4
                ? COLORS.medium
                : COLORS.low,
          }))}
          height={320}
        />
      </motion.div>

      {/* Hourly Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card border border-border rounded-xl p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">
          Publishing Time Distribution
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          When articles are typically published throughout the day
        </p>
        <AnalyticsBarChart
          data={analytics.hourlyDistribution.map((h) => ({
            label: `${h.hour}:00`,
            value: h.count,
            color: "#21808d", // Branded primary teal color
          }))}
          height={280}
        />
      </motion.div>

      {/* Top Clickbait Reasons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">
          Top Clickbait Reasons
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Most common reasons why articles are flagged as clickbait
        </p>
        <div className="space-y-4">
          {analytics.topClickbaitReasons.slice(0, 5).map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground mb-1 line-clamp-2">
                  {reason.reason}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Count: {reason.count}</span>
                  <span>Avg Score: {reason.avgScore.toFixed(2)}</span>
                </div>
              </div>
              <div className="shrink-0">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reason.avgScore >= 7
                      ? "bg-red-500/20 text-red-500"
                      : reason.avgScore >= 4
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-green-500/20 text-green-500"
                  }`}
                >
                  {reason.avgScore >= 7
                    ? "High"
                    : reason.avgScore >= 4
                    ? "Medium"
                    : "Low"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Source Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-card border border-border rounded-xl p-6 mt-8"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">
          News Source Comparison
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Performance metrics across different news sources
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Article Count by Source */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Article Count by Source
            </h3>
            <AnalyticsBarChart
              data={analytics.sourceDistribution.slice(0, 10).map((s) => ({
                label: s.source,
                value: s.count,
                color: "#21808d",
              }))}
              height={320}
            />
          </div>

          {/* Bar Chart - Average Clickbait Score by Source */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Avg Clickbait Score by Source
            </h3>
            <AnalyticsBarChart
              data={analytics.sourceDistribution.slice(0, 10).map((s) => ({
                label: s.source,
                value: parseFloat(s.avgClickbaitScore.toFixed(2)),
                color:
                  s.avgClickbaitScore >= 7
                    ? COLORS.high
                    : s.avgClickbaitScore >= 4
                    ? COLORS.medium
                    : COLORS.low,
              }))}
              height={320}
            />
          </div>
        </div>

        {/* Source Details Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Source
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  Articles
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  Share
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  Avg Score
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  High Clickbait
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">
                  Quality
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.sourceDistribution
                .slice(0, 10)
                .map((source, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {source.source}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-muted-foreground">
                      {source.count}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-muted-foreground">
                      {source.percentage.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span
                        className={`font-semibold ${
                          source.avgClickbaitScore >= 7
                            ? "text-red-500"
                            : source.avgClickbaitScore >= 4
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {source.avgClickbaitScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-muted-foreground">
                      {source.highClickbaitCount} (
                      {(
                        (source.highClickbaitCount / source.count) *
                        100
                      ).toFixed(1)}
                      %)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          source.avgClickbaitScore >= 7
                            ? "bg-red-500/20 text-red-500"
                            : source.avgClickbaitScore >= 4
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {source.avgClickbaitScore >= 7
                          ? "Low"
                          : source.avgClickbaitScore >= 4
                          ? "Medium"
                          : "High"}
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
