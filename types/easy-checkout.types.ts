// SSLCommerz Easy Checkout Types

export interface EasyCheckoutInstance {
  on: (
    event: "success" | "failure" | "close",
    callback: (data?: unknown) => void,
  ) => void;
  destroy: () => void;
}

export interface EasyCheckoutStatic {
  init: (config: EasyCheckoutConfig) => EasyCheckoutInstance;
}

export interface EasyCheckoutConfig {
  session_key: string;
  embedded: boolean;
  container_id: string;
}

export interface PaymentSuccessData {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  card_type?: string;
  store_amount?: string;
  card_no?: string;
  bank_tran_id?: string;
  card_issuer?: string;
  card_brand?: string;
  card_issuer_country?: string;
  card_issuer_country_code?: string;
  currency_type?: string;
  currency_amount?: string;
  verify_sign?: string;
  verify_key?: string;
  risk_level?: string;
  risk_title?: string;
}

export interface PaymentFailureData {
  status: string;
  error_message?: string;
  tran_id?: string;
}

declare global {
  interface Window {
    EasyCheckout?: EasyCheckoutStatic;
  }
}

export {};
