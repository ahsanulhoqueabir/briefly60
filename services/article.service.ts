import connectDB from "@/lib/mongodb";
import Article from "@/models/Article.model";
import mongoose from "mongoose";

export class ArticleService {
  /**
   * Create a new article (Admin/Editor only)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async createArticle(data: any) {
    try {
      await connectDB();

      const article = await Article.create(data);

      return {
        success: true,
        message: "Article created successfully",
        data: article,
      };
    } catch (error) {
      console.error("Create article error:", error);
      return {
        success: false,
        message: "Failed to create article",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get all published articles with pagination and filters
   */
  static async getArticles(options: {
    page?: number;
    limit?: number;
    category?: string;
    source?: string;
    importance?: "low" | "medium" | "high" | "breaking";
    search?: string;
    status?: string;
    type?: "latest" | "important";
  }) {
    try {
      await connectDB();

      const {
        page = 1,
        limit = 20,
        category,
        source,
        importance,
        search,
        status = "published",
        type,
      } = options;

      const skip = (page - 1) * limit;

      // Build query
      const query: any = { status };

      if (category) query.category = category;
      if (source) query.source = source;
      if (importance) query.importance = importance;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ];
      }

      // For important news type: filter last 7 days and importance >= 6
      if (type === "important") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query.published_at = { $gte: sevenDaysAgo };
        query.importance = { $gte: 6 }; // Only articles with importance 6 or higher
      }

      // Get articles with appropriate sorting
      let articlesQuery = Article.find(query)
        .limit(limit)
        .skip(skip)
        .select("-__v");

      // Sort by importance (descending) for important type, otherwise by date
      if (type === "important") {
        articlesQuery = articlesQuery.sort({
          importance: -1,
          published_at: -1,
        });
      } else {
        articlesQuery = articlesQuery.sort({ published_at: -1 });
      }

      const articles = await articlesQuery;

      const total = await Article.countDocuments(query);

      return {
        success: true,
        data: articles,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
          has_more: total > skip + limit,
        },
      };
    } catch (error) {
      console.error("Get articles error:", error);
      return {
        success: false,
        message: "Failed to get articles",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get a single article by ID
   */
  static async getArticleById(id: string, includeQuiz = false) {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "Invalid article ID",
        };
      }

      let selectFields = "-__v";

      // Exclude quiz questions unless specifically requested
      if (!includeQuiz) {
        selectFields += " -quiz_questions";
      }

      const article = await Article.findById(id).select(selectFields).exec();

      if (!article) {
        return {
          success: false,
          message: "Article not found",
        };
      }

      return {
        success: true,
        data: article,
      };
    } catch (error) {
      console.error("Get article error:", error);
      return {
        success: false,
        message: "Failed to get article",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get article quiz questions only
   */
  static async getArticleQuiz(id: string) {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "Invalid article ID",
        };
      }

      const article = await Article.findById(id)
        .select("title category quiz_questions")
        .lean();

      if (!article) {
        return {
          success: false,
          message: "Article not found",
        };
      }

      if (!article.quiz_questions || article.quiz_questions.length === 0) {
        return {
          success: false,
          message: "This article has no quiz questions",
        };
      }

      // Remove correct answers from questions (user shouldn't see them)
      const quiz = article.quiz_questions.map(({ correct_answer, ...q }) => q);

      return {
        success: true,
        data: {
          article_id: article._id,
          article_title: article.title,
          article_category: article.category,
          total_questions: quiz.length,
          questions: quiz,
        },
      };
    } catch (error) {
      console.error("Get article quiz error:", error);
      return {
        success: false,
        message: "Failed to get article quiz",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update an article (Admin/Editor only)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async updateArticle(id: string, data: any) {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "Invalid article ID",
        };
      }

      const article = await Article.findByIdAndUpdate(
        id,
        { ...data, updated_at: new Date() },
        { new: true, runValidators: true },
      );

      if (!article) {
        return {
          success: false,
          message: "Article not found",
        };
      }

      return {
        success: true,
        message: "Article updated successfully",
        data: article,
      };
    } catch (error) {
      console.error("Update article error:", error);
      return {
        success: false,
        message: "Failed to update article",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete an article (Admin only)
   */
  static async deleteArticle(id: string) {
    try {
      await connectDB();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "Invalid article ID",
        };
      }

      const article = await Article.findByIdAndDelete(id);

      if (!article) {
        return {
          success: false,
          message: "Article not found",
        };
      }

      return {
        success: true,
        message: "Article deleted successfully",
      };
    } catch (error) {
      console.error("Delete article error:", error);
      return {
        success: false,
        message: "Failed to delete article",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get featured articles
   */
  static async getFeaturedArticles(limit = 5) {
    try {
      await connectDB();

      const articles = await Article.find({
        status: "published",
        importance: { $gte: 8 }, // High importance articles (8-10)
      })
        .sort({ published_at: -1 })
        .limit(limit)
        .select("-quiz_questions -__v");

      return {
        success: true,
        data: articles,
      };
    } catch (error) {
      console.error("Get featured articles error:", error);
      return {
        success: false,
        message: "Failed to get featured articles",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get articles by category
   */
  static async getArticlesByCategory(category: string, limit = 10) {
    try {
      await connectDB();

      const articles = await Article.find({
        status: "published",
        category,
      })
        .sort({ published_at: -1 })
        .limit(limit)
        .select("-quiz_questions -__v");

      return {
        success: true,
        data: articles,
      };
    } catch (error) {
      console.error("Get articles by category error:", error);
      return {
        success: false,
        message: "Failed to get articles",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search articles
   */
  static async searchArticles(searchTerm: string, limit = 20) {
    try {
      await connectDB();

      const articles = await Article.find({
        status: "published",
        $text: { $search: searchTerm },
      })
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .select("-quiz_questions -__v");

      return {
        success: true,
        data: articles,
      };
    } catch (error) {
      console.error("Search articles error:", error);
      return {
        success: false,
        message: "Failed to search articles",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get trending articles (most quizzed)
   */
  static async getTrendingArticles(limit = 10) {
    try {
      await connectDB();

      // Get articles with most quiz attempts in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trending = await Article.aggregate([
        { $match: { status: "published" } },
        {
          $lookup: {
            from: "quizattempts",
            let: { article_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$article_id", "$$article_id"] },
                  completed_at: { $gte: sevenDaysAgo },
                },
              },
              { $count: "count" },
            ],
            as: "quiz_attempts",
          },
        },
        {
          $addFields: {
            quiz_count: {
              $ifNull: [{ $arrayElemAt: ["$quiz_attempts.count", 0] }, 0],
            },
          },
        },
        { $sort: { quiz_count: -1, published_at: -1 } },
        { $limit: limit },
        {
          $project: {
            quiz_questions: 0,
            quiz_attempts: 0,
            __v: 0,
          },
        },
      ]);

      return {
        success: true,
        data: trending,
      };
    } catch (error) {
      console.error("Get trending articles error:", error);
      return {
        success: false,
        message: "Failed to get trending articles",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
