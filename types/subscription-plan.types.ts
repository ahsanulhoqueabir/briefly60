export interface SubscriptionPlan {
  _id: string;
  plan_id: string; // monthly, half_yearly, yearly
  name: string;
  duration_months: number;
  price: number;
  original_price?: number;
  currency: string;
  popular: boolean;
  savings?: string;
  features: string[];
  is_active: boolean;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubscriptionPlanInput {
  plan_id: string;
  name: string;
  duration_months: number;
  price: number;
  original_price?: number;
  currency?: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  duration_months?: number;
  price?: number;
  original_price?: number;
  currency?: string;
  popular?: boolean;
  savings?: string;
  features?: string[];
  is_active?: boolean;
}

export interface PlanListResponse {
  plans: SubscriptionPlan[];
  total: number;
}
