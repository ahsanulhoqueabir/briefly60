import { withAuth } from "@/middleware/verify-auth";
import { QuizService } from "@/services/quiz.services";
import { JwtPayload } from "@/types/jwt.types";
import { NextResponse } from "next/server";

/**
 * POST /api/quiz
 * Submit a quiz attempt for an article
 */
export const POST = withAuth(async (req: Request, user?: JwtPayload) => {
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

    const body = await req.json();
    const { article_id, answers, time_taken } = body;

    if (!article_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        {
          success: false,
          message: "article_id and answers array are required",
        },
        { status: 400 },
      );
    }

    const result = await QuizService.submitQuizAttempt(user.id, {
      article_id,
      answers,
      time_taken,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing the request.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

/**
 * GET /api/quiz
 * Get user's quiz history
 */
export const GET = withAuth(async (req: Request, user?: JwtPayload) => {
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const result = await QuizService.getUserQuizHistory(user.id, limit, skip);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Get quiz history error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching quiz history.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
