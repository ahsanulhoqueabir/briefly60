"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface DiscoverFilters {
  source_name: string;
  category: string;
  published_after: string;
  published_before: string;
  importance_min: string;
  importance_max: string;
  clickbait_min: string;
  clickbait_max: string;
  search: string;
  keywords: string;
  sort_by: string;
  sort_order: "asc" | "desc";
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onFilterChange: (key: keyof DiscoverFilters, value: string) => void;
  onClearFilters: () => void;
}

const NEWS_SOURCES = [
  { value: "Prothom Alo", label: "প্রথম আলো (Prothom Alo)" },
  { value: "The Daily Star", label: "দ্য ডেইলি স্টার (The Daily Star)" },
  {
    value: "BD Pratidin",
    label: "বাংলাদেশ প্রতিদিন (Bangladesh Pratidin)",
  },
  { value: "Bangla Tribune", label: "বাংলা ট্রিবিউন (Bangla Tribune)" },
  { value: "BBC News", label: "বিবিসি নিউজ (BBC News)" },
  { value: "Daily Campus", label: "দ্যা ডেইলি ক্যাম্পাস (The Daily Campus)" },
  { value: "bd24live bangla", label: "বিডিনিউজ২৪ (bdnews24)" },
  { value: "Jago News 24", label: "জাগো নিউজ ২৪ (Jago News 24)" },
  {
    value: "The Business Standard",
    label: "দ্য বিজনেস স্ট্যান্ডার্ড (The Business Standard)",
  },
];

const CATEGORIES = [
  { value: "Politics", label: "Politics" },
  { value: "Economy", label: "Economy" },
  { value: "International", label: "International" },
  { value: "Sports", label: "Sports" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Technology", label: "Technology" },
  { value: "Health", label: "Health" },
  { value: "Education", label: "Education" },
  { value: "Crime", label: "Crime" },
  { value: "Others", label: "Others" },
];

const SORT_OPTIONS = [
  { value: "published_at", label: "Published Date" },
  { value: "importance", label: "Importance" },
  { value: "clickbait_score", label: "Clickbait Score" },
  { value: "date_created", label: "Date Added" },
];

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterModalProps) {
  if (!isOpen) return null;

  const publishedAfterDate = filters.published_after
    ? new Date(filters.published_after)
    : undefined;
  const publishedBeforeDate = filters.published_before
    ? new Date(filters.published_before)
    : undefined;

  const importanceRange = [
    parseInt(filters.importance_min) || 1,
    parseInt(filters.importance_max) || 10,
  ];

  const clickbaitRange = [
    parseInt(filters.clickbait_min) || 1,
    parseInt(filters.clickbait_max) || 5,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-6001 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">Advanced Filters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearFilters}
              className="text-sm text-secondary hover:underline flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="space-y-6">
            {/* Source & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Newspaper
                </label>
                <div className="flex gap-2">
                  <Select
                    value={filters.source_name || undefined}
                    onValueChange={(value) =>
                      onFilterChange("source_name", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Newspapers" />
                    </SelectTrigger>
                    <SelectContent>
                      {NEWS_SOURCES.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.source_name && (
                    <button
                      onClick={() => onFilterChange("source_name", "")}
                      className="px-3 hover:bg-muted rounded-lg transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <Select
                    value={filters.category || undefined}
                    onValueChange={(value) => onFilterChange("category", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.category && (
                    <button
                      onClick={() => onFilterChange("category", "")}
                      className="px-3 hover:bg-muted rounded-lg transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g: Politics, Election"
                value={filters.keywords}
                onChange={(e) => onFilterChange("keywords", e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Date Range - Same Line */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Publication Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Published After */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-muted border-border hover:bg-muted/80"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {publishedAfterDate ? (
                        format(publishedAfterDate, "PPP", { locale: bn })
                      ) : (
                        <span className="text-muted-foreground">
                          Start Date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={publishedAfterDate}
                      onSelect={(date) =>
                        onFilterChange(
                          "published_after",
                          date ? format(date, "yyyy-MM-dd") : ""
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Published Before */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-muted border-border hover:bg-muted/80"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {publishedBeforeDate ? (
                        format(publishedBeforeDate, "PPP", { locale: bn })
                      ) : (
                        <span className="text-muted-foreground">End Date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={publishedBeforeDate}
                      onSelect={(date) =>
                        onFilterChange(
                          "published_before",
                          date ? format(date, "yyyy-MM-dd") : ""
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Importance Range Slider */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Importance Range: {importanceRange[0]} - {importanceRange[1]}
              </label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={importanceRange}
                onValueChange={(values) => {
                  onFilterChange("importance_min", values[0].toString());
                  onFilterChange("importance_max", values[1].toString());
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 (Low)</span>
                <span>10 (High)</span>
              </div>
            </div>

            {/* Clickbait Range Slider */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Clickbait Score Range: {clickbaitRange[0]} - {clickbaitRange[1]}
              </label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={clickbaitRange}
                onValueChange={(values) => {
                  onFilterChange("clickbait_min", values[0].toString());
                  onFilterChange("clickbait_max", values[1].toString());
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 (Less Clickbait)</span>
                <span>5 (More Clickbait)</span>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort By
                </label>
                <Select
                  value={filters.sort_by}
                  onValueChange={(value) => onFilterChange("sort_by", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Order
                </label>
                <Select
                  value={filters.sort_order}
                  onValueChange={(value) =>
                    onFilterChange("sort_order", value as "asc" | "desc")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">High to Low</SelectItem>
                    <SelectItem value="asc">Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
