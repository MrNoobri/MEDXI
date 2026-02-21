import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { tileEnterVariants, tileHover } from "@/lib/motion";

export default function StatTile({
  title,
  value,
  subtext,
  icon: Icon,
  className,
  valueClassName,
}) {
  return (
    <motion.div
      variants={tileEnterVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={tileHover.whileHover}
      transition={tileHover.transition}
    >
      <Card className={cn("h-full", className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p
                className={cn(
                  "mt-2 text-3xl font-bold text-primary",
                  valueClassName,
                )}
              >
                {value}
              </p>
              {subtext ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtext}</p>
              ) : null}
            </div>
            {Icon ? (
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
