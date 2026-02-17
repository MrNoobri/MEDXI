import {
  Activity,
  Moon,
  Flame,
  Droplet,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Card } from "../shared/Card";
import { Button } from "../shared/Button";
import { Edit2 } from "lucide-react";
import { cn } from "../shared/utils";

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "text-indigo-500",
    bgDark: "dark:bg-indigo-950",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: "text-blue-500",
    bgDark: "dark:bg-blue-950",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    icon: "text-orange-500",
    bgDark: "dark:bg-orange-950",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    icon: "text-red-500",
    bgDark: "dark:bg-red-950",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    icon: "text-pink-500",
    bgDark: "dark:bg-pink-950",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "text-green-500",
    bgDark: "dark:bg-green-950",
  },
};

export default function StatsCard({
  icon: Icon,
  label,
  value,
  unit,
  change,
  color,
  description,
  editable = false,
  onEdit,
}) {
  const colors = colorMap[color] || colorMap.indigo;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 relative group">
      {editable && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          onClick={onEdit}
          aria-label={`Edit ${label}`}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg", colors.bg, colors.bgDark)}>
          <Icon className={cn("w-6 h-6", colors.icon)} />
        </div>
        <span className={cn("text-sm", colors.text)}>{change}</span>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Card>
  );
}
