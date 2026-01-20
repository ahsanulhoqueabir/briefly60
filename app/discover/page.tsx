"use client";

import ArticleCard from "@/components/article/ArticleCard";
import FilterModal from "@/components/modal/FilterModal";
import { Article } from "@/types/news.types";
import { ArrowUp, Filter, Search, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useDebounce } from "@/hooks/use-debounce";

interface DiscoverFilters {
  source_name: string;
  category: string;
  published_after: string;
  published_before: string;
  importance_min: string;
  importance_max: string;
  clickbait_min: string;
  clickbait_max: string;
  search: string;
  keywords: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}

export default function DiscoverPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { handleSyncError } = useErrorHandler({
    showToast: true,
    context: "Discover Page",
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState<DiscoverFilters>({
    source_name: "",
    category: "",
    published_after: "",
    published_before: "",
    importance_min: "1",
    importance_max: "10",
    clickbait_min: "1",
    clickbait_max: "10",
    search: "",
    keywords: "",
    sort_by: "published_at",
    sort_order: "desc",
  });

  const fetchArticles = useCallback(
    async (currentPage = 1, reset = false, searchTerm = "") => {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setLoading(true);
        if (searchTerm) {
          setIsSearching(true);
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
        });

        // Add filters
        if (filters.source_name)
          params.append("source_name", filters.source_name);
        if (filters.category) params.append("category", filters.category);
        if (filters.published_after)
          params.append("published_after", filters.published_after);
        if (filters.published_before)
          params.append("published_before", filters.published_before);
        if (filters.importance_min)
          params.append("importance_min", filters.importance_min);
        if (filters.importance_max)
          params.append("importance_max", filters.importance_max);
        if (filters.clickbait_min)
          params.append("clickbait_min", filters.clickbait_min);
        if (filters.clickbait_max)
          params.append("clickbait_max", filters.clickbait_max);
        if (searchTerm) params.append("search", searchTerm);
        if (filters.keywords) params.append("keywords", filters.keywords);
        if (filters.sort_by) params.append("sort_by", filters.sort_by);
        if (filters.sort_order) params.append("sort_order", filters.sort_order);

        const response = await fetch(`/api/articles/discover?${params}`, {
          signal: abortControllerRef.current.signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Invalid response format");
        }

        if (reset) {
          setArticles(data.data);
        } else {
          setArticles((prev) => [...prev, ...data.data]);
        }

        setTotalPages(data.meta.total_pages || 0);
        setHasMore(currentPage < data.meta.total_pages);
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Error fetching articles:", error);
        handleSyncError(
          error as Error,
          "খবর লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        );
        setArticles([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [filters, handleSyncError],
  );

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle debounced search
  useEffect(() => {
    setPage(1);
    fetchArticles(1, true, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  // Fetch articles when filters change (non-search filters)
  useEffect(() => {
    setPage(1);
    fetchArticles(1, true, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.source_name,
    filters.category,
    filters.published_after,
    filters.published_before,
    filters.importance_min,
    filters.importance_max,
    filters.clickbait_min,
    filters.clickbait_max,
    filters.keywords,
    filters.sort_by,
    filters.sort_order,
  ]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;

    loadMoreObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    loadMoreObserverRef.current.observe(loadMoreRef.current);

    return () => {
      if (loadMoreObserverRef.current) {
        loadMoreObserverRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading]);

  const handleFilterChange = (
    key: keyof DiscoverFilters,
    value: string | number,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({
      source_name: "",
      category: "",
      published_after: "",
      published_before: "",
      importance_min: "1",
      importance_max: "10",
      clickbait_min: "1",
      clickbait_max: "10",
      search: "",
      keywords: "",
      sort_by: "published_at",
      sort_order: "desc",
    });
  };

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage, false, debouncedSearchQuery);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // Exclude sort options and search from count
    if (key === "sort_by" || key === "sort_order" || key === "search")
      return false;

    // Exclude default range values
    if (key === "importance_min" && value === "1") return false;
    if (key === "importance_max" && value === "10") return false;
    if (key === "clickbait_min" && value === "1") return false;
    if (key === "clickbait_max" && value === "10") return false;

    // Count non-empty values
    return value !== "";
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className={`sticky top-0 z-6000 transition-all duration-300 ${
          isScrolled
            ? "bg-card border-b border-border shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            )}
            <input
              type="text"
              placeholder="শিরোনাম বা কীওয়ার্ড দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity relative whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">ফিল্টার</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              কোন খবর পাওয়া যায়নি
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {articles.length > 0 && (
                  <>
                    পৃষ্ঠা {page} / {totalPages} • মোট {articles.length} টি খবর
                    দেখানো হচ্ছে
                  </>
                )}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  সব ফিল্টার সরান
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  id={`article-${article._id}`}
                  article={article}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "লোড হচ্ছে..." : "আরও দেখুন"}
                </button>
              </div>
            )}

            {/* End of results message */}
            {!hasMore && articles.length > 0 && (
              <div className="text-center mt-8 py-4">
                <p className="text-sm text-muted-foreground">
                  সব খবর দেখানো হয়েছে
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-all hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
