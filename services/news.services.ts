import directusApi from "@/lib/directus";
import {
  Article,
  ArticleQueryParams,
  CreateArticlePayload,
  PaginatedResponse,
  UpdateArticlePayload,
} from "@/types/news.types";

/**
 * Directus filter object type
 */
type DirectusFilterValue = {
  _eq?: string | number;
  _neq?: string | number;
  _lt?: string | number;
  _lte?: string | number;
  _gt?: string | number;
  _gte?: string | number;
  _contains?: string;
  _ncontains?: string;
  _in?: (string | number)[];
  _nin?: (string | number)[];
  [key: string]: unknown;
};

type DirectusFilter = Record<
  string,
  DirectusFilterValue | DirectusFilter[] | unknown
>;

/**
 * Directus query parameters
 */
interface DirectusQueryParams {
  fields?: string;
  limit?: number;
  offset?: number;
  meta?: string;
  filter?: string;
  sort?: string;
}

export class NewsService {
  private static readonly COLLECTION = "b60_articles";
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 100;
  private static readonly DEFAULT_FIELDS = [
    "id",
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
    "mcqs",
  ];

  /**
   * Build Directus filter object from query parameters
   */
  private static buildFilter(
    params: ArticleQueryParams,
  ): DirectusFilter | undefined {
    const filter: DirectusFilter = {};

    // Status filter
    if (params.status) {
      filter.status = { _eq: params.status };
    }

    // Category filter
    if (params.category) {
      filter.category = { _eq: params.category };
    }

    // Source filter
    if (params.source_name) {
      filter.source_name = { _eq: params.source_name };
    }

    // Date range filters
    if (params.published_after || params.published_before) {
      const publishedAtFilter: DirectusFilterValue = {};
      if (params.published_after) {
        publishedAtFilter._gte = params.published_after;
      }
      if (params.published_before) {
        publishedAtFilter._lte = params.published_before;
      }
      filter.published_at = publishedAtFilter;
    }

    // Importance range filters
    if (
      params.importance_min !== undefined ||
      params.importance_max !== undefined
    ) {
      const importanceFilter: DirectusFilterValue = {};
      if (params.importance_min !== undefined) {
        importanceFilter._gte = params.importance_min;
      }
      if (params.importance_max !== undefined) {
        importanceFilter._lte = params.importance_max;
      }
      filter.importance = importanceFilter;
    }

    // Clickbait score filter
    if (
      params.clickbait_min !== undefined ||
      params.clickbait_max !== undefined
    ) {
      const clickbaitFilter: DirectusFilterValue = {};
      if (params.clickbait_min !== undefined) {
        clickbaitFilter._gte = params.clickbait_min;
      }
      if (params.clickbait_max !== undefined) {
        clickbaitFilter._lte = params.clickbait_max;
      }
      filter.clickbait_score = clickbaitFilter;
    }

    // Search in title and content
    if (params.search) {
      filter._or = [
        { title: { _contains: params.search } },
        { corrected_title: { _contains: params.search } },
        { content: { _contains: params.search } },
        { summary_60_bn: { _contains: params.search } },
        { summary_60_en: { _contains: params.search } },
      ];
    }

    // Keywords filter (array contains any of the provided keywords)
    if (params.keywords && params.keywords.length > 0) {
      filter._and = params.keywords.map((keyword) => ({
        keywords: { _contains: keyword },
      }));
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  /**
   * Build sort parameter
   */
  private static buildSort(params: ArticleQueryParams): string[] | undefined {
    if (!params.sort_by) return ["-published_at"]; // Default: latest first

    const prefix = params.sort_order === "asc" ? "" : "-";
    return [`${prefix}${params.sort_by}`];
  }

  /**
   * Fetch articles with advanced filtering, pagination, and sorting
   */
  static async getArticles(
    params: ArticleQueryParams = {},
  ): Promise<PaginatedResponse<Article>> {
    try {
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

      const queryParams: DirectusQueryParams = {
        fields: fields.join(","),
        limit,
        offset,
        meta: "filter_count,total_count",
      };

      if (filter && Object.keys(filter).length > 0) {
        queryParams.filter = JSON.stringify(filter);
      }

      if (sort) {
        queryParams.sort = sort.join(",");
      }

      const response = await directusApi.get(`/items/${this.COLLECTION}`, {
        params: queryParams,
      });

      const data = response.data.data || [];
      const meta = response.data.meta || {};

      return {
        data,
        meta: {
          total_count: meta.total_count || 0,
          filter_count: meta.filter_count || 0,
          page,
          limit,
          total_pages: Math.ceil((meta.filter_count || 0) / limit),
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
  static async getArticleById(id: string, fields?: string[]): Promise<Article> {
    try {
      const queryParams: DirectusQueryParams = {};
      if (fields) {
        queryParams.fields = fields.join(",");
      }

      const response = await directusApi.get(
        `/items/${this.COLLECTION}/${id}`,
        { params: queryParams },
      );

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new article
   */
  static async createArticle(payload: CreateArticlePayload): Promise<Article> {
    try {
      const response = await directusApi.post(
        `/items/${this.COLLECTION}`,
        payload,
      );

      return response.data.data;
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
  ): Promise<Article> {
    try {
      const response = await directusApi.patch(
        `/items/${this.COLLECTION}/${id}`,
        payload,
      );

      return response.data.data;
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
      await directusApi.delete(`/items/${this.COLLECTION}/${id}`);
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
  ): Promise<PaginatedResponse<Article>> {
    return this.getArticles({ ...params, category });
  }

  /**
   * Get featured articles (high importance, low clickbait)
   */
  static async getFeaturedArticles(limit: number = 10): Promise<Article[]> {
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
  ): Promise<PaginatedResponse<Article>> {
    return this.getArticles({ ...params, search: query });
  }
}
