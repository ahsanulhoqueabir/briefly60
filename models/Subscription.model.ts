import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PlanType = "free" | "premium" | "enterprise";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  plan: PlanType;
  start_date: Date;
  end_date?: Date;
  description?: string;
  payment_info?: {
    transaction_id?: string;
    amount?: number;
    currency?: string;
    payment_method?: string;
    payment_status?: "pending" | "completed" | "failed" | "refunded";
  };
  is_active: boolean;
  auto_renew: boolean;
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
    plan: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      required: [true, "Plan type is required"],
      default: "free",
    },
    start_date: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    end_date: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    payment_info: {
      transaction_id: {
        type: String,
        default: null,
      },
      amount: {
        type: Number,
        default: null,
      },
      currency: {
        type: String,
        default: "USD",
      },
      payment_method: {
        type: String,
        default: null,
      },
      payment_status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    auto_renew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
SubscriptionSchema.index({ user_id: 1, is_active: 1 });
SubscriptionSchema.index({ end_date: 1 });

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;
