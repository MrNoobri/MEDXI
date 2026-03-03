import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Floating "XI" AI button — bottom-right, appears only when `visible` is true.
 * Pulses gently to attract attention.
 */
export default function FloatingAIButton({ visible, onClick, className }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "w-14 h-14 rounded-2xl",
            "bg-gradient-to-br from-primary to-primary/80",
            "text-primary-foreground shadow-lg shadow-primary/25",
            "flex items-center justify-center",
            "ring-2 ring-primary/20 hover:ring-primary/40 transition-all",
            "cursor-pointer select-none",
            className
          )}
          aria-label="Open AI Assistant"
        >
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-2xl animate-ping bg-primary/20 pointer-events-none" style={{ animationDuration: "2.5s" }} />

          <span className="relative text-lg font-black tracking-tighter leading-none">
            <span className="opacity-80">X</span>I
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
