import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
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
              <span className="ml-4 text-sm text-gray-600">Admin Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.profile?.firstName}</span>
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
          Admin Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI Cards */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Active Sessions
            </h3>
            <p className="text-3xl font-bold text-success">0</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Alerts Today
            </h3>
            <p className="text-3xl font-bold text-warning">0</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              System Status
            </h3>
            <p className="text-lg font-semibold text-success">Operational</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* User Management */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">User Management</h3>
            <p className="text-gray-600 mb-4">Manage system users</p>
            <button className="btn btn-primary">Manage Users</button>
          </div>

          {/* System Logs */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Audit Logs</h3>
            <p className="text-gray-600 mb-4">View system audit logs</p>
            <button className="btn btn-primary">View Logs</button>
          </div>

          {/* System Settings */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure system parameters</p>
            <button className="btn btn-primary">Settings</button>
          </div>

          {/* Reports */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Reports</h3>
            <p className="text-gray-600 mb-4">Generate system reports</p>
            <button className="btn btn-primary">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
