"use client";

import { Article } from "@/types/news.types";
import {
  SlidingLogoMarquee,
  SlidingLogoMarqueeItem,
} from "@/components/ui/scroll-title";

interface NewsTickerProps {
  articles: Article[];
}

export default function NewsTicker({ articles }: NewsTickerProps) {
  if (articles.length === 0) return null;

  const marqueeItems: SlidingLogoMarqueeItem[] = articles.map((article) => ({
    id: article._id,
    content: (
      <span className="text-xs font-medium whitespace-nowrap">
        {article.title}
      </span>
    ),
  }));

  return (
    <div className="w-full bg-primary text-primary-foreground border-b border-border py-0">
      <SlidingLogoMarquee
        items={marqueeItems}
        speed={280}
        pauseOnHover={true}
        enableBlur={false}
        height="32px"
        gap="2rem"
        showControls={false}
        autoPlay={true}
        className=""
      />
    </div>
  );
}
