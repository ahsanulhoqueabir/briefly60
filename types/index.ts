// News Brief Types
export interface NewsBrief {
  id: string;
  title: string; // Original title from source
  proper_title: string; // Best suitable title
  content: string; // 60 words summary
  tags: string[];
  category: string;
  clickbait_value: number; // 0-1 range (0 = no match, 1 = proper match)
  source: string;
  published_at: Date;
  image_url?: string;
  trending_score?: number;
}

// Theme Types
export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface UserPreferences {
  preferred_categories: string[];
  language: "en" | "bn";
  notification_settings: {
    email: boolean;
    push: boolean;
    trending_news: boolean;
    breaking_news: boolean;
  };
  reading_preferences: {
    font_size: "small" | "medium" | "large";
    autoplay_videos: boolean;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  name_bn: string;
  icon: string;
  color: string;
  description?: string;
}

// Component Props Types
export interface NewsCardProps {
  news: NewsBrief;
  showClickbaitIndicator?: boolean;
  compact?: boolean;
}

export interface NewsSectionProps {
  title: string;
  news: NewsBrief[];
  loading?: boolean;
  showViewMore?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
}
