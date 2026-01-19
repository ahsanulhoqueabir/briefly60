import dbConnect from "@/lib/mongodb";
import Article, { IArticle } from "@/models/Article.model";
import {
  Article as ArticleType,
  ArticleQueryParams,
  CreateArticlePayload,
  PaginatedResponse,
  UpdateArticlePayload,
} from "@/types/news.types";

export class NewsService {
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;
  private static readonly DEFAULT_FIELDS = [
    "_id",
    "title",
    "category",
    "summary_60_bn",
    "summary_60_en",
    "clickbait_score",
    "corrected_title",
    "keywords",
    "source_name",
    "source_url",
    "banner",
    "published_at",
    "quiz_questions",
  ];

  /**
   * Convert string _id to string for response
   */
  private static formatArticle(article: IArticle): ArticleType {
    return {
      ...article.toObject(),
      _id: article._id.toString(),
      published_at: article.published_at.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  /**
   * Build MongoDB filter object from query parameters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static buildFilter(params: ArticleQueryParams): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // Status filter
    if (params.status) {
      filter.status = params.status;
    }

    // Category filter
    if (params.category) {
      filter.category = params.category;
    }

    // Source filter
    if (params.source_name) {
      filter.source_name = params.source_name;
    }

    // Date range filters
    if (params.published_after || params.published_before) {
      filter.published_at = {};
      if (params.published_after) {
        filter.published_at.$gte = new Date(params.published_after);
      }
      if (params.published_before) {
        filter.published_at.$lte = new Date(params.published_before);
      }
    }

    // Importance range filters
    if (
      params.importance_min !== undefined ||
      params.importance_max !== undefined
    ) {
      filter.importance = {};
      if (params.importance_min !== undefined) {
        filter.importance.$gte = params.importance_min;
      }
      if (params.importance_max !== undefined) {
        filter.importance.$lte = params.importance_max;
      }
    }

    // Clickbait score filter
    if (
      params.clickbait_min !== undefined ||
      params.clickbait_max !== undefined
    ) {
      filter.clickbait_score = {};
      if (params.clickbait_min !== undefined) {
        filter.clickbait_score.$gte = params.clickbait_min;
      }
      if (params.clickbait_max !== undefined) {
        filter.clickbait_score.$lte = params.clickbait_max;
      }
    }

    // Search in title and content using text search
    if (params.search) {
      filter.$text = { $search: params.search };
    }

    // Keywords filter (array contains any of the provided keywords)
    if (params.keywords && params.keywords.length > 0) {
      filter.keywords = { $in: params.keywords };
    }

    return filter;
  }

  /**
   * Build sort parameter for MongoDB
   */
  private static buildSort(params: ArticleQueryParams): Record<string, number> {
    if (!params.sort_by) {
      return { published_at: -1 }; // Default: latest first
    }

    const sortOrder: number = params.sort_order === "asc" ? 1 : -1;
    return { [params.sort_by]: sortOrder };
  }

  /**
   * Fetch articles with advanced filtering, pagination, and sorting
   */
  static async getArticles(
    params: ArticleQueryParams = {},
  ): Promise<PaginatedResponse<ArticleType>> {
    try {
      await dbConnect();

      // Set default status to published if not specified
      const defaultParams: ArticleQueryParams = {
        status: "published",
        ...params,
      };

      const limit = Math.min(
        defaultParams.limit || this.DEFAULT_LIMIT,
        this.MAX_LIMIT,
      );
      const page = defaultParams.page || 1;
      const offset =
        defaultParams.offset !== undefined
          ? defaultParams.offset
          : (page - 1) * limit;

      const filter = this.buildFilter(defaultParams);
      const sort = this.buildSort(defaultParams);
      const fields = defaultParams.fields || this.DEFAULT_FIELDS;

      // Create the query builder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = Article.find(filter);

      // Apply field selection if specified
      if (fields && fields.length > 0) {
        query = query.select(fields.join(" "));
      }

      // Apply sorting
      query = query.sort(sort);

      // Apply pagination
      query = query.skip(offset).limit(limit);

      // Execute query
      const articles = await query.exec();

      // Get total count for the filter
      const totalCount = await Article.countDocuments(filter);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedArticles = articles.map((article: any) =>
        this.formatArticle(article),
      );

      return {
        data: formattedArticles,
        meta: {
          total_count: totalCount,
          filter_count: totalCount,
          page,
          limit,
          total_pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  }

  /**
   * Get a single article by ID
   */
  static async getArticleById(
    id: string,
    fields?: string[],
  ): Promise<ArticleType> {
    try {
      await dbConnect();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = Article.findById(id);

      if (fields && fields.length > 0) {
        query = query.select(fields.join(" "));
      }

      const article = await query.exec();

      if (!article) {
        throw new Error(`Article with ID ${id} not found`);
      }

      return this.formatArticle(article);
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new article
   */
  static async createArticle(
    payload: CreateArticlePayload,
  ): Promise<ArticleType> {
    try {
      await dbConnect();

      const article = new Article(payload);
      const savedArticle = await article.save();

      return this.formatArticle(savedArticle);
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  }

  /**
   * Update an existing article
   */
  static async updateArticle(
    id: string,
    payload: UpdateArticlePayload,
  ): Promise<ArticleType> {
    try {
      await dbConnect();

      const article = await Article.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });

      if (!article) {
        throw new Error(`Article with ID ${id} not found`);
      }

      return this.formatArticle(article);
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an article
   */
  static async deleteArticle(id: string): Promise<void> {
    try {
      await dbConnect();

      const result = await Article.findByIdAndDelete(id);

      if (!result) {
        throw new Error(`Article with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get articles by category
   */
  static async getArticlesByCategory(
    category: string,
    params: Omit<ArticleQueryParams, "category"> = {},
  ): Promise<PaginatedResponse<ArticleType>> {
    return this.getArticles({ ...params, category });
  }

  /**
   * Get featured articles (high importance, low clickbait)
   */
  static async getFeaturedArticles(limit: number = 10): Promise<ArticleType[]> {
    const response = await this.getArticles({
      importance_min: 7,
      clickbait_max: 3,
      status: "published",
      limit,
      sort_by: "importance",
      sort_order: "desc",
    });

    return response.data;
  }

  /**
   * Search articles
   */
  static async searchArticles(
    query: string,
    params: Omit<ArticleQueryParams, "search"> = {},
  ): Promise<PaginatedResponse<ArticleType>> {
    return this.getArticles({ ...params, search: query });
  }
}
