import React, { useState } from "react";

const WearableDevices = ({
  isSimulating,
  simulatorData,
  onStartSimulator,
  onStopSimulator,
}) => {
  const [devices] = useState([
    {
      id: "apple-watch",
      name: "Apple Watch",
      icon: "⌚",
      type: "smartwatch",
      connected: false,
    },
    {
      id: "fitbit",
      name: "Fitbit",
      icon: "🏃",
      type: "fitness-tracker",
      connected: false,
    },
    {
      id: "samsung-health",
      name: "Samsung Health",
      icon: "📱",
      type: "health-app",
      connected: false,
    },
    {
      id: "simulator",
      name: "Demo Simulator",
      icon: "🤖",
      type: "simulator",
      connected: true,
      description: "Simulates real-time wearable data for testing",
    },
  ]);

  const formatTime = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-primary-foreground shadow-sm border border-border/40">
        <h2 className="text-2xl font-bold mb-2">Wearable Devices</h2>
        <p className="text-primary-foreground/85">
          Connect your wearable devices to automatically track your health
          metrics
        </p>
      </div>

      {/* Simulator Control */}
      <div className="bg-card rounded-xl shadow-md p-6 border border-border theme-surface">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🤖</span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Demo Data Simulator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Simulates real-time health data from a wearable device
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isSimulating
                  ? "bg-success-light text-success-dark"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {isSimulating ? "● Active" : "○ Inactive"}
            </span>
          </div>
        </div>

        {/* Simulator Metrics Display */}
        {isSimulating && simulatorData.lastUpdate && (
          <div className="mb-4 p-4 bg-secondary/30 border border-border rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl mb-1">💓</div>
                <div className="text-2xl font-bold text-primary">
                  {simulatorData.heartRate}
                </div>
                <div className="text-xs text-muted-foreground">bpm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">👣</div>
                <div className="text-2xl font-bold text-primary">
                  {simulatorData.steps}
                </div>
                <div className="text-xs text-muted-foreground">steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🫁</div>
                <div className="text-2xl font-bold text-primary">
                  {simulatorData.spo2}%
                </div>
                <div className="text-xs text-muted-foreground">SpO2</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🩺</div>
                <div className="text-2xl font-bold text-primary">
                  {simulatorData.bloodPressure?.systolic}/
                  {simulatorData.bloodPressure?.diastolic}
                </div>
                <div className="text-xs text-muted-foreground">mmHg</div>
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Last update: {formatTime(simulatorData.lastUpdate)}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isSimulating ? (
            <button
              onClick={onStartSimulator}
              className="flex-1 bg-success hover:bg-success-dark text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>▶</span>
              Start Simulator
            </button>
          ) : (
            <button
              onClick={onStopSimulator}
              className="flex-1 bg-danger hover:bg-danger-dark text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>⏹</span>
              Stop Simulator
            </button>
          )}
        </div>

        {isSimulating && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Simulator Active:</strong> Your dashboard will update with
              new health metrics every 30 seconds. This data is automatically
              saved to your health history.
            </p>
          </div>
        )}
      </div>

      {/* Other Devices */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Available Devices
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {devices
            .filter((d) => d.id !== "simulator")
            .map((device) => (
              <div
                key={device.id}
                className="bg-card rounded-lg shadow-md p-6 border border-border theme-surface"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{device.icon}</span>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {device.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {device.type.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    Not connected
                  </span>
                </div>
                <button
                  disabled
                  className="w-full bg-secondary/70 text-muted-foreground font-medium py-2 px-4 rounded-lg cursor-not-allowed border border-border"
                >
                  Connect (Coming Soon)
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <h4 className="font-semibold text-primary mb-2">💡 How it works</h4>
        <ul className="text-sm text-foreground/90 space-y-1">
          <li>
            • <strong>Demo Simulator:</strong> Click "Start Simulator" to
            generate realistic health data
          </li>
          <li>
            • Data updates every 30 seconds with heart rate, steps, SpO2, and
            blood pressure
          </li>
          <li>
            • All simulated data is automatically saved to your health history
          </li>
          <li>• View trends and insights on your main dashboard</li>
          <li>• Other device integrations coming soon!</li>
        </ul>
      </div>
    </div>
  );
};

export default WearableDevices;
