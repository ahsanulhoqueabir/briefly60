"use client";

import { placeholderImage } from "@/config/env";
import { Article } from "@/types/news.types";
import {
  Bookmark,
  ExternalLink,
  Headphones,
  HelpCircle,
  Pause,
  Play,
  Share2,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import SoundWave from "./SoundWave";
import AuthRequired from "./AuthRequired";
import QuizModal from "./QuizModal";
import { useAuth } from "@/contexts/AuthContext";
import usePrivateAxios from "@/hooks/use-private-axios";
import { useBookmark } from "@/hooks/useBookmark";

interface ArticleCardProps {
  article: Article;
  id?: string;
}

const validUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function ArticleCard({ article, id }: ArticleCardProps) {
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const { user, refreshUser } = useAuth();
  const axios = usePrivateAxios();
  const { isBookmarked } = useBookmark(article._id);

  // Text-to-Speech hook for the summary
  const {
    isPlaying,
    isPaused,
    currentWordIndex,
    words,
    play,
    pause,
    resume,
    stop,
    isSupported,
  } = useTextToSpeech({
    text: article.summary_60_bn || article.title,
    lang: "bn-BD", // Bengali language
    rate: 0.85, // Slightly slower for better comprehension
    pitch: 1,
  });

  const handleBookmark = async () => {
    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      const response = await axios.post("/api/bookmark", {
        news: article._id,
      });

      if (response.data.success) {
        await refreshUser();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error handling bookmark:", error);
      alert(
        error?.response?.data?.message ||
          "বুকমার্ক প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleQuizClick = () => {
    // This will only be called if user is authenticated (due to AuthRequired wrapper)
    setShowQuizModal(true);
  };

  const handleQuizClose = () => {
    setShowQuizModal(false);
  };

  const handleAudioPlay = () => {
    if (!isSupported) {
      alert("আপনার ব্রাউজার অডিও প্লেব্যাক সাপোর্ট করে না।");
      return;
    }

    if (!article.summary_60_bn) {
      alert("এই নিবন্ধের জন্য কোন সারসংক্ষেপ নেই।");
      return;
    }

    setShowAudioPlayer(true);

    if (isPaused) {
      resume();
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleAudioStop = () => {
    stop();
    setShowAudioPlayer(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.summary_60_bn || article.title,
      url: article.source_url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${article.title}\n\n${article.summary_60_bn}\n\n${article.source_url}`,
        );
        alert("লিংক কপি করা হয়েছে!");
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  const showCorrectedTitle =
    article.clickbait_score > 3 && article.corrected_title;

  // Validate and sanitize image URL
  const getValidImageSrc = (): string => {
    if (!article.banner || article.banner.trim() === "") {
      return placeholderImage;
    }

    try {
      // Validate URL format
      if (validUrl(article.banner)) return article.banner;
      return placeholderImage;
    } catch {
      return placeholderImage;
    }
  };

  const imageSrc = imageError ? placeholderImage : getValidImageSrc();

  return (
    <article className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Banner Image */}
      <div className="relative w-full h-48 bg-muted shrink-0">
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      </div>

      <div className="p-4 flex flex-col grow">
        {/* Title */}
        <h2 className="text-lg font-bold text-primary mb-2 ">
          {article.title}
        </h2>

        {/* Corrected Title (if clickbait score > 3) */}
        {showCorrectedTitle && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              What it should be:
            </span>
            <p className="text-sm text-secondary font-medium mt-1 line-clamp-2">
              {article.corrected_title}
            </p>
          </div>
        )}

        {/* Summary */}
        {showAudioPlayer && (isPlaying || isPaused) ? (
          <div className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {words.map((word, index) => (
              <span
                key={`${index}-${word}`}
                className={`transition-all duration-150 ${
                  index === currentWordIndex
                    ? "bg-primary/30 text-primary font-semibold px-1 rounded"
                    : ""
                }`}
              >
                {word}{" "}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            {article.summary_60_bn}
          </p>
        )}

        {/* Action Buttons - Footer */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 justify-between">
            {/* Details Button */}
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              <span>বিস্তারিত</span>
            </a>
            <div className="flex gap-2">
              {/* Audio Button with Sound Wave */}
              {showAudioPlayer ? (
                <div className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-2 py-1">
                  <button
                    onClick={handleAudioPlay}
                    className="flex items-center justify-center w-6 h-6 hover:opacity-80 transition-opacity"
                    aria-label={
                      isPaused
                        ? "Resume audio"
                        : isPlaying
                          ? "Pause audio"
                          : "Play audio"
                    }
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4" />
                    ) : isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <SoundWave isPlaying={isPlaying && !isPaused} />
                  <button
                    onClick={handleAudioStop}
                    className="flex items-center justify-center w-6 h-6 hover:opacity-80 transition-opacity ml-1"
                    aria-label="Stop audio"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAudioPlay}
                  className="flex items-center justify-center w-9 h-9 bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-opacity"
                  aria-label="Play audio"
                >
                  <Headphones className="w-4 h-4" />
                </button>
              )}

              {/* Quiz Button (only if MCQs exist) */}
              {article.quiz_questions && article.quiz_questions.length > 0 && (
                <AuthRequired referenceId={id || `article-${article._id}`}>
                  <button
                    onClick={handleQuizClick}
                    className="flex items-center justify-center w-9 h-9 bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-opacity"
                    aria-label="Take quiz"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </AuthRequired>
              )}

              {/* Bookmark Button */}
              <AuthRequired referenceId={id || `article-${article._id}`}>
                <button
                  onClick={handleBookmark}
                  disabled={isBookmarkLoading}
                  className={`flex items-center justify-center w-9 h-9 rounded transition-all ${
                    isBookmarked
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:opacity-90"
                  } ${
                    isBookmarkLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </button>
              </AuthRequired>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-9 h-9 bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-opacity"
                aria-label="Share article"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Source Info */}
          <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border flex justify-between">
            <p className="">Source: {article.source_name}</p>
            <p>
              {new Date(article.published_at).toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {user &&
        showQuizModal &&
        article.quiz_questions &&
        article.quiz_questions.length > 0 && (
          <QuizModal
            isOpen={showQuizModal}
            onClose={handleQuizClose}
            mcqs={article.quiz_questions}
            newsId={article._id}
          />
        )}
    </article>
  );
}
