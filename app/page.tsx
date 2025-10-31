"use client";

import React, { useState, useEffect } from "react";
import { NewsBrief } from "@/types";
import { NEWS_CATEGORIES, MOCK_NEWS } from "@/lib/constants";
import NewsSection from "@/components/NewsSection";
import CategoryGrid from "@/components/CategoryGrid";
import { TrendingUp, Clock, Grid3x3 } from "lucide-react";

const HomePage = () => {
  const [latestNews, setLatestNews] = useState<NewsBrief[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsBrief[]>([]);
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

      setLatestNews(sortedByDate.slice(0, 5));
      setTrendingNews(sortedByTrending.slice(0, 4));
      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              News in <span className="text-blue-200">60 Words</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Stay informed with brief, accurate summaries from popular
              newspapers. Get the essence of every story without the clutter.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center bg-blue-700 bg-opacity-50 px-3 py-2 rounded-full">
                <Clock className="w-4 h-4 mr-2" />
                Quick 60-word summaries
              </div>
              <div className="flex items-center bg-blue-700 bg-opacity-50 px-3 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Real-time trending detection
              </div>
              <div className="flex items-center bg-blue-700 bg-opacity-50 px-3 py-2 rounded-full">
                <Grid3x3 className="w-4 h-4 mr-2" />
                Organized by categories
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-1">
            {/* Categories Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center mb-4">
                <Grid3x3 className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Categories
                </h2>
              </div>
              <CategoryGrid categories={NEWS_CATEGORIES} compact={true} />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today&apos;s Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Articles</span>
                  <span className="font-semibold text-gray-900">
                    {loading ? "--" : MOCK_NEWS.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trending Stories</span>
                  <span className="font-semibold text-orange-600">
                    {loading ? "--" : trendingNews.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-blue-600">
                    {NEWS_CATEGORIES.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Read Time</span>
                  <span className="font-semibold text-green-600">30s</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why Choose Briefly60?
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                  <span>Concise 60-word summaries save your time</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                  <span>
                    Clickbait detection helps you identify reliable news
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                  <span>Multiple categories keep you organized</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                  <span>Trending detection shows what&apos;s popular</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
