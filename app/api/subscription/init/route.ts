import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { sslcommerzService } from "@/services/sslcommerz.services";
import { subscriptionService } from "@/services/subscription.services";
import { SubscriptionPlanService } from "@/services/subscription-plan.service";
import { sslcommerzConfig } from "@/config/env";
import { withUser } from "@/middleware/verify-auth";
import User from "@/models/User.model";

export const dynamic = "force-dynamic";

/**
 * POST /api/subscription/init
 * Initialize payment for subscription
 */
export const POST = withUser(async (req: NextRequest, auth_user) => {
  try {
    await dbConnect();

    const user_id = auth_user.id;

    // Get user details
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Check if user already has active subscription
    const existingSubscription =
      await subscriptionService.getActiveSubscription(user_id);
    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: "আপনার ইতিমধ্যে একটি সক্রিয় সাবস্ক্রিপশন রয়েছে",
        },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await req.json();
    const { plan_id, auto_renew = false } = body;

    if (!plan_id) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    // Get plan details from database
    const plan = await SubscriptionPlanService.getActivePlanByPlanId(plan_id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found or inactive" },
        { status: 404 },
      );
    }

    // Generate transaction ID
    const transaction_id = sslcommerzService.generateTransactionId(user_id);

    // Create pending subscription
    const subscription = await subscriptionService.createPendingSubscription(
      user_id,
      plan_id,
      transaction_id,
      plan.price,
      auto_renew,
    );

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    // Prepare payment data
    const paymentData = sslcommerzService.sanitizePaymentData({
      total_amount: plan.price,
      currency: plan.currency,
      tran_id: transaction_id,
      success_url: sslcommerzConfig.successUrl,
      fail_url: sslcommerzConfig.failUrl,
      cancel_url: sslcommerzConfig.cancelUrl,
      ipn_url: sslcommerzConfig.ipnUrl,
      product_name: `Briefly60 - ${plan.name}`,
      product_category: "subscription",
      product_profile: "general",
      cus_name: user.name,
      cus_email: user.email,
      cus_add1: "Dhaka, Bangladesh",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: user.email, // Using email as placeholder
      shipping_method: "NO",
      num_of_item: 1,
      value_a: user_id, // Store user ID
      value_b: plan_id, // Store plan_id
      value_c: auto_renew.toString(), // Store auto_renew preference
      value_d: Date.now().toString(), // Store timestamp
    });

    // Initialize payment with SSLCommerz
    const paymentResult = await sslcommerzService.initPayment(paymentData);

    if (!paymentResult.success) {
      // Mark subscription as failed
      await subscriptionService.failSubscription(
        transaction_id,
        paymentResult.error,
      );

      return NextResponse.json(
        {
          success: false,
          error: paymentResult.error || "Payment initialization failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      gateway_url: paymentResult.gateway_url,
      transaction_id: transaction_id,
      session_key: paymentResult.session_key,
    });
  } catch (error) {
    console.error("Subscription Init Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize payment",
      },
      { status: 500 },
    );
  }
});
