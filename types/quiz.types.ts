import { Types } from "mongoose";

/**
 * Quiz Attempt Types
 * For tracking user quiz attempts on articles
 */

export interface IQuizAnswer {
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface IQuizAttempt {
  _id: Types.ObjectId | string;
  user_id: Types.ObjectId | string;
  article_id: Types.ObjectId | string;
  article_title?: string;
  article_category?: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken?: number; // in seconds
  completed_at: Date;
  answers: IQuizAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuizAttemptPayload {
  article_id: string;
  answers: Array<{
    question: string;
    user_answer: string;
  }>;
  time_taken?: number;
}

export interface QuizAttemptResponse {
  attempt: IQuizAttempt;
  message: string;
}

export interface QuizAttemptHistory {
  attempts: IQuizAttempt[];
  total: number;
  average_score: number;
  best_score: number;
}

// For backward compatibility (can remove after refactoring)
export interface AttemptedItem {
  question_index: string;
  is_correct: boolean;
}

export interface AttemptedGroup {
  right_answers: number;
  attempted: AttemptedItem[];
  total_question: number;
}

export interface CreateQuizPayload {
  news: string;
  user?: string;
  attempted?: AttemptedGroup[];
}
