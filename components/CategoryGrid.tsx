"use client";

import React from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: Category[];
  selectedCategory?: string;
  compact?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  compact = false,
}) => {
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent || Icons.Circle;
  };

  return (
    <div
      className={cn(
        compact
          ? "flex overflow-x-auto gap-2 pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
      )}
    >
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        const isSelected = selectedCategory === category.id;

        return (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className={cn(
              "group relative flex flex-col items-center rounded-lg border transition-all duration-300",
              "hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary/5",
              isSelected
                ? "bg-primary/10 border-primary/50 shadow-md"
                : "bg-card border-border hover:bg-primary/5",
              compact
                ? "p-2 shrink-0 w-12 h-12 md:w-auto md:h-auto md:p-3"
                : "p-3"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-lg text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                category.color,
                compact ? "w-8 h-8 md:w-10 md:h-10 md:mb-2" : "w-10 h-10 mb-2"
              )}
            >
              <Icon
                className={cn(compact ? "w-4 h-4 md:w-5 md:h-5" : "w-5 h-5")}
              />
            </div>

            {/* Category Name - Hidden on mobile for compact, visible on larger screens */}
            <h3
              className={cn(
                "font-medium text-center transition-all duration-300",
                compact
                  ? "hidden md:block text-xs text-foreground group-hover:text-primary"
                  : "text-xs text-foreground group-hover:text-primary"
              )}
            >
              {category.name}
            </h3>

            {/* Bengali Name - Only show on larger screens for compact mode */}
            {!compact && (
              <p className="text-xs text-muted-foreground text-center mt-1 group-hover:text-primary/70 transition-colors">
                {category.name_bn}
              </p>
            )}

            {compact && (
              <p className="hidden md:block text-xs text-muted-foreground text-center mt-1 group-hover:text-primary/70 transition-colors">
                {category.name_bn}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
