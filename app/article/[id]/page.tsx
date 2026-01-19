"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Article } from "@/types/news.types";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  ExternalLink,
  Loader2,
  Share2,
  Tag,
} from "lucide-react";
import Image from "next/image";
import QuizModal from "@/components/QuizModal";
import { useBookmark } from "@/hooks/useBookmark";
import usePrivateAxios from "@/hooks/use-private-axios";
import { useAuth } from "@/contexts/AuthContext";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const article_id = params.id as string;

  const [article, set_article] = useState<Article | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [image_error, set_image_error] = useState(false);
  const [show_quiz_modal, set_show_quiz_modal] = useState(false);
  const [is_bookmark_loading, set_is_bookmark_loading] = useState(false);

  const { user, refreshUser } = useAuth();
  const axios = usePrivateAxios();
  const { isBookmarked } = useBookmark(article_id);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        set_loading(true);
        set_error(null);

        const response = await fetch(`/api/articles/${article_id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }

        const data = await response.json();
        if (data.success) {
          set_article(data.data);
        } else {
          throw new Error(data.message || "Failed to load article");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        set_error(
          err instanceof Error ? err.message : "Failed to load article",
        );
      } finally {
        set_loading(false);
      }
    };

    if (article_id) {
      fetchArticle();
    }
  }, [article_id]);

  const handleBookmark = async () => {
    if (is_bookmark_loading || !article) return;

    set_is_bookmark_loading(true);
    try {
      const response = await axios.post("/api/bookmark", {
        news: article._id,
      });

      if (response.data.success) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error handling bookmark:", error);
    } finally {
      set_is_bookmark_loading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || article.summary_60_bn,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    }
  };

  const formatDate = (date_string: string) => {
    const date = new Date(date_string);
    return new Intl.DateTimeFormat("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error || "Article not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={handleBookmark}
                  disabled={is_bookmark_loading}
                  className={`p-2 rounded-full transition-colors ${
                    isBookmarked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Bookmark
                    className="w-5 h-5"
                    fill={isBookmarked ? "currentColor" : "none"}
                  />
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            {article.category}
          </span>
          <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(article.published_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
          {article.corrected_title || article.title}
        </h1>

        {/* Banner Image */}
        {article.banner && !image_error && (
          <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
            <Image
              src={article.banner}
              alt={article.title}
              fill
              className="object-cover"
              onError={() => set_image_error(true)}
              priority
            />
          </div>
        )}

        {/* Source */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <ExternalLink className="w-4 h-4" />
          <span>উৎস:</span>
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {article.source_name}
          </a>
        </div>

        {/* Summary (60 words) */}
        <div className="bg-primary/5 border-l-4 border-primary p-6 mb-8 rounded-r-lg">
          <h2 className="text-lg font-semibold mb-3 text-foreground">
            সংক্ষিপ্ত বিবরণ
          </h2>
          <p className="text-lg leading-relaxed text-foreground/90">
            {article.summary_60_bn}
          </p>
        </div>

        {/* Full Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div className="text-foreground/80 leading-relaxed whitespace-pre-line">
            {article.content}
          </div>
        </div>

        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Tag className="w-4 h-4 text-muted-foreground mt-1" />
            {article.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        {/* Quiz Section */}
        {article.quiz_questions && article.quiz_questions.length > 0 && (
          <div className="mt-12 p-6 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              কুইজে অংশ নিন
            </h2>
            <p className="text-muted-foreground mb-6">
              এই সংবাদ সম্পর্কে আপনার জ্ঞান পরীক্ষা করুন
            </p>
            <button
              onClick={() => set_show_quiz_modal(true)}
              className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              কুইজ শুরু করুন
            </button>
          </div>
        )}
      </article>

      {/* Quiz Modal */}
      {show_quiz_modal && article.quiz_questions && (
        <QuizModal
          isOpen={show_quiz_modal}
          onClose={() => set_show_quiz_modal(false)}
          mcqs={article.quiz_questions}
          newsId={article._id}
        />
      )}
    </div>
  );
}
