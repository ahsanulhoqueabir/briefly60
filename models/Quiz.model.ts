import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Quiz Attempt Model
 * Stores user's quiz attempt for a specific article
 * The actual quiz questions are embedded in the Article model
 */
export interface IQuizAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: Types.ObjectId;
  article_id: Types.ObjectId; // Reference to Article, not separate quiz
  article_title?: string;
  article_category?: string;
  score: number; // Percentage based on answered questions
  total_questions: number; // Total questions in quiz
  correct_answers: number; // Number of correct answers
  answered_questions?: number; // Number of questions actually answered
  skipped_questions?: number; // Number of questions skipped
  time_taken?: number; // in seconds
  completed_at: Date;
  answers: Array<{
    question: string;
    user_answer: string; // Can be "(Skipped)" for skipped questions
    correct_answer: string;
    is_correct: boolean; // Always false for skipped questions
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Article ID is required"],
    },
    article_title: {
      type: String,
      default: null,
    },
    article_category: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
      max: 100,
    },
    total_questions: {
      type: Number,
      required: [true, "Total questions is required"],
      min: 1,
    },
    correct_answers: {
      type: Number,
      required: [true, "Correct answers is required"],
      min: 0,
    },
    answered_questions: {
      type: Number,
      default: null,
      min: 0,
    },
    skipped_questions: {
      type: Number,
      default: null,
      min: 0,
    },
    time_taken: {
      type: Number,
      default: null,
    },
    completed_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    answers: [
      {
        question: {
          type: String,
          required: true,
        },
        user_answer: {
          type: String,
          required: true,
        },
        correct_answer: {
          type: String,
          required: true,
        },
        is_correct: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
QuizAttemptSchema.index({ user_id: 1, completed_at: -1 });
QuizAttemptSchema.index({ article_id: 1 });
QuizAttemptSchema.index({ article_category: 1 });
QuizAttemptSchema.index({ user_id: 1, article_id: 1 });

const QuizAttempt: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);

export default QuizAttempt;
