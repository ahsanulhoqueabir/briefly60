import { withAdmin } from "@/middleware/verify-auth";
import { AdminArticleService } from "@/services/admin-article.service";
import { JwtPayload } from "@/types/jwt.types";
import { NextRequest, NextResponse } from "next/server";
import { uploadDocumentFromBase64 } from "@/services/cloudinary.services";

/**
 * GET /api/dashboard/articles/[id] - Get single article by ID
 * Requires: admin or superadmin role
 */
export const GET = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const article = await AdminArticleService.getArticleById(id);

      return NextResponse.json({
        success: true,
        data: article,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch article",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/dashboard/articles/[id] - Update article
 * Requires: admin or superadmin role
 */
export const PATCH = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const body = await request.json();

      // Handle base64 image upload if provided
      if (body.bannerBase64) {
        try {
          const imageUrl = await uploadDocumentFromBase64(
            body.bannerBase64,
            "articles",
            body.bannerFileName || `article_${Date.now()}`
          );
          body.banner = imageUrl;
        } catch (error) {
          console.error("Image upload error:", error);
          return NextResponse.json(
            {
              success: false,
              message: "Failed to upload image",
            },
            { status: 500 }
          );
        }
        // Remove base64 data before saving to DB
        delete body.bannerBase64;
        delete body.bannerFileName;
      }

      const article = await AdminArticleService.updateArticle(id, body);

      return NextResponse.json({
        success: true,
        data: article,
        message: "Article updated successfully",
      });
    } catch (error) {
      console.error("Error updating article:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update article",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/dashboard/articles/[id] - Delete article
 * Requires: admin or superadmin role
 */
export const DELETE = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      await AdminArticleService.deleteArticle(id);

      return NextResponse.json({
        success: true,
        message: "Article deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete article",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
