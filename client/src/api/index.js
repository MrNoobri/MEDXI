import api from "./axios";

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  setPassword: (data) => api.post("/auth/set-password", data),
  updatePreferences: (data) => api.patch("/auth/preferences", data),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  getProviders: () => api.get("/auth/providers"),
};

// Health Metrics APIs
export const healthMetricsAPI = {
  create: (data) => api.post("/health-metrics", data),
  getAll: (params) => api.get("/health-metrics", { params }),
  getByUser: (userId, params) =>
    api.get(`/health-metrics/user/${userId}`, { params }),
  getLatest: (userId) =>
    api.get(`/health-metrics/latest${userId ? `/${userId}` : ""}`),
  getStats: (params) => api.get("/health-metrics/stats", { params }),
  delete: (id) => api.delete(`/health-metrics/${id}`),
};

// Appointments APIs
export const appointmentsAPI = {
  create: (data) => api.post("/appointments", data),
  getAll: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel`, { reason }),
  getProviderAvailability: (providerId, date) =>
    api.get(`/appointments/availability/${providerId}`, { params: { date } }),
};

// Alerts APIs
export const alertsAPI = {
  getAll: (params) => api.get("/alerts", { params }),
  getUnreadCount: () => api.get("/alerts/unread-count"),
  markAsRead: (id) => api.patch(`/alerts/${id}/read`),
  markResolved: (id) => api.post(`/alerts/${id}/acknowledge`),
  acknowledge: (id) => api.post(`/alerts/${id}/acknowledge`),
  delete: (id) => api.delete(`/alerts/${id}`),
};

// Messages APIs
export const messagesAPI = {
  send: (data) => api.post("/messages", data),
  getConversations: () => api.get("/messages/conversations"),
  getAll: (params) => api.get("/messages", { params }),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  getUnreadCount: () => api.get("/messages/unread-count"),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Chatbot APIs
export const chatbotAPI = {
  sendMessage: (data) => api.post("/chatbot/message", data),
  getSuggestions: () => api.get("/chatbot/suggestions"),
};

// Google Fit APIs
export const googleFitAPI = {
  getStatus: () => api.get("/googlefit/status"),
  getAuthUrl: () => api.get("/googlefit/auth"),
  sync: () => api.post("/googlefit/sync"),
  disconnect: () => api.post("/googlefit/disconnect"),
};
