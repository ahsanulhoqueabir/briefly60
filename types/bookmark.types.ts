export interface BookmarkCreatePayload {
  news: string; // News article ID
}

export interface Bookmark {
  _id: string;
  user_id: string;
  news_id: string;
  news_title?: string;
  news_source?: string;
  news_url?: string;
  bookmarked_at: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkResponse {
  success: boolean;
  message?: string;
  data?: Bookmark[];
  error?: string;
}

export interface BookmarkCheckResponse {
  success: boolean;
  isBookmarked: boolean;
  bookmarkId: string | null;
  message?: string;
  error?: string;
}

export interface BookmarkToggleResponse {
  success: boolean;
  message?: string;
  isBookmarked: boolean;
  bookmarkId: string | null;
  error?: string;
}
