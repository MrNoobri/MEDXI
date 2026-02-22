import { useState, useEffect } from "react";
import { googleFitAPI } from "../api";

const GoogleFitConnect = ({ onSyncComplete }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get("googlefit") === "connected") {
      setConnected(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("error")) {
      alert("Failed to connect Google Fit. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await googleFitAPI.getStatus();
      const data = response.data;
      if (data.success) {
        setConnected(data.data.connected);
      }
    } catch (error) {
      console.error("Error checking Google Fit status:", error);
    }
  };

  useEffect(() => {
    checkConnectionStatus();

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get("googlefit") === "connected") {
      setConnected(true);
      setToast({
        message: "Google Fit connected successfully!",
        type: "success",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("error")) {
      setToast({
        message: "Failed to connect Google Fit. Please try again.",
        type: "error",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await googleFitAPI.getAuthUrl();
      const data = response.data;

      if (response.data.success && response.data.data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.data.authUrl;
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error connecting to Google Fit:", error);
      alert(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : "Failed to connect to Google Fit. Please try again.",
      );
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const response = await googleFitAPI.disconnect();
      const data = response.data;

      if (response.data.success) {
        setConnected(false);
        setToast({
          message: "Google Fit disconnected successfully",
          type: "success",
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error disconnecting Google Fit:", error);
      setToast({ message: "Failed to disconnect Google Fit", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await googleFitAPI.sync();
      const data = response.data;

      if (response.data.success) {
        setToast({
          message: "Google Fit data synced successfully!",
          type: "success",
        });
        // Trigger refresh of health metrics
        if (onSyncComplete) onSyncComplete();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error syncing Google Fit data:", error);
      setToast({
        message:
          error.response?.data?.message || "Failed to sync Google Fit data",
        type: "error",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-md border border-border theme-surface">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center text-primary-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Google Fit Integration
            </h3>
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Connected - Syncing your health data automatically"
                : "Connect your Google Fit to sync health data from your devices"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {connected ? (
            <>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success-dark">
                <span className="w-2 h-2 mr-1 bg-success rounded-full animate-pulse"></span>
                Connected
              </span>
            </>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Not Connected
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        {connected ? (
          <>
            <button
              onClick={handleSync}
              disabled={syncing || loading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sync Now
                </>
              )}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading || syncing}
              className="inline-flex justify-center items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-gradient-to-r from-primary to-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                Connect Google Fit
              </>
            )}
          </button>
        )}
      </div>

      {!connected && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <h4 className="text-sm font-medium text-primary mb-2">
            What data will be synced?
          </h4>
          <ul className="text-sm text-foreground/90 space-y-1">
            <li>• Steps and activity data</li>
            <li>• Heart rate measurements</li>
            <li>• Sleep duration</li>
            <li>• Blood pressure (if available)</li>
            <li>• Blood glucose (if available)</li>
            <li>• Oxygen saturation (if available)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Note for iPhone users:</strong> Install the Google Fit app
            and connect it to Apple Health first.
          </p>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default GoogleFitConnect;
