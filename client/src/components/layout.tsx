
import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Calendar, Settings, LogOut, BarChart, Dumbbell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return <>{children}</>;
  }
  
  const navItems = [
    { path: "/dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { path: "/clients", icon: <Users className="w-5 h-5" />, label: "Clients" },
    { path: "/calendar", icon: <Calendar className="w-5 h-5" />, label: "Calendar" },
    { path: "/analytics", icon: <BarChart className="w-5 h-5" />, label: "Analytics" },
    { path: "/workout-features", icon: <Dumbbell className="w-5 h-5" />, label: "Workout AI" },
    { path: "/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile navigation */}
      <div className="md:hidden border-b sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="font-semibold text-xl">Fitness Pro</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex overflow-x-auto p-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 min-w-[4rem] ${
                location.pathname === item.path 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 border-r shrink-0">
        <div className="p-4 border-b">
          <Link to="/" className="font-semibold text-xl">Fitness Pro</Link>
        </div>
        <div className="flex flex-col flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                location.pathname === item.path 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {user.fullName?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {user.fullName || "User"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4 md:p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
