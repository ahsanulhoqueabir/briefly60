import { NextResponse } from "next/server";
import { SubscriptionPlanService } from "@/services/subscription-plan.service";

// GET /api/subscription/plans - Get all active subscription plans
export async function GET() {
  try {
    const plans = await SubscriptionPlanService.getActivePlans();

    return NextResponse.json(
      {
        success: true,
        plans,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subscription plans",
      },
      { status: 500 },
    );
  }
}
