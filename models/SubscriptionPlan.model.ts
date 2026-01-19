import mongoose, { Schema, Model } from "mongoose";

export interface ISubscriptionPlan {
  _id: mongoose.Types.ObjectId;
  plan_id: string; // unique identifier: monthly, half_yearly, yearly
  name: string;
  duration_months: number;
  price: number;
  original_price?: number;
  currency: string;
  popular: boolean;
  savings?: string;
  features: string[];
  is_active: boolean; // for soft delete/archiving
  version: number; // for price change tracking
  created_at: Date;
  updated_at: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    plan_id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    duration_months: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    original_price: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "BDT",
      enum: ["BDT", "USD"],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    savings: {
      type: String,
      trim: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    is_active: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Indexes for efficient queries and uniqueness
SubscriptionPlanSchema.index({ plan_id: 1 }, { unique: true });
SubscriptionPlanSchema.index({ is_active: 1, popular: 1 });

const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema);

export default SubscriptionPlan;
