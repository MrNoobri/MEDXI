import React, { useState } from "react";
import { healthMetricsAPI } from "../../api";

const AddMetricModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    metricType: "heartRate",
    value: "",
    unit: "bpm",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const metricTypes = {
    heartRate: { label: "Heart Rate", unit: "bpm", placeholder: "75" },
    bloodPressure: {
      label: "Blood Pressure",
      unit: "mmHg",
      placeholder: "120/80",
    },
    bloodGlucose: { label: "Blood Glucose", unit: "mg/dL", placeholder: "100" },
    weight: { label: "Weight", unit: "kg", placeholder: "70" },
    temperature: { label: "Temperature", unit: "°C", placeholder: "37" },
    oxygenSaturation: {
      label: "Oxygen Saturation",
      unit: "%",
      placeholder: "98",
    },
    steps: { label: "Steps", unit: "steps", placeholder: "10000" },
    sleep: { label: "Sleep", unit: "hours", placeholder: "8" },
    calories: { label: "Calories", unit: "kcal", placeholder: "2000" },
    waterIntake: { label: "Water Intake", unit: "ml", placeholder: "2000" },
  };

  const handleMetricTypeChange = (type) => {
    setFormData({
      ...formData,
      metricType: type,
      unit: metricTypes[type].unit,
      value: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let processedValue = formData.value;

      // Handle blood pressure (split into systolic/diastolic)
      if (formData.metricType === "bloodPressure") {
        const [systolic, diastolic] = formData.value
          .split("/")
          .map((v) => parseInt(v.trim()));
        if (!systolic || !diastolic) {
          setError("Blood pressure must be in format: 120/80");
          setLoading(false);
          return;
        }
        processedValue = { systolic, diastolic };
      } else {
        processedValue = parseFloat(formData.value);
        if (isNaN(processedValue)) {
          setError("Please enter a valid number");
          setLoading(false);
          return;
        }
      }

      await healthMetricsAPI.create({
        metricType: formData.metricType,
        value: processedValue,
        unit: formData.unit,
        notes: formData.notes,
        source: "manual",
      });

      onSuccess();
      onClose();
      setFormData({
        metricType: "heartRate",
        value: "",
        unit: "bpm",
        notes: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add metric");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Add Health Metric
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">Metric Type</label>
              <select
                className="input"
                value={formData.metricType}
                onChange={(e) => handleMetricTypeChange(e.target.value)}
              >
                {Object.entries(metricTypes).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Value ({metricTypes[formData.metricType].unit})
              </label>
              <input
                type="text"
                className="input"
                placeholder={metricTypes[formData.metricType].placeholder}
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                className="input"
                rows="3"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? "Adding..." : "Add Metric"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMetricModal;
