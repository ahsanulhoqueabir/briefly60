"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Article, ArticleStatus } from "@/types/news.types";
import { AdminArticleFilters, BulkArticleAction } from "@/types/admin.types";
import { DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { toast, ToastContainer } from "@/components/admin/Toast";
import usePrivateAxios from "@/hooks/use-private-axios";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Plus,
  Search as SearchIcon,
  Edit,
  Trash2,
  CheckCircle,
  X,
  FileText,
  Archive,
} from "lucide-react";

export default function ArticlesManagementPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AdminArticleFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    articleId: string | null;
  }>({ isOpen: false, articleId: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const axios = usePrivateAxios();

  const limit = 20;

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      if (filters.source_name)
        params.append("source_name", filters.source_name);
      if (filters.date_from) params.append("dateFrom", filters.date_from);
      if (filters.date_to) params.append("dateTo", filters.date_to);
      if (filters.importance_min !== undefined)
        params.append("importanceMin", filters.importance_min.toString());
      if (filters.importance_max !== undefined)
        params.append("importanceMax", filters.importance_max.toString());

      const response = await axios.get(
        `/api/dashboard/articles?${params.toString()}`,
      );
      const result = response.data;

      if (result.success) {
        setArticles(result.data);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalItems(result.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [page, filters, axios]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/dashboard/articles/${id}`);
      toast.success("Article deleted successfully");
      setDeleteModal({ isOpen: false, articleId: null });
      loadArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedRows);
      const response = await axios.post("/api/dashboard/articles/bulk", {
        ids,
        action: "delete",
      });
      const result = response.data;

      toast.success(
        `${result.data.success} articles deleted successfully${
          result.data.failed > 0 ? `, ${result.data.failed} failed` : ""
        }`,
      );
      setBulkDeleteModal(false);
      setSelectedRows(new Set());
      loadArticles();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
      toast.error("Failed to delete articles");
    }
  };

  const handleBulkAction = async (action: BulkArticleAction) => {
    try {
      const ids = Array.from(selectedRows);
      const response = await axios.post("/api/dashboard/articles/bulk", {
        ids,
        action,
      });
      const result = response.data;

      toast.success(
        `${result.data.success} articles updated successfully${
          result.data.failed > 0 ? `, ${result.data.failed} failed` : ""
        }`,
      );
      setSelectedRows(new Set());
      loadArticles();
    } catch (error) {
      console.error("Failed to bulk action:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      const newStatus: ArticleStatus =
        article.status === "published" ? "draft" : "published";
      await axios.patch(`/api/dashboard/articles/${article._id}`, {
        status: newStatus,
      });
      toast.success(
        `Article ${newStatus === "published" ? "published" : "unpublished"}`,
      );
      loadArticles();
    } catch (error) {
      console.error("Failed to toggle publish:", error);
      toast.error("Failed to update article status");
    }
  };

  const handleRowSelect = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(articles.map((a) => a._id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (article: Article) => (
        <div className="max-w-md py-1">
          <p className="font-semibold truncate text-foreground leading-tight">
            {article.title}
          </p>
          {article.banner && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {article.banner}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (article: Article) => (
        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold capitalize">
          {article.category}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (article: Article) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-2 ${
            article.status === "published"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : article.status === "draft"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {article.status === "published" ? (
            <CheckCircle className="size-4" />
          ) : article.status === "draft" ? (
            <FileText className="size-4" />
          ) : (
            <Archive className="size-4" />
          )}
          <span className="capitalize">{article.status}</span>
        </span>
      ),
    },
    {
      key: "source_name",
      label: "Source",
      render: (article: Article) => (
        <span className="text-sm">{article.source_name || "N/A"}</span>
      ),
    },
    {
      key: "published_at",
      label: "Published",
      render: (article: Article) => (
        <span className="text-sm">
          {new Date(article.published_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (article: Article) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/articles/${article._id}/edit`);
            }}
            className="w-28 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow flex items-center justify-center gap-2"
            title="Edit article"
          >
            <Edit className="size-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePublish(article);
            }}
            className={`w-28 px-3 py-1.5 text-xs rounded-md transition-all font-medium shadow-sm hover:shadow flex items-center justify-center gap-2 ${
              article.status === "published"
                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            title={
              article.status === "published"
                ? "Unpublish article"
                : "Publish article"
            }
          >
            {article.status === "published" ? (
              <>
                <FileText className="size-4" />
                <span>Draft</span>
              </>
            ) : (
              <>
                <CheckCircle className="size-4" />
                <span>Publish</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ isOpen: true, articleId: article._id });
            }}
            className="w-28 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-all font-medium shadow-sm hover:shadow flex items-center justify-center gap-2"
            title="Delete article"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Articles Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems > 0
              ? `${totalItems} total articles`
              : "No articles yet"}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/articles/new")}
          className="w-full sm:w-auto px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-sm hover:shadow-md flex items-center gap-2 justify-center"
        >
          <Plus className="size-4" />
          <span>Create Article</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by title, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 min-w-0 px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SearchIcon className="size-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) => {
                setFilters({
                  ...filters,
                  status:
                    value === "all" ? undefined : (value as ArticleStatus),
                });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full py-4">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={filters.category ?? "all"}
              onValueChange={(value) => {
                setFilters({
                  ...filters,
                  category: value === "all" ? undefined : value,
                });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full py-2.5">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="politics">Politics</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status || filters.category || filters.search) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-medium text-muted-foreground">
                Active Filters:
              </span>
              {filters.search && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                  Search: &quot;{filters.search}&quot;
                  <button
                    onClick={() => {
                      setFilters({ ...filters, search: "" });
                      setSearchTerm("");
                    }}
                    className="hover:text-primary/70"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                  Status: {filters.status}
                  <button
                    onClick={() =>
                      setFilters({ ...filters, status: undefined })
                    }
                    className="hover:text-primary/70"
                    aria-label="Clear status"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                  Category: {filters.category}
                  <button
                    onClick={() =>
                      setFilters({ ...filters, category: undefined })
                    }
                    className="hover:text-primary/70"
                    aria-label="Clear category"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm("");
                  setPage(1);
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <DataTable
          data={articles}
          columns={columns}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          loading={loading}
          idField="_id"
          emptyMessage={
            filters.search || filters.status || filters.category
              ? "No articles found matching your filters"
              : "No articles yet. Create your first article!"
          }
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={limit}
        />
      )}

      {/* Floating Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl border-2 border-primary shadow-2xl p-4 md:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {selectedRows.size}
                </span>
                article{selectedRows.size > 1 ? "s" : ""} selected
              </p>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleBulkAction("publish")}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                >
                  <CheckCircle className="size-4" />
                  <span>Publish</span>
                </button>
                <button
                  onClick={() => handleBulkAction("unpublish")}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                >
                  <FileText className="size-4" />
                  <span>Unpublish</span>
                </button>
                <button
                  onClick={() => handleBulkAction("archive")}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                >
                  <Archive className="size-4" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={() => setBulkDeleteModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-sm hover:shadow flex items-center gap-2 justify-center"
                >
                  <Trash2 className="size-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, articleId: null })}
        onConfirm={() => {
          if (deleteModal.articleId) {
            handleDelete(deleteModal.articleId);
          }
        }}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Articles"
        message={`Are you sure you want to delete ${selectedRows.size} article${
          selectedRows.size > 1 ? "s" : ""
        }? This action cannot be undone.`}
        confirmText="Delete All"
        type="danger"
      />
    </div>
  );
}
