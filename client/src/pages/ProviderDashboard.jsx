import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">MEDXI</h1>
              <span className="ml-4 text-sm text-gray-600">
                Provider Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Dr. {user?.profile?.lastName}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Provider Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Today's Appointments</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate("/appointments")}
            >
              View Schedule
            </button>
          </div>

          {/* Patient Alerts */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Patient Alerts</h3>
            <p className="text-3xl font-bold text-danger">0</p>
            <button className="btn btn-primary mt-4">View Alerts</button>
          </div>

          {/* Messages */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Unread Messages</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate("/messages")}
            >
              View Messages
            </button>
          </div>

          {/* Patient List */}
          <div className="card lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Recent Patients</h3>
            <p className="text-gray-600">No recent patients</p>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn btn-secondary w-full">
                View All Patients
              </button>
              <button className="btn btn-secondary w-full">Create Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
