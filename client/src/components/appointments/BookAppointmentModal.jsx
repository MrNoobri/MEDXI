import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsAPI } from "../../api";

const BookAppointmentModal = ({ isOpen, onClose, providers }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    provider: "",
    date: "",
    time: "",
    reason: "",
  });

  const bookMutation = useMutation({
    mutationFn: (data) => appointmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      onClose();
      setFormData({ provider: "", date: "", time: "", reason: "" });
      alert("Appointment booked successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to book appointment");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.provider || !formData.date || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }
    bookMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Healthcare Provider *
            </label>
            <select
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a provider</option>
              {providers?.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  Dr. {provider.profile?.firstName} {provider.profile?.lastName}{" "}
                  - {provider.profile?.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your symptoms or reason for the appointment..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {bookMutation.isPending ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
