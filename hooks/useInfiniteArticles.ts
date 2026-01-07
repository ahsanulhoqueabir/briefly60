import { Article, ArticleQueryParams } from "@/types/news.types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  observerRef: (node: HTMLElement | null) => void;
}

export function useInfiniteArticles(
  initialParams: ArticleQueryParams = {}
): UseInfiniteArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: "20",
      };

      // Add other params as strings
      if (initialParams.status) queryParams.status = initialParams.status;
      if (initialParams.category) queryParams.category = initialParams.category;
      if (initialParams.published_after)
        queryParams.published_after = initialParams.published_after;
      if (initialParams.published_before)
        queryParams.published_before = initialParams.published_before;
      if (initialParams.importance_min !== undefined)
        queryParams.importance_min = initialParams.importance_min.toString();
      if (initialParams.importance_max !== undefined)
        queryParams.importance_max = initialParams.importance_max.toString();
      if (initialParams.clickbait_max !== undefined)
        queryParams.clickbait_max = initialParams.clickbait_max.toString();
      if (initialParams.search) queryParams.search = initialParams.search;
      if (initialParams.keywords)
        queryParams.keywords = initialParams.keywords.join(",");
      if (initialParams.sort_by) queryParams.sort_by = initialParams.sort_by;
      if (initialParams.sort_order)
        queryParams.sort_order = initialParams.sort_order;
      if (initialParams.fields)
        queryParams.fields = initialParams.fields.join(",");

      const params = new URLSearchParams(queryParams);

      const response = await fetch(`/api/articles?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setArticles((prev) => {
          // Create a Set of existing IDs for efficient lookup
          const existingIds = new Set(prev.map((article) => article.id));
          // Filter out duplicates
          const newArticles = data.data.filter(
            (article: Article) => !existingIds.has(article.id)
          );
          return [...prev, ...newArticles];
        });
        setPage((prev) => prev + 1);
        setHasMore(data.meta.page < data.meta.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, initialParams]);

  // Reset state when params change
  const paramsKey = JSON.stringify(initialParams);
  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [paramsKey]);

  // Initial load
  useEffect(() => {
    if (articles.length === 0 && !loading) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length]);

  // Intersection Observer callback
  const observerRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  return { articles, loading, error, hasMore, loadMore, observerRef };
}
