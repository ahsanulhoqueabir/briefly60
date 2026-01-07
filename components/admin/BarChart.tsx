"use client";

import { motion } from "framer-motion";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: string;
  showValues?: boolean;
}

export default function BarChart({
  data,
  maxValue,
  height = "h-64",
  showValues = true,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className={`flex items-end gap-2 ${height} w-full`}>
      {data.map((item, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col items-center gap-2 group"
        >
          <div className="relative flex-1 w-full flex items-end">
            {showValues && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground/70"
              >
                {item.value}
              </motion.div>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / max) * 100}%` }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className={`w-full rounded-t-md ${
                item.color || "bg-primary"
              } hover:opacity-80 transition-opacity cursor-pointer relative group`}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent rounded-t-md" />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="text-xs text-center font-medium text-muted-foreground truncate w-full"
          >
            {item.label}
          </motion.p>
        </div>
      ))}
    </div>
  );
}
