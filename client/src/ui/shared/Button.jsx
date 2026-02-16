import { forwardRef } from "react";
import { cn } from "../shared/utils";

const Button = forwardRef(
  (
    { className, variant = "default", size = "default", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
      outline:
        "border-2 border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      link: "text-primary-600 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
