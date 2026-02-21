import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, BellRing, MessageSquareText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatTile from "@/components/dashboard/StatTile";
import { staggerContainer } from "@/lib/motion";

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = React.useState("today");

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
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h2>
          <div className="w-full sm:w-56">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <StatTile
            title={
              timeframe === "today" ? "Today's Appointments" : "Appointments"
            }
            value="0"
            subtext="No scheduled visits yet"
            icon={CalendarDays}
          />
          <StatTile
            title="Patient Alerts"
            value="0"
            subtext="All monitored patients are stable"
            icon={BellRing}
            valueClassName="text-danger"
          />
          <StatTile
            title="Unread Messages"
            value="0"
            subtext="Inbox is clear"
            icon={MessageSquareText}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  Recent Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">No recent patients</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => navigate("/appointments")}
                >
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full">
                  View All Patients
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/messages")}
                >
                  Create Note
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
