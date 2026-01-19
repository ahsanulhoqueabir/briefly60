"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Article } from "@/types/news.types";

interface ArticlesContextType {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refreshArticles: () => Promise<void>;
  isRefreshing: boolean;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "briefly60_cached_articles";
const CACHE_DURATION = 60 * 1000; // 60 seconds
const MIN_CACHED_ARTICLES = 20;
const LAST_FETCH_KEY = "briefly60_last_fetch";

export function ArticlesProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Load from localStorage
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsedData = JSON.parse(cached);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setArticles(parsedData);
          return true;
        }
      }
    } catch (err) {
      console.error("Failed to load from cache:", err);
    }
    return false;
  }, []);

  // Save to localStorage
  const saveToCache = useCallback((data: Article[]) => {
    try {
      // Keep minimum 20 articles in cache
      const articlesToCache = data.slice(
        0,
        Math.max(MIN_CACHED_ARTICLES, data.length),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articlesToCache));
      localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
    } catch (err) {
      console.error("Failed to save to cache:", err);
    }
  }, []);

  // Fetch articles from API
  const fetchArticles = useCallback(
    async (silent = false) => {
      if (!isMountedRef.current) return;

      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const response = await fetch("/api/articles?page=1&limit=30");

        if (!response.ok) {
          // If no cache and first time, don't show error, just show empty state
          if (articles.length === 0) {
            throw new Error(
              "সংবাদ লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
            );
          }
          return; // Keep existing articles
        }

        const result = await response.json();

        // Handle different response formats
        if (result.success === true && Array.isArray(result.data)) {
          // New format: { success: true, data: [...] }
          if (isMountedRef.current) {
            setArticles(result.data);
            saveToCache(result.data);
          }
        } else if (Array.isArray(result.data)) {
          // Format: { data: [...] }
          if (isMountedRef.current) {
            setArticles(result.data);
            saveToCache(result.data);
          }
        } else if (Array.isArray(result)) {
          // Direct array format
          if (isMountedRef.current) {
            setArticles(result);
            saveToCache(result);
          }
        } else {
          // Invalid format - but don't crash on first visit
          console.error("Unexpected response format:", result);
          if (articles.length === 0) {
            // First time visit with invalid response, show empty state instead of error
            setArticles([]);
          }
        }
      } catch (err) {
        console.error("Fetch articles error:", err);
        if (isMountedRef.current && articles.length === 0) {
          // Only show error if no cached articles to display
          setError(
            err instanceof Error ? err.message : "সংবাদ লোড করতে সমস্যা হয়েছে",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [saveToCache],
  );

  // Manual refresh function
  const refreshArticles = useCallback(async () => {
    await fetchArticles(false);
  }, [fetchArticles]);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;

    // Try to load from cache first for instant display
    const hasCachedData = loadFromCache();

    if (hasCachedData) {
      // Show cached data immediately
      setLoading(false);

      // Then fetch fresh data in background
      fetchArticles(true);
    } else {
      // No cache, show loading and fetch
      fetchArticles(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [loadFromCache, fetchArticles]);

  // Setup background polling
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval for background updates
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchArticles(true); // Silent fetch
      }
    }, CACHE_DURATION);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchArticles]);

  // Visibility change handler - refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
        const now = Date.now();

        if (lastFetch) {
          const timeSinceLastFetch = now - parseInt(lastFetch, 10);
          // If more than 60 seconds since last fetch, refresh
          if (timeSinceLastFetch > CACHE_DURATION) {
            fetchArticles(true);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchArticles]);

  const value: ArticlesContextType = {
    articles,
    loading,
    error,
    refreshArticles,
    isRefreshing,
  };

  return (
    <ArticlesContext.Provider value={value}>
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (context === undefined) {
    throw new Error("useArticles must be used within an ArticlesProvider");
  }
  return context;
}
