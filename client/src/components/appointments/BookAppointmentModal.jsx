import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsAPI } from "../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2">Healthcare Provider *</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers?.map((provider) => (
                  <SelectItem key={provider._id} value={provider._id}>
                    Dr. {provider.profile?.firstName}{" "}
                    {provider.profile?.lastName} -{" "}
                    {provider.profile?.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Date *</Label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="h-11"
              required
            />
          </div>

          <div>
            <Label className="mb-2">Time *</Label>
            <Select
              value={formData.time}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, time: value }))
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Reason for Visit</Label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Describe your symptoms or reason for the appointment..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={bookMutation.isPending}
              className="flex-1"
            >
              {bookMutation.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
