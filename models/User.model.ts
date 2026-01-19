import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type UserRole = "superadmin" | "admin" | "editor" | "user";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  image?: string;
  rbac: UserRole;
  reset_password_token?: string;
  reset_password_expires?: Date;
  preferences?: {
    language?: string;
    notifications?: boolean;
    theme?: "light" | "dark";
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    rbac: {
      type: String,
      enum: ["superadmin", "admin", "editor", "user"],
      default: "user",
    },
    reset_password_token: {
      type: String,
      select: false, // Don't return by default
    },
    reset_password_expires: {
      type: Date,
      select: false, // Don't return by default
    },
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries (email already has unique index)
UserSchema.index({ rbac: 1 });

// Method to transform user object (remove sensitive data)
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
