import React from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Name:</span>{" "}
            {user?.profile?.firstName} {user?.profile?.lastName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user?.email}
          </div>
          <div>
            <span className="font-medium">Role:</span> {user?.role}
          </div>
          <div>
            <span className="font-medium">Phone:</span>{" "}
            {user?.profile?.phone || "Not provided"}
          </div>
        </div>
        <button className="btn btn-primary mt-6">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
