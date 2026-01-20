"use client";

import React, { useEffect, useState } from "react";
import { Article } from "@/types/news.types";
import { Loader2, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ImportantNewsResponse {
  success: boolean;
  data: Article[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_more: boolean;
  };
}

const ImportantNewsBanner: React.FC = () => {
  const [important_news, set_important_news] = useState<Article[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [current_slide, set_current_slide] = useState(0);
  const [is_transitioning, set_is_transitioning] = useState(false);
  const [image_errors, set_image_errors] = useState<Set<string>>(new Set());
  const [touch_start, set_touch_start] = useState(0);
  const [touch_end, set_touch_end] = useState(0);

  useEffect(() => {
    const fetchImportantNews = async () => {
      try {
        set_loading(true);
        set_error(null);

        const api_url =
          typeof window !== "undefined"
            ? `${window.location.origin}/api/articles?type=important&limit=8&status=published`
            : "/api/articles?type=important&limit=8&status=published";

        const response = await fetch(api_url, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error_data = await response.json().catch(() => ({}));
          console.error("Important news API error:", error_data);
          throw new Error(
            error_data.message || "Failed to fetch important news",
          );
        }

        const data: ImportantNewsResponse = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
          // Fallback: fetch latest articles with high importance
          const fallback_url =
            typeof window !== "undefined"
              ? `${window.location.origin}/api/articles?limit=8&status=published&importance=high`
              : "/api/articles?limit=8&status=published&importance=high";

          const fallback_response = await fetch(fallback_url, {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (fallback_response.ok) {
            const fallback_data = await fallback_response.json();
            set_important_news(fallback_data.data || []);
          } else {
            // Final fallback: just get latest articles
            const final_fallback_url =
              typeof window !== "undefined"
                ? `${window.location.origin}/api/articles?limit=8&status=published`
                : "/api/articles?limit=8&status=published";
            const final_response = await fetch(final_fallback_url, {
              cache: "no-store",
            });
            if (final_response.ok) {
              const final_data = await final_response.json();
              set_important_news(final_data.data || []);
            } else {
              set_important_news([]);
            }
          }
        } else {
          set_important_news(data.data);
        }
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

  // Auto-slide effect
  useEffect(() => {
    if (important_news.length <= 1) return;

    const interval = setInterval(() => {
      set_current_slide((prev) => (prev + 1) % important_news.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [important_news.length]);

  const handlePrevSlide = () => {
    if (is_transitioning) return;
    set_is_transitioning(true);
    setTimeout(() => {
      set_current_slide(
        (prev) => (prev - 1 + important_news.length) % important_news.length,
      );
      setTimeout(() => set_is_transitioning(false), 50);
    }, 300);
  };

  const handleNextSlide = () => {
    if (is_transitioning) return;
    set_is_transitioning(true);
    setTimeout(() => {
      set_current_slide((prev) => (prev + 1) % important_news.length);
      setTimeout(() => set_is_transitioning(false), 50);
    }, 300);
  };

  const handleImageError = (article_id: string) => {
    set_image_errors((prev) => new Set(prev).add(article_id));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    set_touch_start(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    set_touch_end(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touch_start || !touch_end) return;

    const distance = touch_start - touch_end;
    const is_left_swipe = distance > 50;
    const is_right_swipe = distance < -50;

    if (is_left_swipe) {
      handleNextSlide();
    }
    if (is_right_swipe) {
      handlePrevSlide();
    }

    // Reset
    set_touch_start(0);
    set_touch_end(0);
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "এইমাত্র";
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return `${Math.floor(hours / 24)} দিন আগে`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-64 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error or empty state
  if (error || important_news.length === 0) {
    return null;
  }

  const current_article = important_news[current_slide];
  const has_image =
    current_article.banner && !image_errors.has(current_article._id);

  return (
    <div
      className="relative w-full mb-6 rounded-lg overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Card */}
      <Link href={`/article/${current_article._id}`}>
        <div className="relative h-64 bg-linear-to-br from-primary/10 via-primary/5 to-background overflow-hidden transition-all duration-500 ease-in-out">
          {/* Background Image with Overlay */}
          {has_image && (
            <>
              <Image
                src={current_article.banner!}
                alt={current_article.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-500 ease-in-out ${
                  is_transitioning ? "opacity-0" : "opacity-40"
                }`}
                onError={() => handleImageError(current_article._id)}
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
            </>
          )}

          {/* Content */}
          <div
            className={`relative h-full flex flex-col justify-end p-6 transition-all duration-500 ease-in-out ${
              is_transitioning
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 px-3 py-1 bg-primary/90 text-primary-foreground rounded-full text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>গুরুত্বপূর্ণ</span>
              </div>
              <span className="px-3 py-1 bg-card/80 backdrop-blur text-foreground text-xs rounded-full">
                {current_article.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
              {current_article.corrected_title || current_article.title}
            </h2>

            {/* Summary */}
            <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
              {current_article.summary_60_bn}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{current_article.source_name}</span>
              <span>{formatDate(current_article.published_at)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Arrows */}
      {important_news.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              handlePrevSlide();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full hover:bg-background transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNextSlide();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full hover:bg-background transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {important_news.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {important_news.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                if (!is_transitioning && index !== current_slide) {
                  set_is_transitioning(true);
                  setTimeout(() => {
                    set_current_slide(index);
                    setTimeout(() => set_is_transitioning(false), 50);
                  }, 300);
                }
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === current_slide
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImportantNewsBanner;
