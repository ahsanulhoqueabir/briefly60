import directusApi from "@/lib/directus";
import { JwtPayload } from "@/types/jwt.types";
import { CreateQuizPayload } from "@/types/quiz.types";

export class QuizService {
  static async createQuiz(data: CreateQuizPayload, user?: JwtPayload) {
    try {
      const is_already_attempted = await directusApi.get(
        `/items/quiz_participation?filter[user][_eq]=${
          user?.id
        }&filter[news][_eq]=${data.news.trim()}&limit=1`
      );

      if (is_already_attempted.data.data.length > 0) {
        const { id, attempted } = is_already_attempted.data.data[0];
        const updated_attempted = [
          ...(attempted || []),
          ...(data.attempted || []),
        ];
        await directusApi.patch(`/items/quiz_participation/${id}`, {
          attempted: updated_attempted,
        });
        return {
          success: true,
          message: "Quiz attempt updated successfully.",
        };
      }
      await directusApi.post("/items/quiz_participation", {
        ...data,
        user: user?.id,
      });
      return {
        success: true,
        message: "Quiz created successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create quiz.",
        error: error,
      };
    }
  }
}
