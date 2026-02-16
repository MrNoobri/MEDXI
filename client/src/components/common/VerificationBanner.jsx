import { useState } from 'react';
import { Mail, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/shared/Button';
import api from '../api/axios';

export default function VerificationBanner({ user, onDismiss }) {
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    try {
      setIsResending(true);
      await api.post('/auth/resend-verification');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div 
      className="bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-medium">Verify your email address.</span>
              {' '}We've sent a verification link to <strong>{user.email}</strong>.
              {showSuccess && (
                <span className="inline-flex items-center gap-1 ml-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  Verification email sent!
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={isResending || showSuccess}
            className="text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend'
            )}
          </Button>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 p-1"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
