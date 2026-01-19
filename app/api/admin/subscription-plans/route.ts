import { NextRequest, NextResponse } from "next/server";
import { AdminSubscriptionPlanService } from "@/services/subscription-plan.service";
import { authMiddleware } from "@/middleware/verify-auth";
import { checkPermission } from "@/middleware/role-permission";

// GET /api/admin/subscription-plans - Get all plans
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    // Check admin permission
    const permissionCheck = await checkPermission(
      request,
      "manage_subscriptions",
    );
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const result =
      await AdminSubscriptionPlanService.getAllPlans(includeInactive);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 },
    );
  }
}

// POST /api/admin/subscription-plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    // Check admin permission (only admin can create plans)
    const permissionCheck = await checkPermission(
      request,
      "manage_subscriptions",
    );
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "plan_id",
      "name",
      "name_en",
      "duration_months",
      "price",
      "features",
      "features_en",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const plan = await AdminSubscriptionPlanService.createPlan(body);

    return NextResponse.json(
      { message: "Plan created successfully", plan },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error creating subscription plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create plan";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
