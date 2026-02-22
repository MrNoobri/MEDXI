import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import MetricRing from "@/components/dashboard/MetricRing";
import { cn } from "@/lib/utils";

const MetricRingCard = ({
  title,
  value,
  target,
  min,
  max,
  unit,
  icon: Icon,
  ringColor,
  detailContent,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Goal-based: progress = value / target
  // Range-based: progress = (value - min) / (max - min)
  let progress;
  let displayLabel;
  let computedRingColor = ringColor || "hsl(var(--primary))";

  if (target != null) {
    // Goal-based
    progress = target > 0 ? Math.min(value / target, 1) : 0;
    displayLabel = `${value}/${target}`;
  } else if (min != null && max != null) {
    // Range-based
    const range = max - min;
    progress = range > 0 ? Math.min(Math.max((value - min) / range, 0), 1) : 0;
    displayLabel = `${value}`;

    // Color zones for range-based
    if (progress > 0.85 || progress < 0.15) {
      computedRingColor = "hsl(var(--danger, 0 84% 60%))";
    } else if (progress > 0.7 || progress < 0.25) {
      computedRingColor = "hsl(var(--warning, 38 92% 50%))";
    } else {
      computedRingColor = "hsl(var(--success, 142 76% 36%))";
    }
  } else {
    progress = 0;
    displayLabel = `${value}`;
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 overflow-hidden",
        isExpanded && "border-primary/20 shadow-md",
        className,
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="relative shrink-0">
            <MetricRing
              progress={progress}
              size={80}
              strokeWidth={8}
              ringColor={computedRingColor}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">
                {displayLabel}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
              <h4 className="text-sm font-semibold text-foreground truncate">
                {title}
              </h4>
            </div>
            {unit && (
              <p className="text-xs text-muted-foreground">{unit}</p>
            )}
          </div>

          {/* Expand indicator */}
          {detailContent && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Expandable Detail */}
      <AnimatePresence>
        {isExpanded && detailContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border">
              {detailContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MetricRingCard;
