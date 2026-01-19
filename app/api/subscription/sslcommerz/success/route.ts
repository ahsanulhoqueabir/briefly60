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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=Payment validation failed`,
      );
    }

    // Validate payment with SSLCommerz
    const validationResult = await sslcommerzService.validatePayment(val_id);

    if (!validationResult.success) {
      await subscriptionService.failSubscription(
        tran_id,
        validationResult.error || "Payment validation failed",
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=${encodeURIComponent(validationResult.error || "Payment validation failed")}`,
      );
    }

    // Verify transaction ID matches
    if (validationResult.data?.tran_id !== tran_id) {
      await subscriptionService.failSubscription(
        tran_id,
        "Transaction ID mismatch",
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=Transaction verification failed`,
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=Failed to activate subscription`,
      );
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=success&plan=${value_b}`,
    );
  } catch (error) {
    console.error("Payment Success Handler Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=An error occurred`,
    );
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
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=Missing payment information`,
    );
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=${encodeURIComponent(validationResult.error || "Payment validation failed")}`,
      );
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=Failed to activate subscription`,
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=success&plan=${paymentData.value_b}`,
    );
  } catch (error) {
    console.error("Payment Success Handler Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?status=failed&message=An error occurred`,
    );
  }
}
