import { SubscriptionPlan } from "@/types/subscription.types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "মাসিক প্ল্যান",
    name_en: "Monthly Plan",
    duration_months: 1,
    price: 50,
    currency: "BDT",
    features: [
      "সীমাহীন আর্টিকেল পড়ুন",
      "কুইজে অংশগ্রহণ করুন",
      "বুকমার্ক সেভ করুন",
      "অ্যাড-ফ্রি অভিজ্ঞতা",
      "প্রিমিয়াম সাপোর্ট",
    ],
    features_en: [
      "Read unlimited articles",
      "Participate in quizzes",
      "Save bookmarks",
      "Ad-free experience",
      "Premium support",
    ],
  },
  {
    id: "half_yearly",
    name: "ছয় মাসের প্ল্যান",
    name_en: "Six-Month Plan",
    duration_months: 6,
    price: 250,
    original_price: 300,
    currency: "BDT",
    popular: true,
    savings: "৫০ টাকা সাশ্রয়",
    savings_en: "Save 50 BDT",
    features: [
      "সীমাহীন আর্টিকেল পড়ুন",
      "কুইজে অংশগ্রহণ করুন",
      "বুকমার্ক সেভ করুন",
      "অ্যাড-ফ্রি অভিজ্ঞতা",
      "প্রিমিয়াম সাপোর্ট",
      "অগ্রাধিকার কাস্টমার সেবা",
    ],
    features_en: [
      "Read unlimited articles",
      "Participate in quizzes",
      "Save bookmarks",
      "Ad-free experience",
      "Premium support",
      "Priority customer support",
    ],
  },
  {
    id: "yearly",
    name: "বার্ষিক প্ল্যান",
    name_en: "Yearly Plan",
    duration_months: 12,
    price: 500,
    original_price: 600,
    currency: "BDT",
    savings: "১০০ টাকা সাশ্রয়",
    savings_en: "Save 100 BDT",
    features: [
      "সীমাহীন আর্টিকেল পড়ুন",
      "কুইজে অংশগ্রহণ করুন",
      "বুকমার্ক সেভ করুন",
      "অ্যাড-ফ্রি অভিজ্ঞতা",
      "প্রিমিয়াম সাপোর্ট",
      "অগ্রাধিকার কাস্টমার সেবা",
      "এক্সক্লুসিভ কন্টেন্ট অ্যাক্সেস",
    ],
    features_en: [
      "Read unlimited articles",
      "Participate in quizzes",
      "Save bookmarks",
      "Ad-free experience",
      "Premium support",
      "Priority customer support",
      "Exclusive content access",
    ],
  },
];

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
};

export const calculateEndDate = (
  startDate: Date,
  durationMonths: number,
): Date => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  return endDate;
};

export const calculateDaysRemaining = (endDate: Date): number => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
