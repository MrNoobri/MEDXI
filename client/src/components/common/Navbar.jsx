import React from "react";
import { useNavigate } from "react-router-dom";
import { MoonStar, Palette, SunMedium } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, mode, setTheme, setMode } = useTheme();
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
    <nav className="bg-card shadow-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate(getDashboardLink())}
              className="text-2xl font-bold text-primary hover:opacity-90"
            >
              MEDXI
            </button>

            {user && (
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => navigate(getDashboardLink())}
                  className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/appointments")}
                  className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Appointments
                </button>
                <button
                  onClick={() => navigate("/messages")}
                  className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center gap-2">
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="h-9 w-[126px] rounded-xl border-border/80 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-primary" />
                      <SelectValue aria-label="Select color theme" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="midnight">Midnight</SelectItem>
                    <SelectItem value="emerald">Emerald</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="h-9 w-[104px] rounded-xl border-border/80 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      {mode === "dark" ? (
                        <MoonStar className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <SunMedium className="h-3.5 w-3.5 text-primary" />
                      )}
                      <SelectValue aria-label="Select color mode" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span className="text-foreground text-sm">
                {user.profile?.firstName} {user.profile?.lastName}
                <span className="text-xs text-muted-foreground ml-2">
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </nav>
  );
};

export default Navbar;
