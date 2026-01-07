"use client";

import { motion } from "framer-motion";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: string;
  color?: string;
}

export default function LineChart({
  data,
  height = "h-64",
  color = "stroke-primary",
}: LineChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M 0,100 L ${points.join(" L ")} L 100,100 Z`;

  return (
    <div className={`w-full ${height} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-muted-foreground/20"
          />
        ))}

        {/* Area gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.3"
              className={color.replace("stroke-", "text-")}
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0"
              className={color.replace("stroke-", "text-")}
            />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          d={areaD}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathD}
          fill="none"
          strokeWidth="0.5"
          className={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 100;
          return (
            <motion.g key={index}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                cx={x}
                cy={y}
                r="1"
                className={`${color.replace("stroke-", "fill-")}`}
              />
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="transparent"
                className="hover:fill-primary/20 cursor-pointer transition-colors"
              >
                <title>{`${item.label}: ${item.value.toFixed(2)}`}</title>
              </circle>
            </motion.g>
          );
        })}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-xs text-muted-foreground"
          >
            {item.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
