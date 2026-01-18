"use client";

import ArticleCard from "@/components/ArticleCard";
import Headlines from "@/components/ui/headlines";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { articles, loading, error, hasMore, observerRef } =
    useInfiniteArticles();

  return (
    <main className=" bg-background">
      {/* News Ticker at the top */}
      <Headlines articles={articles} />
      <div className="container mx-auto px-4 py-2">
        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article._id}
              id={`article-${article._id}`}
              article={article}
            />
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && (
          <div
            ref={observerRef}
            className="h-10 flex items-center justify-center"
          >
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No More Content */}
        {!hasMore && articles.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">আর কোনো সংবাদ নেই</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">কোনো সংবাদ পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </main>
  );
}
