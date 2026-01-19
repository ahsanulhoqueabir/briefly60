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
  description?: string;
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
  keywords?: string[];
/**
 * Article classification fields
 */
export interface ArticleClassification {
  status: ArticleStatus;
  category: string;
  importance: number;
  keywords?: string[];
  clickbait_score: number;
  clickbait_reason?: string;
}

/**
 * Complete article from MongoDB
 */
export interface Article
  extends ArticleSource,
    ArticleContent,
    ArticleSummaries,
    ArticleClassification {
  _id: string;
  quiz_questions?: MCQ[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Article creation payload
 */
export interface CreateArticlePayload
  extends Partial<Omit<Article, "_id" | "createdAt" | "updatedAt">> {
  title: string;
  content: string;
  source_name: string;
  source_url: string;
  category: string;
  summary_60_bn: string;
  summary_60_en: string;
}

/**
 * Article update payload
 */
export interface UpdateArticlePayload
  extends Partial<Omit<Article, "_id" | "createdAt" | "updatedAt">> {}

/**
 * Article query filters
 */
export interface ArticleFilters {
  status?: ArticleStatus;
  category?: string;
  source_name?: string;
  published_after?: string;
  published_before?: string;
  importance_min?: number;
  importance_max?: number;
  clickbait_min?: number;
  clickbait_max?: number;
  search?: string;
  keywords?: string[];
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
