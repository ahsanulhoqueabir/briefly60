import dbConnect from "@/lib/mongodb";
import SubscriptionPlan from "@/models/SubscriptionPlan.model";
import {
  SubscriptionPlan as SubscriptionPlanType,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  PlanListResponse,
} from "@/types/subscription-plan.types";

export class SubscriptionPlanService {
  /**
   * Get all active subscription plans for public display
   */
  static async getActivePlans(): Promise<SubscriptionPlanType[]> {
    await dbConnect();

    const plans = await SubscriptionPlan.find({ is_active: true })
      .sort({ duration_months: 1 })
      .lean();

    return plans as unknown as SubscriptionPlanType[];
  }

  /**
   * Get a specific active plan by plan_id
   */
  static async getActivePlanByPlanId(
    plan_id: string,
  ): Promise<SubscriptionPlanType | null> {
    await dbConnect();

    const plan = await SubscriptionPlan.findOne({
      plan_id,
      is_active: true,
    }).lean();

    return plan as unknown as SubscriptionPlanType | null;
  }

  /**
   * Get popular plans
   */
  static async getPopularPlans(): Promise<SubscriptionPlanType[]> {
    await dbConnect();

    const plans = await SubscriptionPlan.find({
      is_active: true,
      popular: true,
    })
      .sort({ duration_months: 1 })
      .lean();

    return plans as unknown as SubscriptionPlanType[];
  }
}

export class AdminSubscriptionPlanService {
  /**
   * Get all subscription plans (including inactive ones for admin)
   */
  static async getAllPlans(includeInactive = true): Promise<PlanListResponse> {
    await dbConnect();

    const filter = includeInactive ? {} : { is_active: true };
    const plans = await SubscriptionPlan.find(filter)
      .sort({ duration_months: 1 })
      .lean();

    return {
      plans: plans as unknown as SubscriptionPlanType[],
      total: plans.length,
    };
  }

  /**
   * Get a single plan by ID
   */
  static async getPlanById(
    planId: string,
  ): Promise<SubscriptionPlanType | null> {
    await dbConnect();
    const plan = await SubscriptionPlan.findById(planId).lean();
    return plan as unknown as SubscriptionPlanType | null;
  }

  /**
   * Get a plan by plan_id (monthly, half_yearly, yearly)
   */
  static async getPlanByPlanId(
    plan_id: string,
  ): Promise<SubscriptionPlanType | null> {
    await dbConnect();
    const plan = await SubscriptionPlan.findOne({
      plan_id,
      is_active: true,
    }).lean();
    return plan as unknown as SubscriptionPlanType | null;
  }

  /**
   * Create a new subscription plan
   */
  static async createPlan(
    data: CreateSubscriptionPlanInput,
  ): Promise<SubscriptionPlanType> {
    await dbConnect();

    // Check if plan_id already exists
    const existingPlan = await SubscriptionPlan.findOne({
      plan_id: data.plan_id,
    });
    if (existingPlan) {
      throw new Error("Plan with this plan_id already exists");
    }

    const plan = await SubscriptionPlan.create({
      ...data,
      currency: data.currency || "BDT",
      popular: data.popular || false,
      is_active: true,
      version: 1,
    });

    return plan.toObject() as unknown as SubscriptionPlanType;
  }

  /**
   * Update a subscription plan
   * When price is changed, version is incremented
   */
  static async updatePlan(
    planId: string,
    data: UpdateSubscriptionPlanInput,
  ): Promise<SubscriptionPlanType> {
    await dbConnect();

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    // If price is being changed, increment version
    let versionUpdate = {};
    if (data.price !== undefined && data.price !== plan.price) {
      versionUpdate = { $inc: { version: 1 } };
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      planId,
      { ...data, ...versionUpdate },
      { new: true, runValidators: true },
    );

    if (!updatedPlan) {
      throw new Error("Failed to update plan");
    }

    return updatedPlan.toObject() as unknown as SubscriptionPlanType;
  }

  /**
   * Soft delete a plan (set is_active to false)
   * This preserves historical data for existing subscriptions
   */
  static async archivePlan(planId: string): Promise<void> {
    await dbConnect();

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      planId,
      { is_active: false },
      { new: true },
    );

    if (!plan) {
      throw new Error("Plan not found");
    }
  }

  /**
   * Reactivate an archived plan
   */
  static async reactivatePlan(planId: string): Promise<SubscriptionPlanType> {
    await dbConnect();

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      planId,
      { is_active: true },
      { new: true, runValidators: true },
    );

    if (!plan) {
      throw new Error("Plan not found");
    }

    return plan.toObject() as unknown as SubscriptionPlanType;
  }

  /**
   * Toggle popular flag for a plan
   */
  static async togglePopular(planId: string): Promise<SubscriptionPlanType> {
    await dbConnect();

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    plan.popular = !plan.popular;
    await plan.save();

    return plan.toObject() as unknown as SubscriptionPlanType;
  }

  /**
   * Delete a plan permanently (use with caution)
   * Should only be used if no subscriptions reference it
   */
  static async deletePlan(planId: string): Promise<void> {
    await dbConnect();

    // TODO: Check if any subscriptions reference this plan
    // If yes, prevent deletion or require force flag

    const result = await SubscriptionPlan.findByIdAndDelete(planId);
    if (!result) {
      throw new Error("Plan not found");
    }
  }
}
