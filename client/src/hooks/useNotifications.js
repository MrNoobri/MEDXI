import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { alertsAPI } from "../api";

const DEFAULT_POLL_INTERVAL = 15000;

const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await alertsAPI.getUnreadCount();
      setUnreadCount(response.data.data.count || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token invalid, clear it to stop polling
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
  };

  const startPolling = () => {
    if (pollRef.current) return;
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, DEFAULT_POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    const enableRealtime =
      import.meta.env.VITE_ENABLE_REALTIME?.toLowerCase() !== "false";

    if (!enableRealtime) {
      startPolling();
      return () => stopPolling();
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      startPolling();
      return () => stopPolling();
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");
    const socket = io(socketUrl, {
      path: "/ws",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsRealtime(true);
      stopPolling();
      fetchUnreadCount();
    });

    socket.on("connect_error", () => {
      setIsRealtime(false);
      startPolling();
    });

    socket.on("disconnect", () => {
      setIsRealtime(false);
      startPolling();
    });

    socket.on("alert:new", ({ alert }) => {
      setUnreadCount((prev) => prev + 1);
      setToast({
        message: alert?.title || "New health alert",
        type: "warning",
      });
    });

    socket.on("appointment:confirmed", () => {
      setToast({
        message: "Appointment confirmed",
        type: "success",
      });
    });

    socket.on("metric:updated", ({ metric }) => {
      setToast({
        message: `${metric?.metricType || "Health metric"} updated`,
        type: "info",
      });
    });

    return () => {
      socket.disconnect();
      stopPolling();
    };
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    toast,
    setToast,
    markAllRead,
    isRealtime,
  };
};

export default useNotifications;
