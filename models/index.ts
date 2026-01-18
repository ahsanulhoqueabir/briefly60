/**
 * Models Index
 * Centralized export for all MongoDB models
 * Import this file to ensure all models are registered with Mongoose
 */

import User from "./User.model";
import Subscription from "./Subscription.model";
import Bookmark from "./Bookmark.model";
import Article from "./Article.model";
import QuizAttempt from "./Quiz.model";

// Export all models
export { User, Subscription, Bookmark, Article, QuizAttempt };

// Export types
export type { IUser } from "./User.model";
export type { ISubscription } from "./Subscription.model";
export type { IBookmark } from "./Bookmark.model";
export type { IArticle, IMCQ, ArticleStatus } from "./Article.model";
export type { IQuizAttempt } from "./Quiz.model";

/**
 * Initialize all models
 * Call this function to ensure all models are registered
 */
export function initializeModels() {
  // Models are automatically registered when imported
  console.log("✅ Models initialized:", {
    User: User.modelName,
    Subscription: Subscription.modelName,
    Bookmark: Bookmark.modelName,
    Article: Article.modelName,
    QuizAttempt: QuizAttempt.modelName,
  });
}

export default {
  User,
  Subscription,
  Bookmark,
  Article,
  QuizAttempt,
};
