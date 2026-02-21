import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/shared/Card";
import { Button } from "../ui/shared/Button";
import { Input } from "../ui/shared/Input";
import { Label } from "../ui/shared/Label";
import { Toast } from "../ui/feedback/Toast";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../api";

const profileSchema = yup
  .object({
    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "Minimum 2 characters"),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Minimum 2 characters"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
      .string()
      .test(
        "phone-format",
        "Invalid phone number",
        (value) =>
          !value ||
          /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(
            value,
          ),
      ),
  })
  .required();

export default function MyAccount() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.profile?.avatar || null,
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || "",
      lastName: user?.profile?.lastName || "",
      email: user?.email || "",
      phone: user?.profile?.phone || "",
    },
  });

  // Load the freshest profile so form defaults stay in sync
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const response = await usersAPI.getMe();
        const freshUser = response.data.data;
        if (!isMounted) return;
        updateUser(freshUser);
      } catch (error) {
        console.error("Failed to load profile", error);
        setToast({
          message:
            error.response?.data?.message || "Unable to load profile data",
          type: "error",
        });
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    reset({
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      email: user.email || "",
      phone: user.profile?.phone || "",
    });
    setAvatarPreview(user.profile?.avatar || null);
    setIsLoadingProfile(false);
  }, [reset, user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setToast({ message: "Please upload an image file", type: "error" });
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "File size must be less than 5MB", type: "error" });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Prepare avatar payload as base64/string (server expects avatar string)
      const avatarValue = avatarFile ? avatarPreview : user?.profile?.avatar;

      // Update profile
      const response = await usersAPI.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: avatarValue,
        email: data.email,
      });
      const updatedUser = response?.data?.data;

      // Keep auth context in sync
      if (updatedUser) {
        updateUser(updatedUser);
        setAvatarPreview(updatedUser.profile?.avatar || avatarValue);
      } else {
        updateUser({
          ...(user || {}),
          email: data.email,
          profile: {
            ...(user?.profile || {}),
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatar: avatarValue,
          },
        });
      }

      setToast({ message: "Profile updated successfully!", type: "success" });

      // If email changed, show verification notice
      if (data.email !== user?.email) {
        // Clear existing timeout before setting new one
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }

        toastTimeoutRef.current = setTimeout(() => {
          setToast({
            message:
              "Email changed. Please check your inbox to verify your new email address.",
            type: "info",
          });
        }, 3000);
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="sr-only"
                      aria-label="Upload avatar"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload a profile picture (max 5MB)
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    aria-invalid={errors.firstName ? "true" : "false"}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    aria-invalid={errors.lastName ? "true" : "false"}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    placeholder="+1 (555) 123-4567"
                    {...register("phone")}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || (!isDirty && !avatarFile)}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
