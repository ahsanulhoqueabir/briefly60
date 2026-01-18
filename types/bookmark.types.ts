export interface BookmarkCreatePayload {
  news: string;
}

export interface Bookmark {
  id: string;
  news: string;
  user: string;
  date_created?: string;
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
