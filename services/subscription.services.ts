import Subscription, { ISubscription } from "@/models/Subscription.model";
import User from "@/models/User.model";
import { Types } from "mongoose";
import { UserSubscriptionStatus } from "@/types/subscription.types";
import { SubscriptionPlanService } from "./subscription-plan.service";
import { EmailService } from "./email.service";
import dbConnect from "@/lib/mongodb";
import { calculateDaysRemaining, calculateEndDate } from "@/lib/utils";

export class SubscriptionService {
  /**
   * Get active subscription for a user
   */
  async getActiveSubscription(user_id: string): Promise<ISubscription | null> {
    try {
      await dbConnect();
      const userId = new Types.ObjectId(user_id);
      return await Subscription.findOne({
        user_id: userId,
        is_active: true,
        end_date: { $gte: new Date() },
        "payment_info.payment_status": "completed",
      })
        .sort({ end_date: -1 })
        .populate("plan_id");
    } catch (error) {
      console.error("Error fetching active subscription:", error);
      return null;
    }
  }

  /**
   * Get user subscription status with details
   */
  async getUserSubscriptionStatus(
    user_id: string,
  ): Promise<UserSubscriptionStatus> {
    try {
      const subscription = await this.getActiveSubscription(user_id);

      if (!subscription) {
        return { has_active_subscription: false };
      }

      const daysRemaining = calculateDaysRemaining(subscription.end_date);

      return {
        has_active_subscription: true,
        subscription: {
          id: subscription._id.toString(),
          plan: subscription.plan_snapshot.plan_id,
          plan_name: subscription.plan_snapshot.name,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          is_active: subscription.is_active,
          auto_renew: subscription.auto_renew,
          days_remaining: daysRemaining,
          payment_status: subscription.payment_info.payment_status,
          amount: subscription.payment_info.amount_paid,
        },
      };
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      return { has_active_subscription: false };
    }
  }

  /**
   * Create a pending subscription
   */
  async createPendingSubscription(
    user_id: string,
    plan_id: string,
    transaction_id: string,
    amount: number,
    auto_renew = false,
  ): Promise<ISubscription | null> {
    try {
      await dbConnect();
      const userId = new Types.ObjectId(user_id);

      // Fetch plan from database
      const plan = await SubscriptionPlanService.getActivePlanByPlanId(plan_id);

      if (!plan) {
        throw new Error("Invalid plan selected or plan is inactive");
      }

      const start_date = new Date();
      const end_date = calculateEndDate(start_date, plan.duration_months);

      const subscription = await Subscription.create({
        user_id: userId,
        plan_id: plan._id,
        plan_snapshot: {
          plan_id: plan.plan_id,
          name: plan.name,
          duration_months: plan.duration_months,
          price: plan.price,
          original_price: plan.original_price,
          currency: plan.currency,
          features: plan.features,
        },
        start_date,
        end_date,
        description: `${plan.name} - ${plan.duration_months} months`,
        payment_info: {
          gateway: "sslcommerz",
          transaction_id,
          amount_paid: amount,
          currency: plan.currency,
          payment_status: "pending",
          tran_id: transaction_id,
        },
        is_active: false,
        auto_renew,
      });

      return subscription;
    } catch (error) {
      console.error("Error creating pending subscription:", error);
      return null;
    }
  }

