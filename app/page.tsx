"use client";

import React, { useState, useEffect } from "react";
import { NewsBrief } from "@/types";
import { NEWS_CATEGORIES, MOCK_NEWS } from "@/lib/constants";
import NewsSection from "@/components/NewsSection";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedNews from "@/components/FeaturedNews";
import { Grid3x3 } from "lucide-react";

const HomePage = () => {
  const [latestNews, setLatestNews] = useState<NewsBrief[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsBrief[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchNews = async () => {
      setLoading(true);

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sort and filter mock data
      const sortedByDate = [...MOCK_NEWS].sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      );

      const sortedByTrending = [...MOCK_NEWS]
        .filter((news) => news.trending_score && news.trending_score > 70)
        .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));

      // Create featured news (admin controlled - mock selection of high-quality articles)
      const featuredArticles = [...MOCK_NEWS]
        .filter(
          (news) =>
            news.clickbait_value >= 0.7 && // High reliability
            news.trending_score &&
            news.trending_score > 60 // Good engagement
        )
        .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
        .slice(0, 4); // Take top 4 for featured

      setLatestNews(sortedByDate.slice(0, 5));
      setTrendingNews(sortedByTrending.slice(0, 4));
      setFeaturedNews(featuredArticles);
      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {/* Featured News */}
            <FeaturedNews news={featuredNews} loading={loading} />

            {/* Latest News */}
            <NewsSection
              title="Latest News"
              news={latestNews}
              loading={loading}
              showViewMore={!loading && latestNews.length > 0}
              viewMoreHref="/latest"
              showClickbaitIndicator={true}
            />

            {/* Trending News */}
            <NewsSection
              title="Trending Now"
              news={trendingNews}
              loading={loading}
              showViewMore={!loading && trendingNews.length > 0}
              viewMoreHref="/trending"
              showClickbaitIndicator={true}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {/* Categories Section */}
            <div className="hidden lg:block bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex items-center mb-4">
                <Grid3x3 className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold text-foreground">
                  Categories
                </h2>
              </div>
              <CategoryGrid categories={NEWS_CATEGORIES} compact={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
