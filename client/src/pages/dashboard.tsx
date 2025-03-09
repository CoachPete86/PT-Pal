import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Home,
  Users,
  Calendar,
  Dumbbell,
  Trophy,
  MessageSquare,
  Heart,
  FileText,
  Settings,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import ClientManagement from "@/components/client-management";
import ClientProfile from "@/components/client-profile";
import PTpalDashboard from "@/components/ptpal-dashboard";
import PersonalizedWorkoutGenerator from "@/components/personalized-workout-generator";
import SmartScheduling from "@/components/smart-scheduling";
import ClientAssessmentTools from "@/components/client-assessment-tools";
import WhiteLabelCustomization from "@/components/white-label-customization";
import ClientEngagementHub from "@/components/client-engagement-hub";
// Remove BusinessInsightsDashboard import as it's handled with a Card now

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      children: [],
    },
    {
      id: "clients",
      label: "Client Management",
      icon: Users,
      children: [
        { id: "client-list", label: "Client List" },
        { id: "add-client", label: "Add New Client" },
        { id: "client-groups", label: "Client Groups" },
        { id: "client-engagement", label: "Engagement Hub" },
      ],
    },
    {
      id: "sessions",
      label: "Session Tracking",
      icon: Calendar,
      children: [
        { id: "session-calendar", label: "Calendar" },
        { id: "session-history", label: "Session History" },
        { id: "create-session", label: "Create Session" },
        { id: "smart-scheduling", label: "Smart Scheduling" },
      ],
    },
    {
      id: "workouts",
      label: "Workout Plans",
      icon: Dumbbell,
      children: [
        { id: "workout-templates", label: "Templates" },
        { id: "create-workout", label: "Create Workout" },
        { id: "personalized-workout", label: "Personalized Generator" },
      ],
    },
    {
      id: "nutrition",
      label: "Nutrition",
      icon: Heart,
      children: [
        { id: "meal-plans", label: "Meal Plans" },
        { id: "nutrition-tracking", label: "Tracking" },
      ],
    },
    {
      id: "progress",
      label: "Progress Tracking",
      icon: Trophy,
      children: [
        { id: "client-assessment", label: "Assessment Tools" },
        { id: "progress-charts", label: "Progress Charts" },
      ],
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      children: [],
    },
    {
      id: "business",
      label: "Business Insights",
      icon: BarChart,
      children: [],
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      children: [],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      children: [
        { id: "white-label", label: "White Label" },
        { id: "account-settings", label: "Account" },
        { id: "integrations", label: "Integrations" },
      ],
    },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <PTpalDashboard />;
      case "personalized-workout":
        return <PersonalizedWorkoutGenerator />;
      case "smart-scheduling":
        return <SmartScheduling />;
      case "client-assessment":
        return <ClientAssessmentTools />;
      case "white-label":
        return <WhiteLabelCustomization />;
      case "client-engagement":
        return <ClientEngagementHub />;
      case "business":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
              <CardDescription>
                View your business performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                Business analytics functionality coming soon.
              </p>
            </CardContent>
          </Card>
        );
      case "clients":
        return selectedClientId ? (
          <ClientProfile
            clientId={selectedClientId}
            onClose={() => setSelectedClientId(null)}
          />
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>
                    Manage your client relationships and track their progress
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Add New Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Enter the client's details below
                      </DialogDescription>
                    </DialogHeader>
                    <ClientManagement />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((id) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <h3 className="font-medium">Client {id}</h3>
                        <p className="text-sm text-muted-foreground">
                          client{id}@example.com
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedClientId(id)}
                      >
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-[70vh]">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  This feature is currently under development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center mb-4">
                  We're working hard to bring you this functionality soon.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setSelectedTab("dashboard")}
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            {navItems.find((item) => item.id === selectedTab)?.label || "Dashboard"}
          </h2>
          {selectedTab === "clients" && !selectedClientId && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Add New Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>
                    Enter the client's details below
                  </DialogDescription>
                </DialogHeader>
                <ClientManagement />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
