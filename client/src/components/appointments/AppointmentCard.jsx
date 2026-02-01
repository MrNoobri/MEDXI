import React from "react";
import { format } from "date-fns";

const AppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    rescheduled: "bg-yellow-100 text-yellow-800",
  };

  const formatDateTime = (date, time) => {
    try {
      const dateObj = new Date(date);
      return {
        date: format(dateObj, "MMM dd, yyyy"),
        time: time || "Time not set",
      };
    } catch (error) {
      return { date: "Invalid date", time: "" };
    }
  };

  const { date, time } = formatDateTime(appointment.date, appointment.time);

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {appointment.provider?.profile?.firstName}{" "}
            {appointment.provider?.profile?.lastName}
          </h3>
          <p className="text-sm text-gray-600">
            {appointment.provider?.profile?.specialization ||
              "Healthcare Provider"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[appointment.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700">
          <span className="mr-2">📅</span>
          <span>{date}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="mr-2">🕐</span>
          <span>{time}</span>
        </div>
        {appointment.reason && (
          <div className="flex items-start text-gray-700">
            <span className="mr-2">📋</span>
            <span className="text-sm">{appointment.reason}</span>
          </div>
        )}
        {appointment.notes && (
          <div className="flex items-start text-gray-700 mt-2">
            <span className="mr-2">📝</span>
            <span className="text-sm italic">{appointment.notes}</span>
          </div>
        )}
      </div>

      {appointment.status === "scheduled" && (
        <div className="flex space-x-2">
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="btn btn-secondary flex-1"
            >
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(appointment._id)}
              className="btn bg-red-500 text-white hover:bg-red-600 flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
