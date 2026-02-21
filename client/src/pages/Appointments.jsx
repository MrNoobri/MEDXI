import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import AppointmentCard from "../components/appointments/AppointmentCard";
import BookAppointmentModal from "../components/appointments/BookAppointmentModal";
import { appointmentsAPI, authAPI } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Appointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showBookModal, setShowBookModal] = useState(false);
  const [filter, setFilter] = useState("upcoming");

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments", filter],
    queryFn: async () => {
      const params = {};
      if (filter === "upcoming") {
        params.status = "scheduled";
      } else if (filter === "past") {
        params.status = "completed";
      }
      const response = await appointmentsAPI.getAll(params);
      return response.data.data;
    },
  });

  // Fetch providers (only for patients)
  const { data: providersData } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const response = await authAPI.getProviders();
      return response.data.data;
    },
    enabled: user?.role === "patient",
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: (appointmentId) => appointmentsAPI.cancel(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      alert("Appointment cancelled successfully");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to cancel appointment");
    },
  });

  const handleCancel = (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(appointmentId);
    }
  };

  const filterButtons = [
    { value: "upcoming", label: "Upcoming", icon: "📅" },
    { value: "past", label: "Past", icon: "📋" },
    { value: "all", label: "All", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Appointments</h2>
            <p className="text-muted-foreground mt-1">
              {user?.role === "patient"
                ? "Manage your healthcare appointments"
                : "View and manage patient appointments"}
            </p>
          </div>
          {user?.role === "patient" && (
            <Button onClick={() => setShowBookModal(true)}>
              + Book Appointment
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6 p-1 rounded-xl theme-tab-surface w-fit">
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant="ghost"
              onClick={() => setFilter(btn.value)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                filter === btn.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              {btn.icon} {btn.label}
            </Button>
          ))}
        </div>

        {/* Appointments Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading appointments...</div>
          </div>
        ) : appointmentsData && appointmentsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointmentsData.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 theme-surface">
            <CardContent>
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No appointments found
              </h3>
              <p className="text-muted-foreground mb-6">
                {user?.role === "patient"
                  ? "Book your first appointment with a healthcare provider"
                  : "No appointments scheduled yet"}
              </p>
              {user?.role === "patient" && (
                <Button onClick={() => setShowBookModal(true)}>
                  Book Appointment
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Book Appointment Modal */}
      {user?.role === "patient" && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          providers={providersData}
        />
      )}
    </div>
  );
};

export default Appointments;
