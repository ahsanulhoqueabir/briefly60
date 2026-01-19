"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IQuizAttempt } from "@/types/quiz.types";
import { get } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Brain, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AuthRequired from "@/components/AuthRequired";
import { cn } from "@/lib/utils";

const QuizHistoryPage: React.FC = () => {
  const { user, loading: auth_loading } = useAuth();
  const [attempts, set_attempts] = useState<IQuizAttempt[]>([]);
  const [stats, set_stats] = useState<{
    total_attempts: number;
    average_score: number;
    highest_score: number;
    total_correct: number;
    total_questions: number;
  } | null>(null);
  const [loading, set_loading] = useState(true);
  const [page, set_page] = useState(1);
  const [total_pages, set_total_pages] = useState(1);

  const fetch_quiz_history = async (current_page: number = 1) => {
    try {
      set_loading(true);
      const skip = (current_page - 1) * 10;

      // api-client automatically unwraps { success: true, data: {...} } to just {...}
      const response = await get<{
        attempts: IQuizAttempt[];
        total: number;
        average_score: number;
        best_score: number;
      }>(`/api/quiz/history?limit=10&skip=${skip}`);

      // Response is already unwrapped
      set_attempts(response.attempts);
      const total = response.total;
      set_total_pages(Math.ceil(total / 10));
      set_page(current_page);

      // Set stats from history response
      set_stats({
        total_attempts: total,
        average_score: response.average_score,
        highest_score: response.best_score,
        total_correct: 0,
        total_questions: 0,
      });
    } catch (error) {
      console.error("Failed to fetch quiz history:", error);
      toast.error("Failed to load quiz history");
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    if (!auth_loading && user) {
      fetch_quiz_history();
    }
  }, [auth_loading, user]);

  const get_score_color = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const get_score_bg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900/20";
    if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  if (auth_loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthRequired>
        <div />
      </AuthRequired>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
        <p className="text-muted-foreground mt-2">
          Track your quiz performance and progress
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && stats.total_attempts > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Total Quizzes",
                  value: stats.total_attempts,
                  icon: Brain,
                  bg_color: "bg-primary/10",
                  icon_color: "text-primary",
                  suffix: "",
                },
                {
                  label: "Avg Score",
                  value: stats.average_score,
                  icon: TrendingUp,
                  bg_color: "bg-blue-100 dark:bg-blue-900/20",
                  icon_color: "text-blue-600 dark:text-blue-400",
                  suffix: "%",
                },
                {
                  label: "Best Score",
                  value: stats.highest_score,
                  icon: Award,
                  bg_color: "bg-green-100 dark:bg-green-900/20",
                  icon_color: "text-green-600 dark:text-green-400",
                  suffix: "%",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-3 sm:p-5 sm:pt-6 ">
                      <div className="hidden sm:flex items-center gap-4">
                        <div
                          className={cn(
                            "p-1.5 sm:p-3 rounded-full",
                            stat.bg_color,
                          )}
                        >
                          <Icon
                            className={cn(stat.icon_color, "size-3 sm:size-6")}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold">
                            {stat.value}
                            {stat.suffix}
                          </p>
                        </div>
                      </div>
                      <div className=" sm:hidden ">
                        <div className="flex gap-1">
                          <div
                            className={cn("p-1.5  rounded-full", stat.bg_color)}
                          >
                            <Icon className={cn(stat.icon_color, "size-4")} />
                          </div>
                          <p className="flex-1 text-2xl font-bold">
                            {stat.value}
                            {stat.suffix}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quiz Attempts List */}
          {attempts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  No quiz attempts yet
                </h2>
                <p className="text-muted-foreground mb-4 text-center">
                  Take a quiz to test your knowledge
                </p>
                <Link href="/discover">
                  <Button>Explore Articles</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {attempts.map((attempt) => (
                  <Card key={attempt._id.toString()}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight mb-2">
                            {attempt.article_title || "Untitled Article"}
                          </CardTitle>
                          {attempt.article_category && (
                            <span className="inline-block text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {attempt.article_category}
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            "px-4 py-2 rounded-lg font-bold text-lg shrink-0",
                            get_score_bg(attempt.score),
                          )}
                        >
                          <span className={get_score_color(attempt.score)}>
                            {attempt.score}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Correct
                          </p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {attempt.correct_answers}/{attempt.total_questions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Answered
                          </p>
                          <p className="text-lg font-semibold">
                            {attempt.answered_questions ||
                              attempt.total_questions}
                          </p>
                        </div>
                        {attempt.skipped_questions !== undefined &&
                          attempt.skipped_questions > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Skipped
                              </p>
                              <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                                {attempt.skipped_questions}
                              </p>
                            </div>
                          )}
                        {attempt.time_taken && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Time
                            </p>
                            <p className="text-lg font-semibold">
                              {Math.floor(attempt.time_taken / 60)}m{" "}
                              {attempt.time_taken % 60}s
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                          Completed:{" "}
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                        <Link href={`/article/${attempt.article_id}`}>
                          <Button size="sm" variant="outline">
                            View Article
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => fetch_quiz_history(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {total_pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetch_quiz_history(page + 1)}
                    disabled={page === total_pages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QuizHistoryPage;
