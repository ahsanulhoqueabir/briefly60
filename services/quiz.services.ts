import connectDB from "@/lib/mongodb";
import Article from "@/models/Article.model";
import QuizAttempt from "@/models/Quiz.model";
import { CreateQuizAttemptPayload, IQuizAnswer } from "@/types/quiz.types";
import mongoose from "mongoose";

export class QuizService {
  /**
   * Submit a quiz attempt for an article
   */
  static async submitQuizAttempt(
    userId: string,
    payload: CreateQuizAttemptPayload,
  ) {
    try {
      await connectDB();

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(payload.article_id)
      ) {
        return {
          success: false,
          message: "Invalid user or article ID",
        };
      }

      // Get article with quiz questions
      const article = await Article.findById(payload.article_id).select(
        "title category quiz_questions status",
      );

      if (!article) {
        return {
          success: false,
          message: "Article not found",
        };
      }

      if (article.status !== "published") {
        return {
          success: false,
          message: "Article is not published",
        };
      }

      if (!article.quiz_questions || article.quiz_questions.length === 0) {
        return {
          success: false,
          message: "This article has no quiz questions",
        };
      }

      // Validate answers and calculate score
      const quizQuestions = article.quiz_questions;
      const totalQuestions = quizQuestions.length;

      if (payload.answers.length !== totalQuestions) {
        return {
          success: false,
          message: `Expected ${totalQuestions} answers, got ${payload.answers.length}`,
        };
      }

      let correctAnswers = 0;
      const evaluatedAnswers: IQuizAnswer[] = [];

      // Check each answer
      for (let i = 0; i < totalQuestions; i++) {
        const question = quizQuestions[i];
        const userAnswer = payload.answers.find(
          (a) => a.question === question.question,
        );

        if (!userAnswer) {
          return {
            success: false,
            message: `Missing answer for question: ${question.question}`,
          };
        }

        const isCorrect = userAnswer.user_answer === question.correct_answer;
        if (isCorrect) correctAnswers++;

        evaluatedAnswers.push({
          question: question.question,
          user_answer: userAnswer.user_answer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
        });
      }

      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Create quiz attempt
      const attempt = await QuizAttempt.create({
        user_id: userId,
        article_id: payload.article_id,
        article_title: article.title,
        article_category: article.category,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_taken: payload.time_taken,
        completed_at: new Date(),
        answers: evaluatedAnswers,
      });

      return {
        success: true,
        message: "Quiz submitted successfully",
        data: {
          attempt_id: attempt._id,
          score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          percentage: score,
          answers: evaluatedAnswers,
        },
      };
    } catch (error) {
      console.error("Submit quiz attempt error:", error);
      return {
        success: false,
        message: "Failed to submit quiz attempt",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user's quiz attempt history
   */
  static async getUserQuizHistory(userId: string, limit = 20, skip = 0) {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: "Invalid user ID",
        };
      }

      const attempts = await QuizAttempt.find({ user_id: userId })
        .sort({ completed_at: -1 })
        .limit(limit)
        .skip(skip)
        .select("-__v");

      const total = await QuizAttempt.countDocuments({ user_id: userId });

      // Calculate statistics
      const scores = attempts.map((a) => a.score);
      const average_score =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
      const best_score = scores.length > 0 ? Math.max(...scores) : 0;

      return {
        success: true,
        data: {
          attempts,
          total,
          average_score,
          best_score,
          has_more: total > skip + limit,
        },
      };
    } catch (error) {
      console.error("Get quiz history error:", error);
      return {
        success: false,
        message: "Failed to get quiz history",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user's attempts for a specific article
   */
  static async getArticleAttempts(userId: string, articleId: string) {
    try {
      await connectDB();

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(articleId)
      ) {
        return {
          success: false,
          message: "Invalid user or article ID",
        };
      }

      const attempts = await QuizAttempt.find({
        user_id: userId,
        article_id: articleId,
      })
        .sort({ completed_at: -1 })
        .select("-__v");

      const bestAttempt =
        attempts.length > 0
          ? attempts.reduce((best, current) =>
              current.score > best.score ? current : best,
            )
          : null;

      return {
        success: true,
        data: {
          attempts,
          total_attempts: attempts.length,
          best_score: bestAttempt?.score || 0,
          last_attempt: attempts[0] || null,
        },
      };
    } catch (error) {
      console.error("Get article attempts error:", error);
      return {
        success: false,
        message: "Failed to get article attempts",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get quiz leaderboard for an article
   */
  static async getArticleLeaderboard(articleId: string, limit = 10) {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return {
          success: false,
          message: "Invalid article ID",
        };
      }

      const leaderboard = await QuizAttempt.aggregate([
        { $match: { article_id: new mongoose.Types.ObjectId(articleId) } },
        {
          $group: {
            _id: "$user_id",
            best_score: { $max: "$score" },
            total_attempts: { $sum: 1 },
            fastest_time: { $min: "$time_taken" },
            last_attempt: { $max: "$completed_at" },
          },
        },
        { $sort: { best_score: -1, fastest_time: 1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            user_id: "$_id",
            user_name: "$user.name",
            user_email: "$user.email",
            best_score: 1,
            total_attempts: 1,
            fastest_time: 1,
            last_attempt: 1,
          },
        },
      ]);

      return {
        success: true,
        data: leaderboard,
      };
    } catch (error) {
      console.error("Get leaderboard error:", error);
      return {
        success: false,
        message: "Failed to get leaderboard",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
