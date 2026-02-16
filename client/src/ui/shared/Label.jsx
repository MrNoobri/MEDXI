import { forwardRef } from "react";
import { cn } from "../shared/utils";

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-200",
      className,
    )}
    {...props}
  />
));

Label.displayName = "Label";

export { Label };
