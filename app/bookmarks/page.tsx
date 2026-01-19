"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark as BookmarkType } from "@/types/bookmark.types";
import { get, del } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkX, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AuthRequired from "@/components/AuthRequired";

const BookmarksPage: React.FC = () => {
  const { user, loading: auth_loading } = useAuth();
  const [bookmarks, set_bookmarks] = useState<BookmarkType[]>([]);
  const [loading, set_loading] = useState(true);
  const [deleting, set_deleting] = useState<string | null>(null);

  const fetch_bookmarks = async () => {
    try {
      set_loading(true);
      // api-client automatically unwraps { success: true, data: [...] } to just [...]
      const response = await get<BookmarkType[]>("/api/bookmarks");

      // Response is already unwrapped, so directly set it
      set_bookmarks(response);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    if (!auth_loading && user) {
      fetch_bookmarks();
    }
  }, [auth_loading, user]);

  const handle_delete = async (bookmark_id: string) => {
    try {
      set_deleting(bookmark_id);
      await del<{ success: boolean; message: string }>(
        `/api/bookmarks/${bookmark_id}`,
      );
      toast.success("Bookmark removed");
      fetch_bookmarks();
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      toast.error("Failed to remove bookmark");
    } finally {
      set_deleting(null);
    }
  };

  if (auth_loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthRequired>
        <div />
      </AuthRequired>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Bookmarks</h1>
        <p className="text-muted-foreground mt-2">
          Articles you&apos;ve saved for later reading
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : bookmarks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookmarkX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-4 text-center">
              Start bookmarking articles to save them for later
            </p>
            <Link href="/discover">
              <Button>Discover Articles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg leading-tight">
                      {bookmark.news_title || "Untitled Article"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handle_delete(bookmark._id)}
                      disabled={deleting === bookmark._id}
                      className="shrink-0"
                    >
                      {deleting === bookmark._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bookmark.news_source && (
                      <p className="text-sm text-muted-foreground">
                        Source: {bookmark.news_source}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Saved:{" "}
                      {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                    </p>
                    {bookmark.notes && (
                      <p className="text-sm bg-muted p-3 rounded-md">
                        <span className="font-medium">Notes:</span>{" "}
                        {bookmark.notes}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/article/${bookmark.news_id}`}>
                        <Button size="sm" variant="default">
                          Read Article
                        </Button>
                      </Link>
                      {bookmark.news_url && (
                        <a
                          href={bookmark.news_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="gap-2">
                            <ExternalLink className="h-3 w-3" />
                            Source
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BookmarksPage;
