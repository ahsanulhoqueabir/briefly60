"use client";

import React, { useEffect, useState } from "react";
import { Article } from "@/types/news.types";
import { Loader2, TrendingUp, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ImportantNewsResponse {
  articles: Article[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_more: boolean;
  };
}

const ImportantNewsSidebar: React.FC = () => {
  const [important_news, set_important_news] = useState<Article[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [image_errors, set_image_errors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchImportantNews = async () => {
      try {
        set_loading(true);
        set_error(null);

        const response = await fetch(
          "/api/articles?type=important&limit=10&status=published",
        );

        if (!response.ok) {
          throw new Error("Failed to fetch important news");
        }

        const data: ImportantNewsResponse = await response.json();
        set_important_news(data.articles || []);
      } catch (err) {
        console.error("Error fetching important news:", err);
        set_error(
          err instanceof Error ? err.message : "Failed to load important news",
        );
      } finally {
        set_loading(false);
      }
    };

    fetchImportantNews();
  }, []);

  const handleImageError = (article_id: string) => {
    set_image_errors((prev) => new Set(prev).add(article_id));
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "এইমাত্র";
    if (hours < 24) return `${hours}ঘ আগে`;
    return `${Math.floor(hours / 24)}দি আগে`;
  };

  // Loading state
  if (loading) {
    return (
      <aside className="sticky top-20">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              গুরুত্বপূর্ণ সংবাদ
            </h2>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </aside>
    );
  }

  // Error or empty state
  if (error || important_news.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-20">
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-primary/10 to-primary/5 p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="relative">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                গুরুত্বপূর্ণ সংবাদ
              </h2>
              <p className="text-xs text-muted-foreground">
                গত ৩ দিনের শীর্ষ খবর
              </p>
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="divide-y divide-border max-h-[calc(100vh-12rem)] overflow-y-auto">
          {important_news.map((article, index) => {
            const has_image = article.banner && !image_errors.has(article._id);

            return (
              <Link
                key={article._id}
                href={`/article/${article._id}`}
                className="block p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex gap-3">
                  {/* Number Badge */}
                  <div className="shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index < 3
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-tight">
                      {article.corrected_title || article.title}
                    </h3>

                    {/* Thumbnail (if available) */}
                    {has_image && (
                      <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                        <Image
                          src={article.banner!}
                          alt={article.title}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(article._id)}
                        />
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(article.published_at)}
                      </span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-muted/30 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            সর্বমোট {important_news.length} টি গুরুত্বপূর্ণ সংবাদ
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ImportantNewsSidebar;
