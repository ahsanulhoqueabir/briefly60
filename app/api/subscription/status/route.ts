import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription.services";
import { withUser } from "@/middleware/verify-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */
export const GET = withUser(async (req: NextRequest, user) => {
  try {
    const user_id = user.id;

    // Get subscription status
    const status = await subscriptionService.getUserSubscriptionStatus(user_id);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Subscription Status Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription status",
      },
      { status: 500 },
    );
  }
});
