import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBookmark extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  news_id: mongoose.Types.ObjectId;
  news_title?: string;
  news_source?: string;
  news_url?: string;
  bookmarked_at: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    news_id: {
      type: Schema.Types.ObjectId,
      required: [true, "News ID is required"],
    },
    news_title: {
      type: String,
      default: null,
    },
    news_source: {
      type: String,
      default: null,
    },
    news_url: {
      type: String,
      default: null,
    },
    bookmarked_at: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate bookmarks
BookmarkSchema.index({ user_id: 1, news_id: 1 }, { unique: true });
BookmarkSchema.index({ bookmarked_at: -1 });

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>("Bookmark", BookmarkSchema);

export default Bookmark;
