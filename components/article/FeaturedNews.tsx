"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { NewsBrief } from "@/types";

interface FeaturedNewsProps {
  news: NewsBrief[];
  loading?: boolean;
}

const FeaturedNews: React.FC<FeaturedNewsProps> = ({
  news,
  loading = false,
}) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Star className="w-6 h-6 text-secondary mr-3" />
            <h2 className="text-2xl font-bold text-foreground">
              Featured News
            </h2>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-80 bg-card rounded-lg border border-border p-4 animate-pulse"
            >
              <div className="w-full h-40 bg-muted rounded-lg mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Hide section completely if no news
  if (news.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="space-y-3 lg:space-y-0 lg:flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Star className="w-6 h-6 text-secondary mr-3" />
          <h2 className="text-2xl text-nowrap font-bold text-foreground">
            Featured News
          </h2>
        </div>
        <div className="flex items-center gap-4 justify-between w-full">
          <span className="ml-3 px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
            Editor&apos;s Choice
          </span>

          <Link
            href="/featured"
            className="flex items-center text-primary hover:text-primary/80 font-medium transition-colors text-sm"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scrollable Featured News */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {news.map((item, index) => (
          <article
            key={item.id}
            className={`shrink-0 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 snap-start flex flex-col h-[420px] ${
              index === 0 ? "w-80 sm:w-96" : "w-72 sm:w-80"
            }`}
          >
            <div className="relative">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.proper_title}
                  width={400}
                  height={200}
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <Star className="w-12 h-12 text-primary/50" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full shadow-sm">
                  {index === 0 ? "FEATURED" : "EDITOR'S PICK"}
                </span>
              </div>
            </div>

            <div className="flex flex-col flex-1 p-4">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {item.category}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(item.published_at)}
                </div>
                {item.trending_score && item.trending_score > 70 && (
                  <div className="flex items-center text-xs text-secondary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </div>
                )}
              </div>

              <h3 className="font-bold text-foreground text-base line-clamp-2 hover:text-primary transition-colors mb-3">
                <Link href={`/news/${item.id}`}>{item.proper_title}</Link>
              </h3>

              <p className="text-muted-foreground text-sm line-clamp-4 flex-1">
                {item.content}
              </p>

              {/* Fixed Footer */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium truncate mr-2">
                  {item.source}
                </span>
                <Link
                  href={`/news/${item.id}`}
                  className="text-primary hover:text-primary/80 text-xs font-medium flex items-center shrink-0 transition-colors"
                >
                  Read More
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedNews;
