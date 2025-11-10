"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = "md",
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        buttonSizes[size],
        "text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun
          className={cn(
            sizeClasses[size],
            "transition-transform hover:rotate-180"
          )}
        />
      ) : (
        <Moon
          className={cn(
            sizeClasses[size],
            "transition-transform hover:-rotate-12"
          )}
        />
      )}
    </button>
  );
};

export default ThemeToggle;
