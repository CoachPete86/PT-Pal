import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react";

// Transform session data function
const transformSessionData = (sessionPackages: any[] = []) => {
  // Process the data for charts
  const sessionData = {
    completedSessions: 0,
    totalRevenue: 0,
    activeClients: 0,
    upcomingSessions: 0,
    monthlyData: [],
    // Add other properties as needed
  };

  return sessionData;
};

export default function PTpalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch session packages data
  const { data: sessionPackages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ["/api/session-packages"],
    retry: false,
  });

  // Process session data for charts
  const sessionData = transformSessionData(sessionPackages || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Last 30 Days
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Sessions
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPackages ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    sessionData.completedSessions
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPackages ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `$${sessionData.totalRevenue}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Clients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPackages ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    sessionData.activeClients
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  +10% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Sessions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingPackages ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    sessionData.upcomingSessions
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Next 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {isLoadingPackages ? (
                  <div className="flex h-80 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    {/* Chart component would go here */}
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        Revenue and session charts by month
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest client sessions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPackages ? (
                  <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Session with Alex Morgan
                        </p>
                        <p className="text-sm text-muted-foreground">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New booking from Chris Evans
                        </p>
                        <p className="text-sm text-muted-foreground">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Payment received from Sarah Johnson
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Yesterday at 3:12 PM
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}