import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, CalendarDays, TrendingUp, Clock, Dumbbell, DollarSign, BarChartBig, Star, Award, Mail, ImageIcon, Settings, Palette, Trophy, AlertCircle, Plus, ArrowUpRight, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import ClientEngagementHub from './client-engagement-hub';
import PersonalizedWorkoutGenerator from './personalized-workout-generator';
import WhiteLabelCustomization from './white-label-customization';

import { useQuery } from "@tanstack/react-query";

// Fetch actual session data from API
// Fetch session packages data
const { data: sessionPackages, isLoading: isLoadingPackages } = useQuery({
  queryKey: ["/api/session-packages"],
  retry: false,
});

const transformSessionData = (packages = []) => {
  // Default empty data structure for chart
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sessionData = defaultMonths.map(name => ({ 
    name, 
    personal: 0, 
    group: 0 
  }));
  
  // Process real session data if available
  if (packages.length > 0) {
    packages.forEach(pkg => {
      if (pkg.sessions) {
        pkg.sessions.forEach(session => {
          if (session.date) {
            const date = new Date(session.date);
            const monthIndex = date.getMonth();
            
            // Increment the appropriate session type
            if (session.type === 'personal') {
              sessionData[monthIndex].personal += 1;
            } else if (session.type === 'group') {
              sessionData[monthIndex].group += 1;
            }
          }
        });
      }
    });
  }
  
  return sessionData;
};

// Process session data for charts
const sessionData = transformSessionData(sessionPackages || []);
import { useQuery } from "@tanstack/react-query";

export default function PTpalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("week");
  
  // Fetch client data
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });
  
  // Fetch session packages
  const { data: sessionPackages = [] } = useQuery({
    queryKey: ["/api/session-packages"],
  });
  
  // Fetch workout plans
  const { data: workoutPlans = [] } = useQuery({
    queryKey: ["/api/workout-plans"],
  });

  // Render based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "personalized-workout":
        return <PersonalizedWorkoutGenerator />;
      case "engagement-hub":
        return <ClientEngagementHub />;
      case "white-label":
        return <WhiteLabelCustomization />;
      case "overview":
      default:
        return renderOverview();
    }
  };

  // Render the default dashboard overview
  const renderOverview = () => {
    // Calculate statistics from real data
    const totalClients = clients.length;
    
    // Calculate completed sessions
    const completedSessions = sessionPackages.reduce((total, pkg) => {
      return total + (pkg.sessions?.filter(s => s.status === "completed")?.length || 0);
    }, 0);
    
    // Calculate completion rate
    const totalScheduledSessions = sessionPackages.reduce((total, pkg) => {
      return total + (pkg.sessions?.length || 0);
    }, 0);
    const completionRate = totalScheduledSessions ? 
      Math.round((completedSessions / totalScheduledSessions) * 100) : 0;
    
    // Active workout plans
    const activePlans = workoutPlans.filter(plan => plan.status === "active").length;
    
    return (
      <div className="grid gap-4 md:gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UsersRound className="w-5 h-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">{totalClients || 0}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalClients ? `Managing ${totalClients} clients` : "No clients yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">{completedSessions}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completionRate}% completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">$3,240</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                <div className="text-2xl font-bold">92%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+2% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Session Overview Chart */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Sessions Overview</CardTitle>
              <CardDescription>Personal vs. Group sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPackages ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Clock className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sessionData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Bar dataKey="personal" name="Personal Sessions" fill="#5570f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="group" name="Group Classes" fill="#97a3ea" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue in USD</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Bar dataKey="revenue" fill="#1ad598" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </div>
                <Button size="sm">View Calendar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((session) => (
                  <div key={session} className="flex items-center p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Personal Training with Jane Smith</h4>
                      <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM - 11:00 AM</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button size="sm">Start</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 flex justify-between pt-3">
              <div className="text-sm text-muted-foreground">Showing 3 of 12 sessions</div>
              <Button variant="ghost" size="sm">
                See all <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Client Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Client Activity</CardTitle>
              <CardDescription>Client interactions and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((activity) => (
                  <div key={activity} className="flex p-3 border rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      {activity % 2 === 0 ? (
                        <Dumbbell className="h-4 w-4 text-primary" />
                      ) : (
                        <Award className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">
                        {activity % 2 === 0
                          ? "Mike Johnson completed his workout"
                          : "Sarah Williams achieved a milestone"}
                      </h4>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 flex justify-between pt-3">
              <div className="text-sm text-muted-foreground">Recent updates</div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("engagement-hub")}>
                <Mail className="mr-1 h-4 w-4" />
                Open Engagement Hub
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
              <CardDescription>Based on client attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Personal Training", value: "86%", icon: <Dumbbell className="h-4 w-4" /> },
                  { name: "HIIT Classes", value: "78%", icon: <BarChartBig className="h-4 w-4" /> },
                  { name: "Nutrition Coaching", value: "72%", icon: <Star className="h-4 w-4" /> },
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {service.icon}
                      </div>
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{service.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>AI Workout Generator</CardTitle>
              <CardDescription>Create personalized workouts for your clients</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Intelligent Workouts</h4>
                  <p className="text-xs text-muted-foreground">Based on client goals and history</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="border p-2 rounded-md text-center">
                  <p className="text-sm font-medium">17</p>
                  <p className="text-xs text-muted-foreground">Generated</p>
                </div>
                <div className="border p-2 rounded-md text-center">
                  <p className="text-sm font-medium">94%</p>
                  <p className="text-xs text-muted-foreground">Client Satisfaction</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <Button className="w-full" onClick={() => setActiveTab("personalized-workout")}>
                Create Workout
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Client Engagement Hub</CardTitle>
              <CardDescription>Connect with your clients</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Client Communication</h4>
                  <p className="text-xs text-muted-foreground">Messages, goals and progress tracking</p>
                </div>
              </div>
              <div className="border p-3 rounded-md mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">2 clients inactive</span>
                </div>
                <Button size="sm" variant="ghost">Check in</Button>
              </div>
              <div className="border p-3 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <span className="text-sm">5 goals achieved</span>
                </div>
                <Button size="sm" variant="ghost">Celebrate</Button>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <Button className="w-full" onClick={() => setActiveTab("engagement-hub")}>
                Open Hub
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>White Label Customization</CardTitle>
              <CardDescription>Personalize your brand experience</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Brand Customization</h4>
                  <p className="text-xs text-muted-foreground">Colors, logos and domain settings</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="h-6 rounded-md bg-blue-500"></div>
                <div className="h-6 rounded-md bg-green-500"></div>
                <div className="h-6 rounded-md bg-purple-500"></div>
                <div className="h-6 rounded-md bg-amber-500"></div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Branding completion:</p>
              <Progress value={60} className="h-2 mb-2" />
              <p className="text-xs text-right">60%</p>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <Button className="w-full" onClick={() => setActiveTab("white-label")}>
                Customize Brand
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Coach</h1>
          <p className="text-muted-foreground">Here's what's happening with your clients today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} className="w-[400px]">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
                Overview
              </TabsTrigger>
              <TabsTrigger value="personalized-workout" onClick={() => setActiveTab("personalized-workout")}>
                Workouts
              </TabsTrigger>
              <TabsTrigger value="engagement-hub" onClick={() => setActiveTab("engagement-hub")}>
                Engagement
              </TabsTrigger>
              <TabsTrigger value="white-label" onClick={() => setActiveTab("white-label")}>
                Branding
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}