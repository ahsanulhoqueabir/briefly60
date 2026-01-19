import crypto from "crypto";
import axios from "axios";
import {
  SSLCommerzPaymentData,
  SSLCommerzValidationResponse,
} from "@/types/subscription.types";
import { sslcommerzConfig } from "@/config/env";

const SSLCOMMERZ_SANDBOX_URL = "https://sandbox.sslcommerz.com";
const SSLCOMMERZ_LIVE_URL = "https://securepay.sslcommerz.com";

export class SSLCommerzService {
  private readonly baseUrl: string;
  private readonly storeId: string;
  private readonly storePassword: string;

  constructor() {
    this.baseUrl = sslcommerzConfig.isLive
      ? SSLCOMMERZ_LIVE_URL
      : SSLCOMMERZ_SANDBOX_URL;
    this.storeId = sslcommerzConfig.storeId;
    this.storePassword = sslcommerzConfig.storePassword;

    if (!this.storeId || !this.storePassword) {
      throw new Error("SSLCommerz credentials are not configured");
    }
  }

  /**
   * Generate a secure transaction ID
   */
  generateTransactionId(userId: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString("hex");
    return `SUB_${userId}_${timestamp}_${randomString}`.toUpperCase();
  }

  /**
   * Create a secure hash for data validation
   */
  private createSecureHash(data: string): string {
    return crypto
      .createHmac("sha256", this.storePassword)
      .update(data)
      .digest("hex");
  }

  /**
   * Validate the integrity of payment data
   */
  validateDataIntegrity(
    tran_id: string,
    val_id: string,
    amount: string,
    signature: string,
  ): boolean {
    const dataString = `${tran_id}${val_id}${amount}${this.storePassword}`;
    const expectedHash = this.createSecureHash(dataString);
    return expectedHash === signature;
  }

  /**
   * Initialize payment session with SSLCommerz
   */
  async initPayment(paymentData: SSLCommerzPaymentData): Promise<{
    success: boolean;
    gateway_url?: string;
    session_key?: string;
    error?: string;
  }> {
    try {
      // Add store credentials
      const data = {
        ...paymentData,
        store_id: this.storeId,
        store_passwd: this.storePassword,
      };

      // Generate timestamp for value_d if not provided
      if (!data.value_d) {
        data.value_d = Date.now().toString();
      }

      const response = await axios.post(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        new URLSearchParams(data as any),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000, // 30 second timeout
        },
      );

      if (response.data.status === "SUCCESS") {
        return {
          success: true,
          gateway_url: response.data.GatewayPageURL,
          session_key: response.data.sessionkey,
        };
      } else {
        return {
          success: false,
          error: response.data.failedreason || "Payment initialization failed",
        };
      }
    } catch (error) {
      console.error("SSLCommerz Init Error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to payment gateway",
      };
    }
  }

  /**
   * Validate payment with SSLCommerz
   */
  async validatePayment(val_id: string): Promise<{
    success: boolean;
    data?: SSLCommerzValidationResponse;
    error?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/validator/api/validationserverAPI.php`,
        {
          params: {
            val_id: val_id,
            store_id: this.storeId,
            store_passwd: this.storePassword,
            format: "json",
          },
          timeout: 30000,
        },
      );

      if (
        response.data.status === "VALID" ||
        response.data.status === "VALIDATED"
      ) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.data.error || "Payment validation failed",
        };
      }
    } catch (error) {
      console.error("SSLCommerz Validation Error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to validate payment",
      };
    }
  }

  /**
   * Verify transaction status by transaction ID
   */
  async verifyTransaction(tran_id: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`,
        {
          params: {
            tran_id: tran_id,
            store_id: this.storeId,
            store_passwd: this.storePassword,
            format: "json",
          },
          timeout: 30000,
        },
      );

      if (response.data.status === "VALID") {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: "Transaction verification failed",
        };
      }
    } catch (error) {
      console.error("SSLCommerz Transaction Verification Error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify transaction",
      };
    }
  }

  /**
   * Initiate refund for a transaction
   */
  async initiateRefund(
    bank_tran_id: string,
    refund_amount: number,
    refund_remarks: string,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`,
        new URLSearchParams({
          bank_tran_id: bank_tran_id,
          refund_amount: refund_amount.toString(),
          refund_remarks: refund_remarks,
          store_id: this.storeId,
          store_passwd: this.storePassword,
          format: "json",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000,
        },
      );

      if (response.data.status === "SUCCESS") {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.data.errorReason || "Refund initiation failed",
        };
      }
    } catch (error) {
      console.error("SSLCommerz Refund Error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process refund",
      };
    }
  }

  /**
   * Sanitize and validate payment data before sending to SSLCommerz
   */
  sanitizePaymentData(
    data: Partial<SSLCommerzPaymentData>,
  ): SSLCommerzPaymentData {
    // Remove any HTML tags and special characters
    const sanitize = (str: string): string => {
      return str
        .replace(/<[^>]*>/g, "")
        .replace(/[^\w\s@.-]/gi, "")
        .trim();
    };

    return {
      total_amount: Number(data.total_amount) || 0,
      currency: data.currency || "BDT",
      tran_id: data.tran_id || "",
      success_url: data.success_url || "",
      fail_url: data.fail_url || "",
      cancel_url: data.cancel_url || "",
      ipn_url: data.ipn_url || "",
      product_name: sanitize(data.product_name || ""),
      product_category: sanitize(data.product_category || ""),
      product_profile: data.product_profile || "general",
      cus_name: sanitize(data.cus_name || ""),
      cus_email: sanitize(data.cus_email || ""),
      cus_add1: sanitize(data.cus_add1 || "N/A"),
      cus_city: sanitize(data.cus_city || "Dhaka"),
      cus_postcode: sanitize(data.cus_postcode || "1000"),
      cus_country: data.cus_country || "Bangladesh",
      cus_phone: sanitize(data.cus_phone || ""),
      shipping_method: data.shipping_method || "NO",
      num_of_item: Number(data.num_of_item) || 1,
      value_a: data.value_a,
      value_b: data.value_b,
      value_c: data.value_c,
      value_d: data.value_d,
    };
  }
}

// Export singleton instance
export const sslcommerzService = new SSLCommerzService();
