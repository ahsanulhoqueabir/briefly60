"use client";

import ArticleCard from "@/components/ArticleCard";
import FilterModal from "@/components/FilterModal";
import { Article } from "@/types/news.types";
import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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
    async (currentPage = 1, reset = false) => {
      try {
        setLoading(true);

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
        if (filters.search) params.append("search", filters.search);
        if (filters.keywords) params.append("keywords", filters.keywords);
        if (filters.sort_by) params.append("sort_by", filters.sort_by);
        if (filters.sort_order) params.append("sort_order", filters.sort_order);

        const response = await fetch(`/api/articles/discover?${params}`);
        const data = await response.json();

        if (reset) {
          setArticles(data.data);
        } else {
          setArticles((prev) => [...prev, ...data.data]);
        }

        setHasMore(currentPage < data.meta.total_pages);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    setPage(1);
    fetchArticles(1, true);
  }, [fetchArticles]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFilterChange = (
    key: keyof DiscoverFilters,
    value: string | number,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
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
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage, false);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // Exclude sort options and search from count
    if (key === "sort_by" || key === "sort_order" || key === "search")
      return false;

    // Exclude default range values
    if (key === "importance_min" && value === "1") return false;
    if (key === "importance_max" && value === "10") return false;
    if (key === "clickbait_min" && value === "0") return false;
    if (key === "clickbait_max" && value === "5") return false;

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="শিরোনাম বা কীওয়ার্ড দিয়ে খুঁজুন..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
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
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">লোড হচ্ছে...</p>
            </div>
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
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "লোড হচ্ছে..." : "আরও দেখুন"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
