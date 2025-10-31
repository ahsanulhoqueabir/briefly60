// Default categories for news
export const NEWS_CATEGORIES: Category[] = [
  {
    id: "politics",
    name: "Politics",
    name_bn: "রাজনীতি",
    icon: "Vote",
    color: "bg-red-500",
  },
  {
    id: "sports",
    name: "Sports",
    name_bn: "খেলাধুলা",
    icon: "Trophy",
    color: "bg-green-500",
  },
  {
    id: "technology",
    name: "Technology",
    name_bn: "প্রযুক্তি",
    icon: "Smartphone",
    color: "bg-blue-500",
  },
  {
    id: "business",
    name: "Business",
    name_bn: "ব্যবসা",
    icon: "TrendingUp",
    color: "bg-purple-500",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    name_bn: "বিনোদন",
    icon: "Film",
    color: "bg-pink-500",
  },
  {
    id: "health",
    name: "Health",
    name_bn: "স্বাস্থ্য",
    icon: "Heart",
    color: "bg-emerald-500",
  },
  {
    id: "education",
    name: "Education",
    name_bn: "শিক্ষা",
    icon: "GraduationCap",
    color: "bg-orange-500",
  },
  {
    id: "international",
    name: "International",
    name_bn: "আন্তর্জাতিক",
    icon: "Globe",
    color: "bg-indigo-500",
  },
];

import { Category } from "@/types";

// Mock news data for development
export const MOCK_NEWS: NewsBrief[] = [
  {
    id: "1",
    title: "You Won't Believe What This Politician Said About The Economy!",
    proper_title: "Finance Minister Announces New Economic Policy",
    content:
      "The Finance Minister announced a comprehensive economic policy focusing on inflation control and job creation. The new measures include tax reforms, infrastructure investments, and support for small businesses. Implementation begins next quarter with expected positive impacts on GDP growth and employment rates.",
    tags: ["economy", "politics", "policy"],
    category: "politics",
    clickbait_value: 0.3,
    source: "Prothom Alo",
    published_at: new Date("2024-10-28T10:00:00Z"),
    image_url: "/api/placeholder/400/240",
    trending_score: 85,
  },
  {
    id: "2",
    title: "Cricket Team Shows Exceptional Performance",
    proper_title: "Bangladesh Cricket Team Wins Against India",
    content:
      "Bangladesh cricket team secured a historic victory against India in the latest T20 match with outstanding bowling and batting performances. The team scored 180 runs with Mahmudullah and Shakib leading the charge. This victory puts Bangladesh in a strong position for the upcoming tournament.",
    tags: ["cricket", "bangladesh", "sports"],
    category: "sports",
    clickbait_value: 0.9,
    source: "The Daily Star",
    published_at: new Date("2024-10-28T09:30:00Z"),
    image_url: "/api/placeholder/400/240",
    trending_score: 95,
  },
  // Add more mock data as needed
];

import { NewsBrief } from "@/types";
