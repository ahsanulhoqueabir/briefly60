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

import { placeholderImage } from "@/config/env";
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
    image_url: `${placeholderImage}?text=Economic+Policy`,
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
    image_url: `${placeholderImage}?text=Cricket+Victory`,
    trending_score: 95,
  },
  {
    id: "3",
    title: "Revolutionary AI Technology Breakthrough",
    proper_title: "Local University Develops Advanced AI Model for Healthcare",
    content:
      "Researchers at Bangladesh University of Science and Technology have developed an innovative AI model that can diagnose diseases with 95% accuracy. The breakthrough technology could revolutionize healthcare accessibility in rural areas and reduce diagnostic costs significantly.",
    tags: ["ai", "healthcare", "research"],
    category: "technology",
    clickbait_value: 0.8,
    source: "Tech Today",
    published_at: new Date("2024-10-28T08:45:00Z"),
    image_url: `${placeholderImage}?text=AI+Healthcare`,
    trending_score: 88,
  },
  {
    id: "4",
    title: "Export Growth Reaches Record High",
    proper_title: "Bangladesh Garment Exports Increase 15% This Quarter",
    content:
      "The textile and garment industry reported a remarkable 15% growth in exports this quarter, reaching $12 billion. Industry experts attribute this success to improved quality standards, sustainable manufacturing practices, and new international partnerships.",
    tags: ["export", "business", "garment"],
    category: "business",
    clickbait_value: 0.85,
    source: "Business Standard",
    published_at: new Date("2024-10-28T07:15:00Z"),
    image_url: `${placeholderImage}?text=Export+Growth`,
    trending_score: 78,
  },
  {
    id: "5",
    title: "Educational Reform Initiative Launches",
    proper_title: "Government Introduces Digital Learning Platform for Schools",
    content:
      "The Education Ministry launched a comprehensive digital learning platform accessible to over 10 million students nationwide. The initiative includes interactive lessons, virtual laboratories, and AI-powered personalized learning paths.",
    tags: ["education", "digital", "government"],
    category: "education",
    clickbait_value: 0.75,
    source: "Education Times",
    published_at: new Date("2024-10-28T06:30:00Z"),
    image_url: `${placeholderImage}?text=Digital+Learning`,
    trending_score: 82,
  },
  {
    id: "6",
    title: "Climate Action Progress Report",
    proper_title: "Bangladesh Reduces Carbon Emissions by 12% This Year",
    content:
      "Environmental data shows Bangladesh has successfully reduced carbon emissions by 12% through renewable energy adoption and sustainable industrial practices. The achievement puts the country ahead of its climate commitment targets.",
    tags: ["climate", "environment", "sustainability"],
    category: "international",
    clickbait_value: 0.88,
    source: "Green News",
    published_at: new Date("2024-10-28T05:45:00Z"),
    image_url: `${placeholderImage}?text=Climate+Action`,
    trending_score: 75,
  },
  {
    id: "7",
    title: "Cultural Festival Celebrates Heritage",
    proper_title:
      "Dhaka Arts Festival Showcases Traditional and Modern Culture",
    content:
      "The annual Dhaka Arts Festival brought together over 500 artists from across the country, featuring traditional music, contemporary art installations, and cultural performances. The event attracted 100,000+ visitors over the weekend.",
    tags: ["culture", "arts", "festival"],
    category: "entertainment",
    clickbait_value: 0.72,
    source: "Culture Weekly",
    published_at: new Date("2024-10-27T20:00:00Z"),
    image_url: `${placeholderImage}?text=Arts+Festival`,
    trending_score: 65,
  },
  {
    id: "8",
    title: "Healthcare Innovation Success Story",
    proper_title: "Telemedicine Services Reach 2 Million Rural Patients",
    content:
      "The national telemedicine program has successfully provided healthcare services to over 2 million patients in remote areas. The initiative includes specialist consultations, mental health support, and emergency care coordination.",
    tags: ["healthcare", "telemedicine", "rural"],
    category: "health",
    clickbait_value: 0.83,
    source: "Health Today",
    published_at: new Date("2024-10-27T18:30:00Z"),
    image_url: `${placeholderImage}?text=Telemedicine`,
    trending_score: 71,
  },
];

import { NewsBrief } from "@/types";
