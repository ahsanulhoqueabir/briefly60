"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Tag, TrendingUp, Eye, AlertTriangle } from "lucide-react";
import { NewsBrief } from "@/types";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  news: NewsBrief;
  showClickbaitIndicator?: boolean;
  compact?: boolean;
  showImage?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  news,
  showClickbaitIndicator = true,
  compact = false,
  showImage = true,
}) => {
  const getClickbaitColor = (value: number) => {
    if (value >= 0.8) return "text-green-600 bg-green-50";
    if (value >= 0.5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getClickbaitLabel = (value: number) => {
    if (value >= 0.8) return "Reliable";
    if (value >= 0.5) return "Moderate";
    return "Clickbait";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <article
      className={cn(
        "bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200",
        compact ? "p-4" : "p-6"
      )}
    >
      <div className={cn("flex gap-4", compact && "gap-3")}>
        {/* Image */}
        {showImage && news.image_url && (
          <div className={cn("shrink-0", compact ? "w-16 h-16" : "w-24 h-24")}>
            <Image
              src={news.image_url}
              alt={news.proper_title}
              width={compact ? 64 : 96}
              height={compact ? 64 : 96}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category and Time */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {news.category}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(news.published_at)}
            </div>
            {news.trending_score && news.trending_score > 80 && (
              <div className="flex items-center text-xs text-orange-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-semibold text-gray-900 mb-2 line-clamp-2",
              compact ? "text-sm" : "text-base"
            )}
          >
            <Link
              href={`/news/${news.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {news.proper_title}
            </Link>
          </h3>

          {/* Original Title (if different and clickbait indicator enabled) */}
          {showClickbaitIndicator && news.title !== news.proper_title && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 italic line-clamp-1">
                Original: &ldquo;{news.title}&rdquo;
              </p>
            </div>
          )}

          {/* Content */}
          <p
            className={cn(
              "text-gray-700 mb-3 line-clamp-3",
              compact ? "text-sm" : "text-sm"
            )}
          >
            {news.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Source */}
              <span className="text-xs text-gray-500">{news.source}</span>

              {/* Tags */}
              {news.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {news.tags.slice(0, 2).join(", ")}
                    {news.tags.length > 2 && "..."}
                  </span>
                </div>
              )}
            </div>

            {/* Clickbait Indicator */}
            {showClickbaitIndicator && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  getClickbaitColor(news.clickbait_value)
                )}
              >
                {news.clickbait_value < 0.5 && (
                  <AlertTriangle className="w-3 h-3" />
                )}
                <Eye className="w-3 h-3" />
                <span>{getClickbaitLabel(news.clickbait_value)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
