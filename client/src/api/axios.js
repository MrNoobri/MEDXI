import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Track active requests for loading indicator
let activeRequests = 0;

// Dispatch custom events for loading state
const dispatchLoadingEvent = (isLoading) => {
  window.dispatchEvent(new CustomEvent('api-loading', { detail: { isLoading } }));
};

// Dispatch custom events for errors
const dispatchErrorEvent = (error) => {
  window.dispatchEvent(new CustomEvent('api-error', { detail: { error } }));
};

// Request interceptor to add auth token and handle loading
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Increment active requests and show loading
    activeRequests++;
    if (activeRequests === 1) {
      dispatchLoadingEvent(true);
    }
    
    return config;
  },
  (error) => {
    // Decrement on request error
    activeRequests--;
    if (activeRequests === 0) {
      dispatchLoadingEvent(false);
    }
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh, loading, and errors
api.interceptors.response.use(
  (response) => {
    // Decrement active requests and hide loading
    activeRequests--;
    if (activeRequests === 0) {
      dispatchLoadingEvent(false);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Decrement active requests
    activeRequests--;
    if (activeRequests === 0) {
      dispatchLoadingEvent(false);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { refreshToken },
          );

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Dispatch error event for global error handling
    // Only dispatch for non-401 errors (401 is handled above)
    if (error.response?.status !== 401) {
      dispatchErrorEvent(error);
    }

    return Promise.reject(error);
  },
);

export default api;
