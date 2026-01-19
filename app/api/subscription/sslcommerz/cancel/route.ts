import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { subscriptionService } from "@/services/subscription.services";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscription/sslcommerz/cancel
 * Handle cancelled payment from SSLCommerz
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    const { tran_id } = data;

    // Mark subscription as cancelled
    if (tran_id) {
      await subscriptionService.failSubscription(
        tran_id,
        "Payment cancelled by user",
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=cancelled&message=পেমেন্ট বাতিল করা হয়েছে`,
    );
  } catch (error) {
    console.error("Payment Cancel Handler Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=cancelled&message=Payment was cancelled`,
    );
  }
}

/**
 * GET /api/subscription/sslcommerz/cancel
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tran_id = searchParams.get("tran_id");

  if (tran_id) {
    await dbConnect();
    await subscriptionService.failSubscription(
      tran_id,
      "Payment cancelled by user",
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=cancelled&message=পেমেন্ট বাতিল করা হয়েছে`,
  );
}
