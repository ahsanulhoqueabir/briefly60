"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { NewsBrief } from "@/types";
import NewsCard from "./NewsCard";

interface NewsSectionProps {
  title: string;
  news: NewsBrief[];
  loading?: boolean;
  showViewMore?: boolean;
  viewMoreHref?: string;
  compact?: boolean;
  showClickbaitIndicator?: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({
  title,
  news,
  loading = false,
  showViewMore = false,
  viewMoreHref = "#",
  compact = false,
  showClickbaitIndicator = true,
}) => {
  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading news...</span>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No news available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {showViewMore && (
          <Link
            href={viewMoreHref}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      {/* News Grid */}
      <div className="grid gap-4 md:gap-6">
        {news.map((item) => (
          <NewsCard
            key={item.id}
            news={item}
            compact={compact}
            showClickbaitIndicator={showClickbaitIndicator}
          />
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
