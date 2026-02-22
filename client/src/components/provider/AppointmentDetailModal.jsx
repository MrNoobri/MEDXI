import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  X,
  CalendarDays,
  Clock,
  User,
  FileText,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsAPI } from "../../api";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const STATUS_COLORS = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-orange-100 text-orange-800",
};

const TYPE_COLORS = {
  consultation: "bg-primary/15 text-primary",
  "follow-up": "bg-emerald-100 text-emerald-700",
  emergency: "bg-red-100 text-red-700",
  "routine-checkup": "bg-slate-100 text-slate-700",
};

const AppointmentDetailModal = ({ appointment, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(appointment?.status || "scheduled");
  const [providerNotes, setProviderNotes] = useState(
    appointment?.providerNotes || "",
  );
  const [diagnosis, setDiagnosis] = useState(appointment?.diagnosis || "");
  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: (data) => appointmentsAPI.update(appointment._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to update appointment");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => appointmentsAPI.cancel(appointment._id, "Cancelled by provider"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to cancel appointment");
    },
  });

  const handleSave = () => {
    setError("");
    updateMutation.mutate({
      status,
      providerNotes,
      diagnosis,
    });
  };

  if (!isOpen || !appointment) return null;

  const patient = appointment.patientId;
  const isCancelled =
    appointment.status === "cancelled" || appointment.status === "completed";

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-foreground">
              Appointment Details
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Patient Info */}
          <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-secondary/30">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              {patient?.profile?.firstName?.[0]}
              {patient?.profile?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {patient?.profile?.firstName} {patient?.profile?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{patient?.email}</p>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {format(new Date(appointment.scheduledAt), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {format(new Date(appointment.scheduledAt), "h:mm a")} -{" "}
                {appointment.duration} min
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  TYPE_COLORS[appointment.type] || TYPE_COLORS.consultation,
                )}
              >
                {appointment.type}
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-foreground">{appointment.reason}</span>
            </div>
          </div>

          {/* Editable Fields */}
          {!isCancelled && (
            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <Label className="mb-2">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Provider Notes</Label>
                <textarea
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows="3"
                  placeholder="Add notes about this appointment..."
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2">Diagnosis</Label>
                <textarea
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows="2"
                  placeholder="Enter diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Current status badge for cancelled/completed */}
          {isCancelled && (
            <div className="border-t border-border pt-4 mb-4">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  STATUS_COLORS[appointment.status],
                )}
              >
                {appointment.status}
              </span>
              {appointment.providerNotes && (
                <div className="mt-3">
                  <Label className="text-muted-foreground">
                    Provider Notes
                  </Label>
                  <p className="text-sm text-foreground mt-1">
                    {appointment.providerNotes}
                  </p>
                </div>
              )}
              {appointment.diagnosis && (
                <div className="mt-3">
                  <Label className="text-muted-foreground">Diagnosis</Label>
                  <p className="text-sm text-foreground mt-1">
                    {appointment.diagnosis}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border mt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 h-10"
            >
              Close
            </Button>
            {!isCancelled && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="h-10"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel Appt"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 h-10"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
