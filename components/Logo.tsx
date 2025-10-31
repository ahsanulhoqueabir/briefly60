import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const Logo: React.FC<LogoProps> = ({ className, size = "md", href = "/" }) => {
  const sizeClasses = {
    sm: {
      container: "text-lg",
      number: "px-1.5 py-0.5 text-sm font-bold",
    },
    md: {
      container: "text-2xl",
      number: "px-2 py-1 text-lg font-extrabold",
    },
    lg: {
      container: "text-2xl",
      number: "px-2.5 py-1 text-xl font-extrabold",
    },
  };

  const logoContent = (
    <div className={cn("flex items-center", className)}>
      <span
        className={cn(
          "font-black-ops-one text-secondary",
          sizeClasses[size].container
        )}
      >
        Briefly
        <span
          className={cn(
            "ml-1 bg-primary text-primary-foreground rounded-md inline-block font-inter font-extrabold",
            sizeClasses[size].number
          )}
        >
          60
        </span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="transition-opacity hover:opacity-80 focus:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
