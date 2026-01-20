import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { sslcommerzService } from "@/services/sslcommerz.services";
import { subscriptionService } from "@/services/subscription.services";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscription/sslcommerz/success
 * Handle successful payment from SSLCommerz
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
      value_b, // plan
    } = data;

    // Check if payment is successful
    if (status !== "VALID" && status !== "VALIDATED") {
      await subscriptionService.failSubscription(
        tran_id,
        "Payment status is not valid",
      );
      const failUrl = new URL(
        "/subscription",
        process.env.NEXT_PUBLIC_BASE_URL,
      );
      failUrl.searchParams.set("status", "failed");
      failUrl.searchParams.set("message", "Payment validation failed");
      return NextResponse.redirect(failUrl.toString(), 303);
    }

    // Validate payment with SSLCommerz
    const validationResult = await sslcommerzService.validatePayment(val_id);

    if (!validationResult.success) {
      await subscriptionService.failSubscription(
        tran_id,
        validationResult.error || "Payment validation failed",
      );
      const failUrl = new URL(
        "/subscription",
        process.env.NEXT_PUBLIC_BASE_URL,
      );
      failUrl.searchParams.set("status", "failed");
      failUrl.searchParams.set(
        "message",
        validationResult.error || "Payment validation failed",
      );
      return NextResponse.redirect(failUrl.toString(), 303);
    }

    // Verify transaction ID matches
    if (validationResult.data?.tran_id !== tran_id) {
      await subscriptionService.failSubscription(
        tran_id,
        "Transaction ID mismatch",
      );
      const failUrl = new URL(
        "/subscription",
        process.env.NEXT_PUBLIC_BASE_URL,
      );
      failUrl.searchParams.set("status", "failed");
      failUrl.searchParams.set("message", "Transaction verification failed");
      return NextResponse.redirect(failUrl.toString(), 303);
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
      const failUrl = new URL(
        "/subscription",
        process.env.NEXT_PUBLIC_BASE_URL,
      );
      failUrl.searchParams.set("status", "failed");
      failUrl.searchParams.set("message", "Failed to activate subscription");
      return NextResponse.redirect(failUrl.toString(), 303);
    }

    // Redirect to success page
    const redirectUrl = new URL(
      "/subscription",
      process.env.NEXT_PUBLIC_BASE_URL,
    );
    redirectUrl.searchParams.set("status", "success");
    redirectUrl.searchParams.set("plan", value_b || "");

    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch (error) {
    console.error("Payment Success Handler Error:", error);
    const errorUrl = new URL("/subscription", process.env.NEXT_PUBLIC_BASE_URL);
    errorUrl.searchParams.set("status", "failed");
    errorUrl.searchParams.set("message", "An error occurred");
    return NextResponse.redirect(errorUrl.toString(), 303);
  }
}

/**
 * GET /api/subscription/sslcommerz/success
 * Handle success redirect from SSLCommerz (GET method)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tran_id = searchParams.get("tran_id");
  const val_id = searchParams.get("val_id");

  if (!val_id || !tran_id) {
    const failUrl = new URL("/subscription", process.env.NEXT_PUBLIC_BASE_URL);
    failUrl.searchParams.set("status", "failed");
    failUrl.searchParams.set("message", "Missing payment information");
    return NextResponse.redirect(failUrl.toString(), 303);
  }

  try {
    await dbConnect();

    // Validate payment
    const validationResult = await sslcommerzService.validatePayment(val_id);

    if (!validationResult.success || !validationResult.data) {
      await subscriptionService.failSubscription(
        tran_id,
        validationResult.error || "Payment validation failed",
      );
      const failUrl = new URL(
        "/subscription",
        process.env.NEXT_PUBLIC_BASE_URL,
      );
      failUrl.searchParams.set("status", "failed");
      failUrl.searchParams.set(
        "message",
        validationResult.error || "Payment validation failed",
      );
      return NextResponse.redirect(failUrl.toString(), 303);
    }

    const paymentData = validationResult.data;

    // Complete subscription
    const subscription = await subscriptionService.completeSubscription(
      tran_id,
      {
        val_id: paymentData.val_id,
        amount: paymentData.amount,
        card_type: paymentData.card_type,
        card_brand: paymentData.card_brand,
        card_issuer: paymentData.card_issuer,
        store_amount: paymentData.store_amount,
        bank_tran_id: paymentData.bank_tran_id,
        payment_date: paymentData.tran_date,
      },
    );

    if (!subscription) {
      const failUrl = new URL(
        "/subscription",
        process.env.NEXT_PUBLIC_BASE_URL,
      );
      failUrl.searchParams.set("status", "failed");
      failUrl.searchParams.set("message", "Failed to activate subscription");
      return NextResponse.redirect(failUrl.toString(), 303);
    }

    const successUrl = new URL(
      "/subscription",
      process.env.NEXT_PUBLIC_BASE_URL,
    );
    successUrl.searchParams.set("status", "success");
    successUrl.searchParams.set("plan", paymentData.value_b || "");

    return NextResponse.redirect(
      successUrl.toString(),
      303, // 303 See Other - forces GET request
    );
  } catch (error) {
    console.error("Payment Success Handler Error:", error);
    const errorUrl = new URL("/subscription", process.env.NEXT_PUBLIC_BASE_URL);
    errorUrl.searchParams.set("status", "failed");
    errorUrl.searchParams.set("message", "An error occurred");
    return NextResponse.redirect(errorUrl.toString(), 303);
  }
}
