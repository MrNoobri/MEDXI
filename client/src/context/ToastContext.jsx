import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { BasicToast } from "@/components/ui/toast-animated";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = "success", duration = 3000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration, isVisible: true }]);

    // Auto-remove after duration + exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, duration) => addToast({ message, type: "success", duration }),
    error: (message, duration) => addToast({ message, type: "error", duration }),
    warning: (message, duration) => addToast({ message, type: "warning", duration }),
    info: (message, duration) => addToast({ message, type: "info", duration }),
  }, [addToast]);

  // Make toast callable directly
  const toastFn = Object.assign(
    (message, type, duration) => addToast({ message, type, duration }),
    toast
  );

  return (
    <ToastContext.Provider value={toastFn}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <BasicToast
                message={t.message}
                type={t.type}
                duration={t.duration}
                isVisible={t.isVisible}
                onClose={() => removeToast(t.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
