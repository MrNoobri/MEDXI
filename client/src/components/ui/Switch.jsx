import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Animated toggle switch with framer-motion.
 *
 * Props:
 *  - checked: boolean
 *  - onChange: (checked: boolean) => void
 *  - size: "sm" | "md" | "lg"
 *  - className: string
 *  - icon: { on: React.ReactNode, off: React.ReactNode } – optional icons inside the thumb
 */
const SIZES = {
  sm: { track: "w-9 h-5", thumb: 16, padding: 2 },
  md: { track: "w-11 h-6", thumb: 20, padding: 2 },
  lg: { track: "w-14 h-8", thumb: 26, padding: 3 },
};

export default function Switch({
  checked = false,
  onChange,
  size = "md",
  className,
  icon,
}) {
  const s = SIZES[size] || SIZES.md;
  const travel = size === "sm" ? 16 : size === "lg" ? 26 : 20;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        s.track,
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
      style={{ padding: s.padding }}
    >
      <motion.span
        className={cn(
          "flex items-center justify-center rounded-full bg-white shadow-sm",
        )}
        style={{ width: s.thumb, height: s.thumb }}
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{ x: checked ? travel : 0 }}
      >
        {icon && (
          <span className="text-[10px] leading-none text-gray-600">
            {checked ? icon.on : icon.off}
          </span>
        )}
      </motion.span>
    </button>
  );
}
