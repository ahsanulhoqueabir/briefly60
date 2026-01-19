import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { sslcommerzService } from "@/services/sslcommerz.services";
import { subscriptionService } from "@/services/subscription.services";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscription/sslcommerz/ipn
 * Handle IPN (Instant Payment Notification) from SSLCommerz
 * This is a webhook that SSLCommerz calls to notify about payment status
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    const {
      status,
      tran_id,
      val_id,
      amount,
      card_type,
      card_brand,
      card_issuer,
      store_amount,
      bank_tran_id,
      tran_date,
    } = data;

    // Log IPN for debugging
    console.log("IPN Received:", {
      status,
      tran_id,
      val_id,
      amount,
    });

    // Validate payment status
    if (status !== "VALID" && status !== "VALIDATED") {
      console.log("IPN: Invalid payment status", status);
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
        { status: 400 },
      );
    }

    // Check if subscription exists
    const existingSubscription =
      await subscriptionService.getSubscriptionByTransactionId(tran_id);

    if (!existingSubscription) {
      console.log("IPN: Subscription not found for transaction", tran_id);
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 },
      );
    }

    // If already completed, skip
    if (existingSubscription.payment_info.payment_status === "completed") {
      console.log("IPN: Subscription already completed", tran_id);
      return NextResponse.json({
        success: true,
        message: "Already processed",
      });
    }

    // Validate with SSLCommerz
    const validationResult = await sslcommerzService.validatePayment(val_id);

    if (!validationResult.success) {
      console.log("IPN: Validation failed", validationResult.error);
      await subscriptionService.failSubscription(
        tran_id,
        validationResult.error || "Payment validation failed",
      );
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error || "Validation failed",
        },
        { status: 400 },
      );
    }

    // Complete subscription
    const subscription = await subscriptionService.completeSubscription(
      tran_id,
      {
        val_id,
        amount,
        card_type,
        card_brand,
        card_issuer,
        store_amount,
        bank_tran_id,
        payment_date: tran_date,
      },
    );

    if (!subscription) {
      console.log("IPN: Failed to complete subscription", tran_id);
      return NextResponse.json(
        { success: false, message: "Failed to complete subscription" },
        { status: 500 },
      );
    }

    console.log("IPN: Subscription completed successfully", tran_id);

    return NextResponse.json({
      success: true,
      message: "Subscription activated",
    });
  } catch (error) {
    console.error("IPN Handler Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 },
    );
  }
}
