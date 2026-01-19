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
    if (
      !user ||
      !user.bookmarkedNewsIds ||
      user.bookmarkedNewsIds.length === 0
    ) {
      return false;
    }

    // Check if the article ID exists in the bookmarkedNewsIds array
    return user.bookmarkedNewsIds.includes(articleId);
  }, [user, articleId]);

  return {
    isBookmarked,
  };
}
