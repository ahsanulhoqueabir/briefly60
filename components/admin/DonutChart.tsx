"use client";

import { motion } from "framer-motion";

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
}

export default function DonutChart({
  data,
  size = 200,
  thickness = 30,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - thickness / 2);

  // Compute segments without mutating variables after render
  const { segments } = data.reduce<{
    segments: Array<{
      label: string;
      value: number;
      color: string;
      percentage: number;
      startAngle: number;
      angle: number;
      offset: number;
    }>;
    currentAngle: number;
  }>(
    (acc, item) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = acc.currentAngle;

      acc.segments.push({
        ...item,
        percentage,
        startAngle,
        angle,
        offset: circumference * ((100 - percentage) / 100),
      });

      acc.currentAngle += angle;
      return acc;
    },
    { segments: [], currentAngle: -90 }
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {segments.map((segment, index) => (
              <linearGradient
                key={index}
                id={`gradient-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor={segment.color}
                  stopOpacity="0.7"
                />
              </linearGradient>
            ))}
          </defs>

          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - thickness / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-muted/10"
          />

          {/* Segments */}
          {segments.map((segment, index) => {
            const startAngleRad = (segment.startAngle * Math.PI) / 180;
            const endAngleRad =
              ((segment.startAngle + segment.angle) * Math.PI) / 180;
            const x1 =
              radius + (radius - thickness / 2) * Math.cos(startAngleRad);
            const y1 =
              radius + (radius - thickness / 2) * Math.sin(startAngleRad);
            const x2 =
              radius + (radius - thickness / 2) * Math.cos(endAngleRad);
            const y2 =
              radius + (radius - thickness / 2) * Math.sin(endAngleRad);
            const largeArc = segment.angle > 180 ? 1 : 0;

            return (
              <motion.path
                key={index}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
                d={`M ${x1} ${y1} A ${radius - thickness / 2} ${
                  radius - thickness / 2
                } 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={`url(#gradient-${index})`}
                strokeWidth={thickness}
                strokeLinecap="round"
                className="hover:opacity-80 cursor-pointer transition-opacity"
              >
                <title>{`${segment.label}: ${
                  segment.value
                } (${segment.percentage.toFixed(1)}%)`}</title>
              </motion.path>
            );
          })}
        </svg>

        {/* Center text */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <p className="text-3xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </motion.div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {segments.map((segment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {segment.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {segment.percentage.toFixed(1)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
