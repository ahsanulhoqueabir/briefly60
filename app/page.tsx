"use client";

import ArticleCard from "@/components/ArticleCard";
import Headlines from "@/components/ui/headlines";
import ImportantNewsBanner from "@/components/ImportantNewsBanner";
import ImportantNewsSidebar from "@/components/ImportantNewsSidebar";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { articles, loading, error, hasMore, observerRef } =
    useInfiniteArticles();

  return (
    <main className="bg-background">
      {/* News Ticker at the top */}
      <Headlines articles={articles} />

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
            {/* Latest Articles Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                সর্বশেষ সংবাদ
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                সবচেয়ে নতুন খবরগুলো দেখুন
              </p>
            </div>

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
                <p className="text-muted-foreground">
                  কোনো সংবাদ পাওয়া যায়নি
                </p>
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
