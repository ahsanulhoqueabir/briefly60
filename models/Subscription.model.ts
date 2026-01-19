import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";
export type PaymentGateway = "sslcommerz" | "manual" | "free";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  plan_id: Types.ObjectId; // Reference to SubscriptionPlan
  plan_snapshot: {
    // Store plan details at time of purchase
    plan_id: string; // monthly, half_yearly, yearly
    name: string;
    duration_months: number;
    price: number;
    original_price?: number;
    currency: string;
    features: string[];
  };
  start_date: Date;
  end_date: Date;
  description?: string;
  payment_info: {
    gateway: PaymentGateway;
    transaction_id: string;
    amount_paid: number; // Actual amount paid
    currency: string;
    payment_method?: string;
    payment_status: PaymentStatus;
    // SSLCommerz specific fields
    tran_id?: string;
    val_id?: string;
    card_type?: string;
    card_brand?: string;
    card_issuer?: string;
    store_amount?: number;
    bank_tran_id?: string;
    payment_date?: Date;
    error_message?: string;
  };
  is_active: boolean;
  auto_renew: boolean;
  cancelled_at?: Date;
  cancellation_reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: [true, "Plan ID is required"],
      index: true,
    },
    plan_snapshot: {
      plan_id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      duration_months: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      original_price: {
        type: Number,
      },
      currency: {
        type: String,
        required: true,
      },
      features: [String],
    },
    start_date: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
    },
    description: {
      type: String,
      default: null,
    },
    payment_info: {
      gateway: {
        type: String,
        enum: ["sslcommerz", "manual", "free"],
        required: [true, "Payment gateway is required"],
        default: "free",
      },
      transaction_id: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
        index: true,
      },
      amount_paid: {
        type: Number,
        required: [true, "Amount paid is required"],
        default: 0,
      },
      currency: {
        type: String,
        default: "BDT",
      },
      payment_method: {
        type: String,
        default: null,
      },
      payment_status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "refunded",
          "cancelled",
        ],
        default: "pending",
        index: true,
      },
      // SSLCommerz specific
      tran_id: String,
      val_id: String,
      card_type: String,
      card_brand: String,
      card_issuer: String,
      store_amount: Number,
      bank_tran_id: String,
      payment_date: Date,
      error_message: String,
    },
    is_active: {
      type: Boolean,
      default: false,
      index: true,
    },
    auto_renew: {
      type: Boolean,
      default: false,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    cancellation_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
SubscriptionSchema.index({ user_id: 1, is_active: 1 });
SubscriptionSchema.index({ plan_id: 1 });
SubscriptionSchema.index({ end_date: 1, is_active: 1 });
SubscriptionSchema.index({ "payment_info.tran_id": 1 });
SubscriptionSchema.index({ "payment_info.val_id": 1 });
SubscriptionSchema.index({ createdAt: -1 });

// Method to check if subscription is expired
SubscriptionSchema.methods.isExpired = function (): boolean {
  return this.end_date < new Date();
};

// Method to check if subscription is valid
SubscriptionSchema.methods.isValid = function (): boolean {
  return (
    this.is_active &&
    !this.isExpired() &&
    this.payment_info.payment_status === "completed"
  );
};

// Static method to get active subscription for user
SubscriptionSchema.statics.getActiveSubscription = async function (
  user_id: Types.ObjectId,
): Promise<ISubscription | null> {
  return this.findOne({
    user_id,
    is_active: true,
    end_date: { $gte: new Date() },
    "payment_info.payment_status": "completed",
  }).sort({ end_date: -1 });
};

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;
