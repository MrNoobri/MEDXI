import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (user?.role === "patient") return "/dashboard";
    if (user?.role === "provider") return "/provider/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate(getDashboardLink())}
              className="text-2xl font-bold text-primary-600 hover:text-primary-700"
            >
              MEDXI
            </button>

            {user && (
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => navigate(getDashboardLink())}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/appointments")}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Appointments
                </button>
                <button
                  onClick={() => navigate("/messages")}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm">
                {user.profile?.firstName} {user.profile?.lastName}
                <span className="text-xs text-gray-500 ml-2">
                  ({user.role})
                </span>
              </span>
              <button
                onClick={() => navigate("/profile")}
                className="btn btn-secondary text-sm"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
