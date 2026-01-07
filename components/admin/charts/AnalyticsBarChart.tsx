"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

interface AnalyticsBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export default function AnalyticsBarChart({
  data,
  height = 300,
}: AnalyticsBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get primary color from CSS variable
  const getPrimaryColor = () => {
    if (typeof window === "undefined") return "#21808d";
    const root = document.documentElement;
    const primaryHsl = getComputedStyle(root)
      .getPropertyValue("--primary")
      .trim();
    // Convert HSL to hex for consistent usage
    return "#21808d"; // Fallback to our brand teal
  };

  const primaryColor = getPrimaryColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: "100%", height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          onMouseMove={(state) => {
            if (state && state.activeTooltipIndex !== undefined) {
              setHoveredIndex(
                typeof state.activeTooltipIndex === "number"
                  ? state.activeTooltipIndex
                  : null
              );
            }
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              color: "hsl(var(--card-foreground))",
            }}
            cursor={{ fill: "rgba(33, 128, 141, 0.1)" }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
            {data.map((entry, index) => {
              const baseColor = entry.color || primaryColor;
              const isHovered = hoveredIndex === index;

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={baseColor}
                  fillOpacity={isHovered ? 0.8 : 1}
                  style={{
                    transition: "fill-opacity 0.2s ease",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
