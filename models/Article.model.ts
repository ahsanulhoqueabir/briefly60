import mongoose, { Document, Model, Schema } from "mongoose";

export type ArticleStatus = "published" | "draft" | "archived";

export interface IMCQ {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface IArticle extends Document {
  _id: mongoose.Types.ObjectId;

  // Source
  source_name: string;
  source_url: string;

  // Content
  title: string;
  corrected_title?: string;
  content: string;
  description?: string;
  banner?: string;
  published_at: Date;

  // Summaries (bilingual)
  summary_60_bn: string;
  summary_60_en: string;

  // Classification
  status: ArticleStatus;
  category: string;
  importance: number;
  keywords?: string[];
  clickbait_score: number;
  clickbait_reason?: string;

  // Quiz (embedded)
  quiz_questions?: IMCQ[];

  createdAt: Date;
  updatedAt: Date;
}

const MCQSchema = new Schema<IMCQ>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (options: string[]) {
          return options.length >= 2 && options.length <= 6;
        },
        message: "Options must contain between 2 and 6 choices",
      },
    },
    correct_answer: {
      type: String,
      required: [true, "Correct answer is required"],
      validate: {
        validator: function (this: IMCQ, answer: string) {
          return this.options.includes(answer);
        },
        message: "Correct answer must be one of the options",
      },
    },
  },
  { _id: false },
);

const ArticleSchema = new Schema<IArticle>(
  {
    // Source
    source_name: {
      type: String,
      required: [true, "Source name is required"],
      index: true,
    },
    source_url: {
      type: String,
      required: [true, "Source URL is required"],
    },

    // Content
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    corrected_title: {
      type: String,
      trim: true,
      default: null,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    published_at: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Summaries
    summary_60_bn: {
      type: String,
      required: [true, "Bengali summary is required"],
    },
    summary_60_en: {
      type: String,
      required: [true, "English summary is required"],
    },

    // Classification
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "draft",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    importance: {
      type: Number,
      required: [true, "Importance is required"],
      min: 0,
      max: 10,
      default: 5,
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    clickbait_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    clickbait_reason: {
      type: String,
      default: null,
    },

    // Quiz (embedded MCQs)
    quiz_questions: {
      type: [MCQSchema],
      default: [],
      validate: {
        validator: function (questions: IMCQ[]) {
          return questions.length <= 10;
        },
        message: "Maximum 10 quiz questions allowed per article",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
ArticleSchema.index({ status: 1, published_at: -1 });
ArticleSchema.index({ category: 1, published_at: -1 });
ArticleSchema.index({ importance: -1, published_at: -1 });
ArticleSchema.index({ status: 1, category: 1 });
ArticleSchema.index({ keywords: 1 });

// Text search index
ArticleSchema.index({
  title: "text",
  corrected_title: "text",
  summary_60_bn: "text",
  summary_60_en: "text",
});

// Method to get published articles only
ArticleSchema.statics.getPublished = function () {
  return this.find({ status: "published" }).sort({ published_at: -1 });
};

// Method to get articles by category
ArticleSchema.statics.getByCategory = function (category: string) {
  return this.find({ status: "published", category }).sort({
    published_at: -1,
  });
};

// Virtual for quiz count
ArticleSchema.virtual("quiz_count").get(function (this: IArticle) {
  return this.quiz_questions?.length || 0;
});

// Ensure virtuals are included in JSON
ArticleSchema.set("toJSON", { virtuals: true });
ArticleSchema.set("toObject", { virtuals: true });

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
