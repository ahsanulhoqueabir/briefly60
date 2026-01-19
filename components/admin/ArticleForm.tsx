"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArticleFormData } from "@/types/admin.types";
import { toast, ToastContainer } from "@/components/admin/Toast";
import Image from "next/image";
import usePrivateAxios from "@/hooks/use-private-axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleFormProps {
  articleId?: string;
  mode: "create" | "edit";
}

export default function ArticleForm({ articleId, mode }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bannerBase64, setBannerBase64] = useState<string>("");
  const [bannerFileName, setBannerFileName] = useState<string>("");
  const axios = usePrivateAxios();

  const form = useForm<ArticleFormData>({
    defaultValues: {
      title: "",
      content: "",
      category: "",
      source_name: "",
      source_url: "",
      published_at: new Date().toISOString().split("T")[0],
      status: "draft",
      importance: 5,
      keywords: [],
      banner: "",
    },
  });

  useEffect(() => {
    loadCategories();
    if (mode === "edit" && articleId) {
      loadArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, mode]);

  const loadCategories = async () => {
    try {
      const response = await axios.get("/api/dashboard/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadArticle = async () => {
    if (!articleId) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboard/articles/${articleId}`);

      if (response.data.success) {
        const article = response.data.data;
        form.reset({
          title: article.title,
          content: article.content,
          category: article.category,
          source_name: article.source_name,
          source_url: article.source_url,
          published_at: article.published_at.split("T")[0],
          status: article.status,
          importance: article.importance,
          keywords: article.keywords || [],
          banner: article.banner || "",
        });
      }
    } catch (error) {
      console.error("Failed to load article:", error);
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      setLoading(true);

      // Prepare data with base64 image if available
      const submitData = {
        ...data,
        ...(bannerBase64 && {
          bannerBase64,
          bannerFileName,
        }),
      };

      if (mode === "create") {
        await axios.post("/api/dashboard/articles", submitData);
        toast.success("Article created successfully");
      } else if (articleId) {
        await axios.patch(`/api/dashboard/articles/${articleId}`, submitData);
        toast.success("Article updated successfully");
      }
      router.push("/dashboard/articles");
    } catch (error) {
      console.error("Failed to save article:", error);
      toast.error(`Failed to ${mode} article`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        // Store base64 and filename for later upload
        setBannerBase64(base64String);
        setBannerFileName(file.name);

        // Update form preview
        form.setValue("banner", base64String);
        toast.success("Image ready to upload");
        setUploading(false);
      };

      reader.onerror = () => {
        toast.error("Failed to read image file");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to process image");
      setUploading(false);
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    form.setValue("keywords", keywords);
  };

  if (loading && mode === "edit") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {mode === "create" ? "Create New Article" : "Edit Article"}
          </h2>
          <p className="text-muted-foreground">
            Fill in the details below to {mode} an article
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Basic Information
            </h3>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter article title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              rules={{ required: "Content is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Content <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter article content"
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category, Importance, Status - Same Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl className="flex-1 w-full">
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="">
                          {categories
                            .filter((cat) => cat && cat.trim() !== "")
                            .map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl className="flex-1 w-full">
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="importance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importance: {field.value}</FormLabel>
                      <FormControl>
                        <div className="pt-2">
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            value={[field.value ?? 0]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="w-full"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Keywords */}
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="politics, economy, world news"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) => handleKeywordsChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Banner Image Card */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Banner Image
              </h3>
              {form.watch("banner") && (
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      asChild
                    >
                      <div>
                        <Upload className="h-4 w-4" />
                        <span>Change Image</span>
                      </div>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      form.setValue("banner", "");
                      setBannerBase64("");
                      setBannerFileName("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Upload Area */}
                      <div
                        className={cn(
                          "relative border-2 border-dashed rounded-lg transition-colors",
                          field.value
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-accent/50",
                        )}
                      >
                        {field.value ? (
                          // Preview State
                          <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg">
                            <Image
                              src={field.value}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        ) : (
                          // Empty State
                          <label className="cursor-pointer block">
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                              <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="h-8 w-8 text-primary" />
                              </div>
                              <h4 className="text-base font-medium text-foreground mb-1">
                                {uploading
                                  ? "Processing image..."
                                  : "Upload Banner Image"}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Click to browse or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG or WEBP (max 5MB)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                      {uploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span>Processing image...</span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Source & Publishing Details Card */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Source & Publishing Details
            </h3>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="source_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter source name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="source_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="published_at"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Published Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full md:w-auto pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : "",
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Article"
                  : "Update Article"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
