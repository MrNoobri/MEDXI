import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../ui/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/shared/Card";
import Navbar from "../components/common/Navbar";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-900">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Role:</span>
                <span className="text-gray-900 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="text-gray-900">
                  {user?.profile?.phone || "Not provided"}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button onClick={() => navigate("/account")} className="flex-1">
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
