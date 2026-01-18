import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

/**
 * Hook to check if an article is bookmarked
 * @param articleId - The article ID to check
 * @returns Object containing isBookmarked status
 */
export function useBookmark(articleId: string) {
  const { user } = useAuth();

  const isBookmarked = useMemo(() => {
    if (!user || !user.bookmarks) return false;
    return user.bookmarks.some((bookmark) => bookmark.news === articleId);
  }, [user, articleId]);

  return {
    isBookmarked,
  };
}
