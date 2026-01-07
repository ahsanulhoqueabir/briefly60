export interface ClickbaitAnalysis {
  score: number;
  count: number;
  percentage: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  avgClickbaitScore: number;
}

export interface ClickbaitTrend {
  date: string;
  avgScore: number;
  count: number;
}

export interface TopClickbaitReason {
  reason: string;
  count: number;
  avgScore: number;
}

export interface ImportanceDistribution {
  importance: number;
  count: number;
  percentage: number;
}

export interface SourceDistribution {
  source: string;
  count: number;
  percentage: number;
  avgClickbaitScore: number;
  highClickbaitCount: number;
}

export interface AnalyticsOverview {
  totalArticles: number;
  avgClickbaitScore: number;
  highClickbaitCount: number;
  lowClickbaitCount: number;
  categoriesCount: number;
  publishedToday: number;
  publishedThisWeek: number;
  publishedThisMonth: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  clickbaitDistribution: ClickbaitAnalysis[];
  categoryDistribution: CategoryDistribution[];
  clickbaitTrends: ClickbaitTrend[];
  topClickbaitReasons: TopClickbaitReason[];
  importanceDistribution: ImportanceDistribution[];
  hourlyDistribution: { hour: number; count: number }[];
  sourceDistribution: SourceDistribution[];
}
