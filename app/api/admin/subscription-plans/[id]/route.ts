import { NextRequest, NextResponse } from "next/server";
import { AdminSubscriptionPlanService } from "@/services/subscription-plan.service";
import { authMiddleware } from "@/middleware/verify-auth";
import { checkPermission } from "@/middleware/role-permission";

// GET /api/admin/subscription-plans/[id] - Get a specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const plan = await AdminSubscriptionPlanService.getPlanById(id);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plan" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/subscription-plans/[id] - Update a plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    // Check admin permission (only admin can update plans)
    const permissionCheck = await checkPermission(
      request,
      "manage_subscriptions",
    );
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const plan = await AdminSubscriptionPlanService.updatePlan(id, body);

    return NextResponse.json(
      { message: "Plan updated successfully", plan },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error updating subscription plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update plan";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/admin/subscription-plans/[id] - Delete/Archive a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    // Check admin permission (only admin can delete plans)
    const permissionCheck = await checkPermission(
      request,
      "manage_subscriptions",
    );
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await AdminSubscriptionPlanService.deletePlan(id);
      return NextResponse.json(
        { message: "Plan deleted permanently" },
        { status: 200 },
      );
    } else {
      await AdminSubscriptionPlanService.archivePlan(id);
      return NextResponse.json(
        { message: "Plan archived successfully" },
        { status: 200 },
      );
    }
  } catch (error: unknown) {
    console.error("Error deleting subscription plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete plan";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
