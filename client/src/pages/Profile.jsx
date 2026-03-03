import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Shield, User, Edit3, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authAPI } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    phone: user?.profile?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const initials = `${(user?.profile?.firstName || "U")[0]}${(user?.profile?.lastName || "")[0] || ""}`.toUpperCase();

  const handleSave = async () => {
    try {
      setSaving(true);
      await authAPI.updatePreferences({ profile: form });
      if (refreshUser) await refreshUser();
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account information</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Avatar + Name */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold ring-4 ring-primary/20">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </h2>
                <p className="text-muted-foreground capitalize">{user?.role || "Patient"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Account Information</CardTitle>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
                  <User className="w-3.5 h-3.5" /> First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-foreground font-medium">{user?.profile?.firstName || "—"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
                  <User className="w-3.5 h-3.5" /> Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="text-foreground font-medium">{user?.profile?.lastName || "—"}</p>
                )}
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <p className="text-foreground font-medium">{user?.email || "—"}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <p className="text-foreground font-medium">{user?.profile?.phone || "Not provided"}</p>
              )}
            </div>

            {/* Role (read-only) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1.5">
                <Shield className="w-3.5 h-3.5" /> Role
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                {user?.role || "patient"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
