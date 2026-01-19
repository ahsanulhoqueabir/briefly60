import dbConnect from "@/lib/mongodb";
import Article, { IArticle } from "@/models/Article.model";
import type { AnalyticsData } from "@/types/analytics.types";

interface ArticleAnalytics {
  _id: string;
  clickbait_score: number;
  clickbait_reason: string;
  category: string;
  importance: number;
  createdAt: string;
  published_at: string;
  source_name: string;
}

export const analyticsService = {
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      await dbConnect();

      // Fetch all published articles
      const articles: IArticle[] = await Article.find({ status: "published" })
        .select(
          [
            "_id",
            "clickbait_score",
            "clickbait_reason",
            "category",
            "importance",
            "createdAt",
            "published_at",
            "source_name",
          ].join(" "),
        )
        .exec();

      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Overview calculations
      const totalArticles = articles.length;
      const avgClickbaitScore =
        articles.reduce(
          (sum: number, a: IArticle) => sum + (a.clickbait_score || 0),
          0,
        ) / totalArticles || 0;
      const highClickbaitCount = articles.filter(
        (a: IArticle) => (a.clickbait_score || 0) >= 7,
      ).length;
      const lowClickbaitCount = articles.filter(
        (a: IArticle) => (a.clickbait_score || 0) <= 3,
      ).length;
      const categoriesCount = new Set(
        articles.map((a: IArticle) => a.category).filter(Boolean),
      ).size;

      const publishedToday = articles.filter(
        (a: IArticle) =>
          a.published_at && new Date(a.published_at) >= todayStart,
      ).length;
      const publishedThisWeek = articles.filter(
        (a: IArticle) =>
          a.published_at && new Date(a.published_at) >= weekStart,
      ).length;
      const publishedThisMonth = articles.filter(
        (a: IArticle) =>
          a.published_at && new Date(a.published_at) >= monthStart,
      ).length;

      // Clickbait distribution (0-3, 4-6, 7-10)
      const clickbaitRanges = [
        { min: 0, max: 3, label: "Low" },
        { min: 4, max: 6, label: "Medium" },
        { min: 7, max: 10, label: "High" },
      ];

      const clickbaitDistribution = clickbaitRanges.map((range) => {
        const count = articles.filter(
          (a: IArticle) =>
            (a.clickbait_score || 0) >= range.min &&
            (a.clickbait_score || 0) <= range.max,
        ).length;
        return {
          score: range.min,
          count,
          percentage: totalArticles > 0 ? (count / totalArticles) * 100 : 0,
        };
      });

      // Category distribution
      const categoryMap = new Map<string, IArticle[]>();
      articles.forEach((a: IArticle) => {
        const cat = a.category || "Uncategorized";
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, []);
        }
        categoryMap.get(cat)!.push(a);
      });

      const categoryDistribution = Array.from(categoryMap.entries())
        .map(([category, items]) => ({
          category,
          count: items.length,
          percentage: (items.length / totalArticles) * 100,
          avgClickbaitScore:
            items.reduce((sum, a) => sum + (a.clickbait_score || 0), 0) /
            items.length,
        }))
        .sort((a, b) => b.count - a.count);

      // Clickbait trends (last 7 days)
      const trendsMap = new Map<string, { scores: number[]; count: number }>();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        return date.toISOString().split("T")[0];
      }).reverse();

      last7Days.forEach((date) => {
        trendsMap.set(date, { scores: [], count: 0 });
      });

      articles.forEach((a: IArticle) => {
        if (a.published_at) {
          const date = new Date(a.published_at).toISOString().split("T")[0];
          if (trendsMap.has(date)) {
            const trend = trendsMap.get(date)!;
            trend.scores.push(a.clickbait_score || 0);
            trend.count++;
          }
        }
      });

      const clickbaitTrends = Array.from(trendsMap.entries()).map(
        ([date, data]) => ({
          date,
          avgScore:
            data.scores.length > 0
              ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
              : 0,
          count: data.count,
        }),
      );

      // Top clickbait reasons
      const reasonsMap = new Map<string, { scores: number[]; count: number }>();
      articles.forEach((a: IArticle) => {
        if (a.clickbait_reason && a.clickbait_reason.trim()) {
          const reason = a.clickbait_reason.slice(0, 100); // Limit length
          if (!reasonsMap.has(reason)) {
            reasonsMap.set(reason, { scores: [], count: 0 });
          }
          const data = reasonsMap.get(reason)!;
          data.scores.push(a.clickbait_score || 0);
          data.count++;
        }
      });

      const topClickbaitReasons = Array.from(reasonsMap.entries())
        .map(([reason, data]) => ({
          reason,
          count: data.count,
          avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Importance distribution
      const importanceMap = new Map<number, number>();
      articles.forEach((a: IArticle) => {
        const importance = a.importance || 0;
        importanceMap.set(importance, (importanceMap.get(importance) || 0) + 1);
      });

      const importanceDistribution = Array.from(importanceMap.entries())
        .map(([importance, count]) => ({
          importance,
          count,
          percentage: (count / totalArticles) * 100,
        }))
        .sort((a, b) => a.importance - b.importance);

      // Hourly distribution
      const hourlyMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, 0);
      }

      articles.forEach((a: IArticle) => {
        if (a.published_at) {
          const hour = new Date(a.published_at).getHours();
          hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        }
      });

      const hourlyDistribution = Array.from(hourlyMap.entries()).map(
        ([hour, count]) => ({
          hour,
          count,
        }),
      );

      // Source distribution
      const sourceMap = new Map<
        string,
        { count: number; scores: number[]; highClickbait: number }
      >();

      articles.forEach((a: IArticle) => {
        const source = a.source_name || "Unknown";
        if (!sourceMap.has(source)) {
          sourceMap.set(source, { count: 0, scores: [], highClickbait: 0 });
        }
        const sourceData = sourceMap.get(source)!;
        sourceData.count++;
        sourceData.scores.push(a.clickbait_score || 0);
        if ((a.clickbait_score || 0) >= 7) {
          sourceData.highClickbait++;
        }
      });

      const sourceDistribution = Array.from(sourceMap.entries())
        .map(([source, data]) => ({
          source,
          count: data.count,
          percentage: (data.count / totalArticles) * 100,
          avgClickbaitScore:
            data.scores.reduce((sum: number, s: number) => sum + s, 0) /
            data.count,
          highClickbaitCount: data.highClickbait,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        overview: {
          totalArticles,
          avgClickbaitScore: Math.round(avgClickbaitScore * 100) / 100,
          highClickbaitCount,
          lowClickbaitCount,
          categoriesCount,
          publishedToday,
          publishedThisWeek,
          publishedThisMonth,
        },
        clickbaitDistribution,
        categoryDistribution,
        clickbaitTrends,
        topClickbaitReasons,
        importanceDistribution,
        hourlyDistribution,
        sourceDistribution,
      };
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      throw error;
    }
  },
};
