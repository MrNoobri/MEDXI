import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { alertsAPI } from "@/api";
import { cn } from "@/lib/utils";

/**
 * Floating notification bell — shows unread alert count.
 * Fixed position, bottom-right, stacked above the AI button.
 */
export default function FloatingNotifications({ visible, className }) {
  const navigate = useNavigate();

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadAlertCount"],
    queryFn: async () => {
      const res = await alertsAPI.getUnreadCount();
      return res.data?.data?.count ?? 0;
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const count = unreadCount ?? 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 22,
            delay: 0.08,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/alerts")}
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-12 h-12 rounded-xl",
            "bg-card shadow-lg shadow-black/10",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-foreground transition-colors",
            "cursor-pointer select-none",
            className,
          )}
          aria-label={`${count} unread alerts`}
        >
          <Bell className="w-5 h-5" />

          {/* Badge */}
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
