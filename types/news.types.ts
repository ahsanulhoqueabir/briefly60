/**
 * Article status enum
 */
export type ArticleStatus = "published" | "draft" | "archived";

/**
 * Multiple Choice Question structure
 */
export interface MCQ {
  question: string;
  options: string[];
  correct_answer: string;
}

/**
 * Base article metadata fields
 */
export interface ArticleMetadata {
  id: string;
  status: ArticleStatus;
  sort: number | null;
  user_created: string;
  date_created: string;
  user_updated: string;
  date_updated: string;
}

/**
 * Article source information
 */
export interface ArticleSource {
  source_name: string;
  source_url: string;
}

/**
 * Article content fields
 */
export interface ArticleContent {
  title: string;
  corrected_title?: string;
  content: string;
  banner?: string;
  published_at: string;
}

/**
 * Article summaries (bilingual)
 */
export interface ArticleSummaries {
  summary_60_bn: string;
  summary_60_en: string;
}

/**
 * Article classification and quality metrics
 */
export interface ArticleClassification {
  category: string;
  importance: number;
  keywords: string[];
  clickbait_score: number;
  clickbait_reason: string;
}

/**
 * Complete article from Directus b60_articles collection
 */
export interface Article
  extends ArticleMetadata,
    ArticleSource,
    ArticleContent,
    ArticleSummaries,
    ArticleClassification {
  mcqs?: MCQ[];
}

/**
 * Article creation payload (required fields only)
 */
export interface CreateArticlePayload
  extends Partial<
    Omit<
      Article,
      "id" | "user_created" | "date_created" | "user_updated" | "date_updated"
    >
  > {
  title: string;
}

/**
 * Article update payload (all fields optional except id)
 */
export interface UpdateArticlePayload
  extends Partial<
    Omit<
      Article,
      "id" | "user_created" | "date_created" | "user_updated" | "date_updated"
    >
  > {
  id: string;
}

/**
 * Article query filters
 */
export interface ArticleFilters {
  status?: ArticleStatus;
  category?: string;
  published_after?: string;
  published_before?: string;
  importance_min?: number;
  importance_max?: number;
  search?: string;
  keywords?: string[];
  clickbait_max?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  sort_by?:
    | "date_created"
    | "date_updated"
    | "published_at"
    | "importance"
    | "clickbait_score";
  sort_order?: "asc" | "desc";
}

/**
 * Article query parameters (combines filters, pagination, sorting)
 */
export interface ArticleQueryParams
  extends ArticleFilters,
    PaginationParams,
    SortParams {
  fields?: string[];
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    filter_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
