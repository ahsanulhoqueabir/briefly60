"use client";

import { useArticles } from "@/contexts/ArticlesContext";
import { RefreshCw } from "lucide-react";

export default function RefreshIndicator() {
  const { isRefreshing } = useArticles();

  if (!isRefreshing) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
      <RefreshCw className="w-4 h-4 text-primary animate-spin" />
      <span className="text-sm text-primary font-medium">Updating...</span>
    </div>
  );
}
