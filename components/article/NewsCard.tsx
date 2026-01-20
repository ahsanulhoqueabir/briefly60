"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, AlertTriangle } from "lucide-react";
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
        "bg-card rounded-lg border border-border hover:shadow-md transition-shadow duration-200",
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
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-primary">
              {news.category}
            </span>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(news.published_at)}
            </div>
            {news.trending_score && news.trending_score > 80 && (
              <span className="text-xs text-secondary font-medium">
                Trending
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-semibold text-foreground mb-2 line-clamp-2",
              compact ? "text-sm" : "text-base"
            )}
          >
            <Link
              href={`/news/${news.id}`}
              className="hover:text-primary transition-colors"
            >
              {news.proper_title}
            </Link>
          </h3>

          {/* Original Title (if different and clickbait indicator enabled) */}
          {showClickbaitIndicator && news.title !== news.proper_title && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground italic line-clamp-1">
                Original: &ldquo;{news.title}&rdquo;
              </p>
            </div>
          )}

          {/* Content */}
          <p
            className={cn(
              "text-muted-foreground mb-3 line-clamp-3",
              compact ? "text-sm" : "text-sm"
            )}
          >
            {news.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {news.source}
            </span>

            {/* Clickbait Indicator */}
            {showClickbaitIndicator && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  getClickbaitColor(news.clickbait_value)
                )}
              >
                {news.clickbait_value < 0.5 && (
                  <AlertTriangle className="w-3 h-3" />
                )}
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
