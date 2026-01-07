"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "bg-primary",
  delay = 0,
}: StatCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
    >
      {/* Background gradient effect */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <motion.h3
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
              className="text-3xl font-bold text-foreground"
            >
              {value}
            </motion.h3>
          </div>
          {icon && (
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: delay + 0.1, type: "spring" }}
              className={`p-3 ${color} bg-opacity-10 rounded-lg`}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-sm">
            {trend && trendValue && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
                className={`flex items-center gap-1 font-medium ${trendColors[trend]}`}
              >
                <span className="text-lg">{trendIcons[trend]}</span>
                {trendValue}
              </motion.span>
            )}
            {subtitle && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4 }}
                className="text-muted-foreground"
              >
                {subtitle}
              </motion.span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
