import { withAdmin } from "@/middleware/verify-auth";
import { AdminArticleService } from "@/services/admin-article.service";
import { AdminArticleFilters } from "@/types/admin.types";
import { NextRequest, NextResponse } from "next/server";
import { uploadDocumentFromBase64 } from "@/services/cloudinary.services";

/**
 * GET /api/dashboard/articles - Get all articles with filters and pagination
 * Searches database directly with provided filters
 * Requires: admin or superadmin role
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Parse filters - these will be used to query MongoDB
    const filters: AdminArticleFilters = {};

    if (searchParams.get("status")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters.status = searchParams.get("status") as any;
    }
    if (searchParams.get("category")) {
      filters.category = searchParams.get("category") as string;
    }
    if (searchParams.get("source_name")) {
      filters.source_name = searchParams.get("source_name") as string;
    }
    // Search query - searches in title, content, and corrected_title fields
    if (searchParams.get("search")) {
      filters.search = searchParams.get("search") as string;
    }
    if (searchParams.get("date_from")) {
      filters.date_from = searchParams.get("date_from") as string;
    }
    if (searchParams.get("date_to")) {
      filters.date_to = searchParams.get("date_to") as string;
    }
    if (searchParams.get("importance_min")) {
      filters.importance_min = parseInt(searchParams.get("importance_min")!);
    }
    if (searchParams.get("importance_max")) {
      filters.importance_max = parseInt(searchParams.get("importance_max")!);
    }

    // Fetch articles from database with filters
    const response = await AdminArticleService.getArticles(
      filters,
      page,
      limit,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch articles",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

/**
 * POST /api/dashboard/articles - Create new article
 * Requires: admin or superadmin role
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: title, content, category",
        },
        { status: 400 },
      );
    }

    // Handle base64 image upload if provided
    if (body.bannerBase64) {
      try {
        const imageUrl = await uploadDocumentFromBase64(
          body.bannerBase64,
          "articles",
          body.bannerFileName || `article_${Date.now()}`,
        );
        body.banner = imageUrl;
      } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to upload image",
          },
          { status: 500 },
        );
      }
      // Remove base64 data before saving to DB
      delete body.bannerBase64;
      delete body.bannerFileName;
    }

    const article = await AdminArticleService.createArticle(body);

    return NextResponse.json({
      success: true,
      data: article,
      message: "Article created successfully",
    });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create article",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
