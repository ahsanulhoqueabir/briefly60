import { withAuth } from "@/middleware/verify-auth";
import { QuizService } from "@/services/quiz.services";
import { JwtPayload } from "@/types/jwt.types";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req: Request, user?: JwtPayload) => {
  try {
    const body = await req.json();
    const result = await QuizService.createQuiz(body, user);
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing the request.",
        error: error,
      },
      { status: 500 }
    );
  }
});
