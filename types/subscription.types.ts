import { PlanType, PaymentStatus } from "@/models/Subscription.model";

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  name_en?: string;
  duration_months: number;
  price: number;
  original_price?: number;
  currency: string;
  features: string[];
  features_en?: string[];
  popular?: boolean;
  savings?: string;
  savings_en?: string;
}

export interface InitPaymentRequest {
  plan: Exclude<PlanType, "free">;
  user_id: string;
}

export interface InitPaymentResponse {
  success: boolean;
  gateway_url?: string;
  transaction_id?: string;
  session_key?: string;
  error?: string;
}

export interface PaymentValidationResponse {
  success: boolean;
  subscription?: {
    id: string;
    plan: PlanType;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
  };
  error?: string;
}

export interface UserSubscriptionStatus {
  has_active_subscription: boolean;
  subscription?: {
    id: string;
    plan: PlanType;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    days_remaining: number;
    payment_status: PaymentStatus;
  };
}

export interface SSLCommerzPaymentData {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  shipping_method: string;
  num_of_item: number;
  value_a?: string; // user_id
  value_b?: string; // plan
  value_c?: string; // duration_months
  value_d?: string; // timestamp
}

export interface SSLCommerzValidationResponse {
  status: string;
  tran_date: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  currency_amount: string;
  verify_sign: string;
  verify_key: string;
  risk_level: string;
  risk_title: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
}
