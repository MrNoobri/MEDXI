import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Global loading spinner that displays during API requests
 * Listens to 'api-loading' custom events from axios interceptor
 */
export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleLoadingEvent = (event) => {
      setIsLoading(event.detail.isLoading);
    };

    window.addEventListener('api-loading', handleLoadingEvent);
    return () => window.removeEventListener('api-loading', handleLoadingEvent);
  }, []);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
      </div>
    </div>
  );
}