  /**
   * Update subscription after successful payment
   */
  async completeSubscription(
    transaction_id: string,
    payment_data: {
      val_id: string;
      amount: string;
      card_type?: string;
      card_brand?: string;
      card_issuer?: string;
      store_amount?: string;
      bank_tran_id?: string;
      payment_date?: string;
    },
  ): Promise<ISubscription | null> {
    try {
      const subscription = await Subscription.findOne({
        "payment_info.transaction_id": transaction_id,
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      // Deactivate any existing active subscriptions for this user
      await Subscription.updateMany(
        {
          user_id: subscription.user_id,
          is_active: true,
          _id: { $ne: subscription._id },
        },
        {
          $set: {
            is_active: false,
            cancelled_at: new Date(),
            cancellation_reason: "New subscription activated",
          },
        },
      );

      // Update the subscription
      subscription.payment_info.payment_status = "completed";
      subscription.payment_info.val_id = payment_data.val_id;
      subscription.payment_info.card_type = payment_data.card_type;
      subscription.payment_info.card_brand = payment_data.card_brand;
      subscription.payment_info.card_issuer = payment_data.card_issuer;
      subscription.payment_info.store_amount = payment_data.store_amount
        ? parseFloat(payment_data.store_amount)
        : undefined;
      subscription.payment_info.bank_tran_id = payment_data.bank_tran_id;
      subscription.payment_info.payment_date = payment_data.payment_date
        ? new Date(payment_data.payment_date)
        : new Date();
      subscription.is_active = true;

      await subscription.save();

      // Send subscription confirmation email (non-blocking)
      try {
        const user = await User.findById(subscription.user_id);
        if (user) {
          EmailService.sendSubscriptionConfirmationEmail(
            user.email,
            user.name,
            subscription.plan_snapshot.name,
            subscription.plan_snapshot
              .plan_id as import("@/types/subscription.types").SubscriptionPlanId,
            subscription.payment_info.amount_paid,
            subscription.start_date,
            subscription.end_date,
            transaction_id,
          ).catch((error) => {
            console.error(
              "Failed to send subscription confirmation email:",
              error,
            );
            // Don't fail subscription if email fails
          });
        }
      } catch (emailError) {
        console.error("Error preparing subscription email:", emailError);
        // Don't fail subscription if email fails
      }

      return subscription;
    } catch (error) {
      console.error("Error completing subscription:", error);
      return null;
    }
  }

  /**
   * Mark subscription as failed
   */
  async failSubscription(
    transaction_id: string,
    error_message?: string,
  ): Promise<void> {
    try {
      await Subscription.findOneAndUpdate(
        { "payment_info.transaction_id": transaction_id },
        {
          $set: {
            "payment_info.payment_status": "failed",
            "payment_info.error_message": error_message || "Payment failed",
            is_active: false,
          },
        },
      );
    } catch (error) {
      console.error("Error marking subscription as failed:", error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscription_id: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const subscription = await Subscription.findById(subscription_id);

      if (!subscription) {
        return false;
      }

      subscription.is_active = false;
      subscription.cancelled_at = new Date();
      subscription.cancellation_reason =
        reason || "User requested cancellation";
      subscription.payment_info.payment_status = "cancelled";

      await subscription.save();

      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(user_id: string): Promise<ISubscription[]> {
    try {
      const userId = new Types.ObjectId(user_id);
      return await Subscription.find({ user_id: userId }).sort({
        createdAt: -1,
      });
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      return [];
    }
  }

  /**
   * Get subscription by transaction ID
   */
  async getSubscriptionByTransactionId(
    transaction_id: string,
  ): Promise<ISubscription | null> {
    try {
      return await Subscription.findOne({
        "payment_info.transaction_id": transaction_id,
      });
    } catch (error) {
      console.error("Error fetching subscription by transaction ID:", error);
      return null;
    }
  }

  /**
   * Check if user has premium access
   */
  async hasPremiumAccess(user_id: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(user_id);
    return subscription !== null;
  }

  /**
   * Auto-expire subscriptions (run as cron job)
   */
  async expireSubscriptions(): Promise<number> {
    try {
      const result = await Subscription.updateMany(
        {
          is_active: true,
          end_date: { $lt: new Date() },
        },
        {
          $set: {
            is_active: false,
            cancelled_at: new Date(),
            cancellation_reason: "Subscription expired",
          },
        },
      );

      return result.modifiedCount;
    } catch (error) {
      console.error("Error expiring subscriptions:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
