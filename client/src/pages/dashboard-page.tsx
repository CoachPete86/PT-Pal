import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UserPlus,
  BarChart,
  Users,
  Settings,
  Calendar,
  MessageSquare,
  FileText,
  Heart,
  Dumbbell,
  Trophy,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import PTpalDashboard from "@/components/ptpal-dashboard";
import { DashboardLayout } from "@/components/dashboard-layout";

interface SessionPackage {
  id: number;
  sessions: Array<{
    date: string;
    status: string;
  }>;
  paymentStatus: string;
  expiryDate: string;
}

interface WorkoutPlan {
  id: number;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  const { data: clients, isLoading: isLoadingClients } = useQuery<User[]>({
    queryKey: ["/api/clients"],
    enabled: user?.role === "trainer",
  });

  const { data: sessionPackages = [], isLoading: isLoadingPackages } = useQuery<
    SessionPackage[]
  >({
    queryKey: ["/api/session-packages"],
    enabled: user?.role === "trainer",
  });

  const { data: workoutPlans = [], isLoading: isLoadingPlans } = useQuery<
    WorkoutPlan[]
  >({
    queryKey: ["/api/workout-plans"],
    enabled: user?.role === "trainer",
  });

  const todaySessions = sessionPackages.filter((pkg) => {
    const today = new Date().toISOString().split("T")[0];
    return pkg.sessions?.some((session) => session.date.startsWith(today));
  });

  const activePrograms = workoutPlans.filter(
    (plan) => plan.status === "active",
  );

  const tabItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "clients", label: "Client Management", icon: Users },
    { id: "sessions", label: "Session Tracking", icon: Calendar },
    { id: "workouts", label: "Workout Plans", icon: Dumbbell },
    { id: "progress", label: "Progress Tracking", icon: Trophy },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "nutrition", label: "Nutrition", icon: Heart },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-centre justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex space-x-4">
            <Button
              className="flex items-centre space-x-2"
              aria-label="Add New Client"
            >
              <UserPlus /> <span>Add Client</span>
            </Button>
          </div>
        </div>

        {selectedTab === "workouts" ? (
          <PTpalDashboard />
        ) : (
          <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Today's Sessions</h2>
                  {isLoadingPackages ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-xl font-bold">
                      {todaySessions?.length || 0}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Active Programs</h2>
                  {isLoadingPlans ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-xl font-bold">
                      {activePrograms?.length || 0}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm border-red-200">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Payments Due</h2>
                  {isLoadingPackages ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-xl font-bold text-red-500">
                      {
                        sessionPackages.filter(
                          (pkg) => pkg.paymentStatus === "pending",
                        ).length
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm border-yellow-200">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Expiring Packages</h2>
                  {isLoadingPackages ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-xl font-bold text-amber-500">
                      {
                        sessionPackages.filter((pkg) => {
                          const thirtyDaysFromNow = new Date();
                          thirtyDaysFromNow.setDate(
                            thirtyDaysFromNow.getDate() + 30,
                          );
                          return new Date(pkg.expiryDate) <= thirtyDaysFromNow;
                        }).length
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm border-green-200">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Active Clients</h2>
                  {isLoadingClients ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-xl font-bold text-green-500">
                      {clients?.length || 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Client Management */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Client Management</h2>
                {isLoadingClients ? (
                  <p className="text-muted-foreground text-centre">Loading clients...</p>
                ) : clients && clients.length > 0 ? (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex justify-between items-centre p-3 border-b hover:bg-muted/50 transition rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">
                          {client.fullName || client.username}
                        </h3>
                        <p className="text-muted-foreground">{client.email}</p>
                        <Progress value={75} className="mt-2" />
                      </div>
                      <Button
                        variant="outline"
                        className="ml-4"
                      >
                        View Profile
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-centre">No clients found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
