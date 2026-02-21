import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MetricRing({
  progress = 0,
  size = 96,
  strokeWidth = 10,
  className,
  trackColor = "hsl(var(--muted))",
  ringColor = "hsl(var(--primary))",
}) {
  const normalized = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized);

  return (
    <div className={cn("inline-flex", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          initial={{ strokeDashoffset: circumference }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    </div>
  );
}
