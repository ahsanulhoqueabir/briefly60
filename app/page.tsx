"use client";

import ArticleCard from "@/components/ArticleCard";
import ImportantNewsBanner from "@/components/ImportantNewsBanner";
import ImportantNewsSidebar from "@/components/ImportantNewsSidebar";
import RefreshIndicator from "@/components/RefreshIndicator";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { articles, loading, error, hasMore, observerRef } =
    useInfiniteArticles();

  return (
    <main className="bg-background">
      <RefreshIndicator />
      <div className="container mx-auto px-4 py-2">
        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Important News Banner - Mobile Only */}
        <div className="lg:hidden">
          <ImportantNewsBanner />
        </div>

        {/* 3-Column Layout - Desktop */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Left Side - Latest News (8 columns on desktop) */}
          <div className="lg:col-span-8">
            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  id={`article-${article._id}`}
                  article={article}
                />
              ))}
            </div>

            {/* Loading Indicator - Only on initial load */}
            {loading && articles.length === 0 && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!loading && articles.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  কোনো সংবাদ পাওয়া যায়নি
                </p>
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {articles.length > 0 && (
              <div ref={observerRef} className="py-8">
                {loading && (
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground text-sm">
                      আরো সংবাদ লোড হচ্ছে...
                    </span>
                  </div>
                )}
                {!hasMore && !loading && (
                  <div className="text-center text-muted-foreground text-sm">
                    সব সংবাদ দেখানো হয়েছে
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Important News Sidebar (4 columns on desktop, hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-4">
            <ImportantNewsSidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
