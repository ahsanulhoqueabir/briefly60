/**
 * Discover page filter state
 */
export interface DiscoverFilters {
  source_name: string;
  category: string;
  published_after: string;
  published_before: string;
  importance_min: number;
  importance_max: number;
  clickbait_min: number;
  clickbait_max: number;
  search: string;
  keywords: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}
