import React from "react";
import {
  Home,
  Activity,
  CalendarCheck,
  MessageSquare,
  BotMessageSquare,
  Watch,
  Palette,
} from "lucide-react";
import { Dock, DockItem, DockIcon, DockLabel } from "@/components/ui/dock";

const PATIENT_NAV = [
  { id: "overview", label: "Home", icon: Home },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "ai", label: "AI Assistant", icon: BotMessageSquare },
  { id: "wearables", label: "Wearables", icon: Watch },
];

const PROVIDER_NAV = [
  { id: "overview", label: "Home", icon: Home },
  { id: "patients", label: "Patients", icon: Activity },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "ai", label: "AI Assistant", icon: BotMessageSquare },
];

export default function DashboardDock({
  activeTab,
  onTabChange,
  role = "patient",
  onThemeToggle,
  className,
}) {
  const navItems = role === "provider" ? PROVIDER_NAV : PATIENT_NAV;

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ${className || ""}`}>
      <Dock
        magnification={60}
        distance={100}
        className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <DockItem
              key={item.id}
              className={`relative cursor-pointer rounded-full transition-colors ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <DockIcon>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </DockIcon>
              <DockLabel>{item.label}</DockLabel>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </DockItem>
          );
        })}

        {/* Theme toggle */}
        {onThemeToggle && (
          <DockItem
            className="cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
            onClick={onThemeToggle}
          >
            <DockIcon>
              <Palette className="w-5 h-5" strokeWidth={2} />
            </DockIcon>
            <DockLabel>Theme</DockLabel>
          </DockItem>
        )}
      </Dock>
    </div>
  );
}
