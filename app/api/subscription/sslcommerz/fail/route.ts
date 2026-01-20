import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { subscriptionService } from "@/services/subscription.services";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscription/sslcommerz/fail
 * Handle failed payment from SSLCommerz
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    const { tran_id, error } = data;

    // Mark subscription as failed
    if (tran_id) {
      await subscriptionService.failSubscription(
        tran_id,
        error || "Payment failed",
      );
    }

    const failUrl = new URL("/subscription", process.env.NEXT_PUBLIC_BASE_URL);
    failUrl.searchParams.set("status", "failed");
    failUrl.searchParams.set("message", error || "পেমেন্ট ব্যর্থ হয়েছে");
    return NextResponse.redirect(failUrl.toString(), 303);
  } catch (error) {
    console.error("Payment Fail Handler Error:", error);
    const failUrl = new URL("/subscription", process.env.NEXT_PUBLIC_BASE_URL);
    failUrl.searchParams.set("status", "failed");
    failUrl.searchParams.set("message", "An error occurred");
    return NextResponse.redirect(failUrl.toString(), 303);
  }
}

/**
 * GET /api/subscription/sslcommerz/fail
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tran_id = searchParams.get("tran_id");
  const error = searchParams.get("error");

  if (tran_id) {
    await dbConnect();
    await subscriptionService.failSubscription(
      tran_id,
      error || "Payment failed",
    );
  }

  const failUrl = new URL("/subscription", process.env.NEXT_PUBLIC_BASE_URL);
  failUrl.searchParams.set("status", "failed");
  failUrl.searchParams.set("message", error || "পেমেন্ট ব্যর্থ হয়েছে");
  return NextResponse.redirect(failUrl.toString(), 303);
}
