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
        "grid gap-3",
        compact
          ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
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
              "group flex flex-col items-center p-4 rounded-xl border transition-all duration-200",
              "hover:shadow-md hover:scale-105 hover:border-blue-300",
              isSelected
                ? "bg-blue-50 border-blue-300 shadow-md"
                : "bg-white border-gray-200 hover:bg-gray-50",
              compact && "p-3"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-lg mb-2 text-white transition-transform duration-200 group-hover:scale-110",
                category.color,
                compact ? "w-8 h-8" : "w-12 h-12"
              )}
            >
              <Icon className={cn(compact ? "w-4 h-4" : "w-6 h-6")} />
            </div>
            <h3
              className={cn(
                "font-medium text-center text-gray-900 group-hover:text-blue-600 transition-colors",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {category.name}
            </h3>
            <p
              className={cn(
                "text-xs text-gray-500 text-center mt-1",
                compact ? "text-xs" : "text-xs"
              )}
            >
              {category.name_bn}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
