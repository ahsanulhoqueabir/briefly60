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
  initialParams: ArticleQueryParams = {},
): UseInfiniteArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1); // Track current page immediately

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || loadingRef.current) {
      console.log("Load more blocked:", {
        loading,
        hasMore,
        loadingRef: loadingRef.current,
      });
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    const currentPage = pageRef.current;
    console.log("Fetching page:", currentPage);

    try {
      const queryParams: Record<string, string> = {
        page: currentPage.toString(),
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

      const response = await fetch(`/api/articles?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();

      console.log("LoadMore response:", {
        page: currentPage,
        articlesCount: data.data?.length,
        pagination: data.pagination,
        fullResponse: data,
      });

      if (data.data && data.data.length > 0) {
        console.log(
          `Received ${data.data.length} articles for page ${currentPage}`,
        );
        setArticles((prev) => {
          // Create a Set of existing IDs for efficient lookup
          const existingIds = new Set(prev.map((article) => article._id));
          // Filter out duplicates
          const newArticles = data.data.filter(
            (article: Article) => !existingIds.has(article._id),
          );
          console.log(
            `Adding ${newArticles.length} new articles (${data.data.length - newArticles.length} duplicates filtered)`,
          );
          return [...prev, ...newArticles];
        });

        // Increment page ref immediately
        pageRef.current = currentPage + 1;

        setHasMore(data.pagination.current_page < data.pagination.total_pages);
        console.log("Next page will be:", pageRef.current);
        console.log("LoadMore pagination details:", {
          current_page: data.pagination.current_page,
          total_pages: data.pagination.total_pages,
          hasMore: data.pagination.current_page < data.pagination.total_pages,
        });
      } else {
        console.log("No more articles available");
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more error:", err);
      setError(err instanceof Error ? err.message : "Failed to load articles");
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [loading, hasMore, initialParams]);

  // Reset state when params change and load data
  const paramsKey = JSON.stringify(initialParams);
  useEffect(() => {
    console.log("Resetting state for new params");
    // Reset state
    setArticles([]);
    pageRef.current = 1;
    setHasMore(true);
    setError(null);
    loadingRef.current = false;

    // Load initial data
    const loadInitialData = async () => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const queryParams: Record<string, string> = {
          page: "1",
          limit: "20",
        };

        // Add other params as strings
        if (initialParams.status) queryParams.status = initialParams.status;
        if (initialParams.category)
          queryParams.category = initialParams.category;
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
        const response = await fetch(`/api/articles?${params.toString()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();

        console.log("Initial load response:", {
          articlesCount: data.data?.length,
          pagination: data.pagination,
          fullData: data,
        });

        if (data.data && data.data.length > 0) {
          console.log(`Initial load: ${data.data.length} articles`);
          setArticles(data.data);
          pageRef.current = 2;
          setHasMore(
            data.pagination.current_page < data.pagination.total_pages,
          );
          console.log("Initial page set to 2, next fetch will be page 2");
          console.log("Pagination details:", {
            current_page: data.pagination.current_page,
            total_pages: data.pagination.total_pages,
            hasMore: data.pagination.current_page < data.pagination.total_pages,
          });
        } else {
          setArticles([]);
          setHasMore(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load articles",
        );
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // Intersection Observer callback
  const observerRef = useCallback(
    (node: HTMLElement | null) => {
      console.log("Observer callback called:", {
        node: !!node,
        loading,
        hasMore,
      });
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        console.log("Observer entries:", {
          isIntersecting: entries[0].isIntersecting,
          hasMore,
          loading,
        });
        if (entries[0].isIntersecting && hasMore) {
          console.log("Triggering loadMore from observer");
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore],
  );

  return { articles, loading, error, hasMore, loadMore, observerRef };
}
