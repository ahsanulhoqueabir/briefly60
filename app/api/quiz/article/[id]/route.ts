import { withAuth } from "@/middleware/verify-auth";
import { QuizService } from "@/services/quiz.services";
import { JwtPayload } from "@/types/jwt.types";
import { NextResponse } from "next/server";

/**
 * GET /api/quiz/article/[id]
 * Get user's quiz attempts for a specific article
 */
export const GET = withAuth(
  async (
    req: Request,
    user: JwtPayload | undefined,
    { params }: { params: { id: string } },
  ) => {
    try {
      if (!user?.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 },
        );
      }

      const articleId = params.id;

      const result = await QuizService.getArticleAttempts(user.id, articleId);

      if (result.success) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    } catch (error) {
      console.error("Get article attempts error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while fetching article attempts.",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);
