import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { subscriptionService } from "@/services/subscription.services";
import { withUser } from "@/middleware/verify-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscription/history
 * Get user's subscription history
 */
export const GET = withUser(async (req: NextRequest, user) => {
  try {
    await dbConnect();

    const user_id = user.id;

    // Get subscription history
    const subscriptions =
      await subscriptionService.getUserSubscriptions(user_id);

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map((sub) => ({
        id: sub._id.toString(),
        plan: sub.plan_snapshot.plan_id,
        plan_name: sub.plan_snapshot.name,
        duration_months: sub.plan_snapshot.duration_months,
        start_date: sub.start_date,
        end_date: sub.end_date,
        amount: sub.payment_info.amount_paid,
        payment_status: sub.payment_info.payment_status,
        is_active: sub.is_active,
        createdAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error("Subscription History Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription history",
      },
      { status: 500 },
    );
  }
});
