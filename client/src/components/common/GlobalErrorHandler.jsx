import { useState, useEffect } from 'react';
import { Toast } from '../../ui/feedback/Toast';

/**
 * Global error handler that displays toast notifications for API errors
 * Listens to 'api-error' custom events from axios interceptor
 */
export default function GlobalErrorHandler() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleErrorEvent = (event) => {
      const { error } = event.detail;
      
      // Extract error message from response
      const message = error.response?.data?.message 
        || error.message 
        || 'An unexpected error occurred. Please try again.';

      // Don't show toast for 401 errors (handled by auth flow)
      if (error.response?.status === 401) return;

      setToast({ message, type: 'error' });
    };

    window.addEventListener('api-error', handleErrorEvent);
    return () => window.removeEventListener('api-error', handleErrorEvent);
  }, []);

  if (!toast) return null;

  return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;
}
