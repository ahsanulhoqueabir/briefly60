"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Article, MCQ } from "@/types/news.types";
import {
  Bookmark,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Share2,
  Tag,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useBookmark } from "@/hooks/useBookmark";
import usePrivateAxios from "@/hooks/use-private-axios";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const article_id = params.id as string;

  const [article, set_article] = useState<Article | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [image_error, set_image_error] = useState(false);
  const [is_bookmark_loading, set_is_bookmark_loading] = useState(false);
  const [current_question_index, set_current_question_index] = useState(0);
  const [selected_answers, set_selected_answers] = useState<string[]>([]);
  const [show_results, set_show_results] = useState(false);
  const [selected_option, set_selected_option] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);
  const [error_message, set_error_message] = useState<string>("");

  const { user, refreshUser } = useAuth();
  const axios = usePrivateAxios();
  const { isBookmarked } = useBookmark(article_id);
  const { has_premium } = useSubscription();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        set_loading(true);
        set_error(null);

        const response = await fetch(
          `/api/articles/${article_id}?includeQuiz=true`,
        );

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

  const handleOptionSelect = (option: string) => {
    set_selected_option(option);
  };

  const submitQuizResults = async (answers: string[]) => {
    try {
      set_is_submitting(true);
      set_error_message("");

      const hasAtLeastOneAnswer = answers.some(
        (answer) => answer && answer.trim() !== "",
      );

      if (!hasAtLeastOneAnswer) {
        set_error_message("অন্তত একটি প্রশ্নের উত্তর দিতে হবে!");
        set_is_submitting(false);
        return;
      }

      const parsedMcqs: MCQ[] =
        typeof article?.quiz_questions === "string"
          ? JSON.parse(article.quiz_questions)
          : article?.quiz_questions || [];

      const answersArray = answers.map((answer, index) => ({
        question: parsedMcqs[index].question,
        user_answer: answer || "",
      }));

      const payload = {
        article_id: article?._id,
        answers: answersArray,
      };

      const response = await axios.post("/api/quiz", payload);
      console.log("Quiz submitted successfully:", response.data);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      set_error_message("কুইজ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      set_is_submitting(false);
    }
  };

  const handleNext = () => {
    if (selected_option === null || !article?.quiz_questions) return;

    const parsedMcqs: MCQ[] =
      typeof article.quiz_questions === "string"
        ? JSON.parse(article.quiz_questions)
        : article.quiz_questions;

    set_error_message("");
    const newAnswers = [...selected_answers, selected_option];
    set_selected_answers(newAnswers);

    const isLastQuestion = current_question_index === parsedMcqs.length - 1;

    if (isLastQuestion) {
      set_show_results(true);
      submitQuizResults(newAnswers);
    } else {
      set_current_question_index(current_question_index + 1);
      set_selected_option(null);
    }
  };

  const handleSkip = () => {
    if (!article?.quiz_questions) return;

    const parsedMcqs: MCQ[] =
      typeof article.quiz_questions === "string"
        ? JSON.parse(article.quiz_questions)
        : article.quiz_questions;

    set_error_message("");
    const newAnswers = [...selected_answers, ""];
    set_selected_answers(newAnswers);

    const isLastQuestion = current_question_index === parsedMcqs.length - 1;

    if (isLastQuestion) {
      const hasAtLeastOneAnswer = newAnswers.some(
        (answer) => answer && answer.trim() !== "",
      );

      if (!hasAtLeastOneAnswer) {
        set_error_message(
          "অন্তত একটি প্রশ্নের উত্তর দিতে হবে! আগের প্রশ্নে ফিরে যান এবং উত্তর দিন।",
        );
        return;
      }

      set_show_results(true);
      submitQuizResults(newAnswers);
    } else {
      set_current_question_index(current_question_index + 1);
      set_selected_option(null);
    }
  };

  const handleBack = () => {
    if (current_question_index > 0) {
      set_error_message("");
      set_current_question_index(current_question_index - 1);
      const previousAnswer = selected_answers[current_question_index - 1];
      set_selected_option(previousAnswer || null);
      set_selected_answers(selected_answers.slice(0, -1));
    }
  };

  const handleCloseQuiz = () => {
    set_current_question_index(0);
    set_selected_answers([]);
    set_show_results(false);
    set_selected_option(null);
    set_error_message("");
  };

  const calculateScore = () => {
    if (!article?.quiz_questions) return 0;

    const parsedMcqs: MCQ[] =
      typeof article.quiz_questions === "string"
        ? JSON.parse(article.quiz_questions)
        : article.quiz_questions;

    let correct = 0;
    selected_answers.forEach((answer, index) => {
      if (answer === parsedMcqs[index].correct_answer) {
        correct++;
      }
    });
    return correct;
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
    <div className="">
      {/* Article Content */}
      <article className="container mx-auto px-4 pt-8 max-w-4xl">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-4 justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {article.category}
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(article.published_at)}
            </span>
          </div>
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

        {/* Quiz Unavailable Message */}
        {article.quiz_questions &&
          article.quiz_questions.length > 0 &&
          !user && (
            <div className="mt-12 p-6 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                কুইজে অংশ নিন
              </h2>
              <p className="text-muted-foreground mb-6">
                এই সংবাদ সম্পর্কে আপনার জ্ঞান পরীক্ষা করুন
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  কুইজে অংশ নিতে অনুগ্রহ করে লগইন করুন
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center"
                >
                  লগইন করুন
                </Link>
              </div>
            </div>
          )}

        {article.quiz_questions &&
          article.quiz_questions.length > 0 &&
          user &&
          !has_premium && (
            <div className="mt-12 p-6 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                কুইজে অংশ নিন
              </h2>
              <p className="text-muted-foreground mb-6">
                এই সংবাদ সম্পর্কে আপনার জ্ঞান পরীক্ষা করুন
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      প্রিমিয়াম ফিচার
                    </p>
                    <p className="text-sm text-muted-foreground">
                      কুইজে অংশ নিতে একটি সাবস্ক্রিপশন প্ল্যান নিন
                    </p>
                  </div>
                </div>
                <Link
                  href="/subscription"
                  className="inline-block w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-center"
                >
                  প্ল্যান দেখুন
                </Link>
              </div>
            </div>
          )}
      </article>

      {/* Inline Quiz Slider */}
      {user &&
        has_premium &&
        article.quiz_questions &&
        (() => {
          const parsedMcqs: MCQ[] =
            typeof article.quiz_questions === "string"
              ? JSON.parse(article.quiz_questions)
              : article.quiz_questions;

          const currentQuestion = parsedMcqs[current_question_index];
          const isLastQuestion =
            current_question_index === parsedMcqs.length - 1;
          const score = show_results ? calculateScore() : 0;
          const percentage = show_results
            ? Math.round((score / parsedMcqs.length) * 100)
            : 0;

          return (
            <div className="">
              <div className="container mx-auto px-4 pt-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-primary">Quiz</h2>
                  </div>
                  {!show_results && (
                    <div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>
                          প্রশ্ন {current_question_index + 1} /{" "}
                          {parsedMcqs.length}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((current_question_index + 1) / parsedMcqs.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  {!show_results ? (
                    <>
                      {/* Question */}
                      <div className="mb-6">
                        <h3 className="text-lg sm:text-xl font-medium text-foreground mb-6">
                          {currentQuestion.question}
                        </h3>

                        {/* Options */}
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleOptionSelect(option)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                selected_option === option
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selected_option === option
                                      ? "border-primary bg-primary"
                                      : "border-border"
                                  }`}
                                >
                                  {selected_option === option && (
                                    <div className="w-3 h-3 rounded-full bg-primary-foreground" />
                                  )}
                                </span>
                                <span className="text-sm">{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Error Message */}
                      {error_message && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                          {error_message}
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex gap-3 text-lg">
                        {current_question_index > 0 && (
                          <Button
                            onClick={handleBack}
                            disabled={is_submitting}
                            className="flex items-center gap-2 py-3 px-6 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            পূর্ববর্তী
                          </Button>
                        )}
                        <Button
                          onClick={handleSkip}
                          disabled={is_submitting}
                          className="flex-1 py-3 px-6 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          এড়িয়ে যান
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={selected_option === null || is_submitting}
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {is_submitting
                            ? "জমা দেওয়া হচ্ছে..."
                            : isLastQuestion
                              ? "সম্পন্ন করুন"
                              : "পরবর্তী"}
                          {!is_submitting && !isLastQuestion && (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Results */}
                      <div className="text-center">
                        <div className="mb-6">
                          <div
                            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                              percentage >= 80
                                ? "bg-green-100 text-green-600"
                                : percentage >= 50
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                            }`}
                          >
                            {percentage >= 80 ? (
                              <CheckCircle2 className="w-12 h-12" />
                            ) : (
                              <span className="text-3xl font-bold">
                                {percentage}%
                              </span>
                            )}
                          </div>

                          <h3 className="text-2xl font-bold text-primary mb-2">
                            {percentage >= 80
                              ? "অসাধারণ!"
                              : percentage >= 50
                                ? "ভালো হয়েছে!"
                                : "চেষ্টা চালিয়ে যান!"}
                          </h3>

                          <p className="text-lg text-muted-foreground">
                            আপনি {parsedMcqs.length} টির মধ্যে {score} টি সঠিক
                            উত্তর দিয়েছেন
                          </p>
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-4 text-left mb-6">
                          {parsedMcqs.map((mcq, index) => {
                            const userAnswer = selected_answers[index];
                            const isSkipped = !userAnswer || userAnswer === "";
                            const isCorrect =
                              !isSkipped && userAnswer === mcq.correct_answer;

                            return (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border-2 ${
                                  isSkipped
                                    ? "border-gray-400 bg-gray-50"
                                    : isCorrect
                                      ? "border-green-500 bg-green-50"
                                      : "border-red-500 bg-red-50"
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  {isSkipped ? (
                                    <XCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                                  ) : isCorrect ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-primary">
                                      প্রশ্ন {index + 1}: {mcq.question}
                                    </p>
                                    {isSkipped ? (
                                      <p className="text-xs text-gray-600 mt-1">
                                        এই প্রশ্নটি এড়িয়ে যাওয়া হয়েছে
                                      </p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        আপনার উত্তর:{" "}
                                        <span className="font-medium">
                                          {userAnswer}
                                        </span>
                                      </p>
                                    )}
                                    {!isCorrect && (
                                      <p className="text-xs text-green-700 mt-1">
                                        সঠিক উত্তর:{" "}
                                        <span className="font-medium">
                                          {mcq.correct_answer}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={handleCloseQuiz}
                          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          বন্ধ করুন
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
