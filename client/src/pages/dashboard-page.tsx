import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Bell, UserPlus, BarChart, Users, Settings, Calendar, MessageSquare, FileText, Heart, Dumbbell, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { Loader2 } from "lucide-react";
import PTpalDashboard from '@/components/ptpal-dashboard';

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
    queryKey: ['/api/clients'],
    enabled: user?.role === 'trainer',
  });

  const { data: sessionPackages = [], isLoading: isLoadingPackages } = useQuery<SessionPackage[]>({
    queryKey: ['/api/session-packages'],
    enabled: user?.role === 'trainer',
  });

  const { data: workoutPlans = [], isLoading: isLoadingPlans } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workout-plans'],
    enabled: user?.role === 'trainer',
  });

  const todaySessions = sessionPackages.filter(pkg => {
    const today = new Date().toISOString().split('T')[0];
    return pkg.sessions?.some(session => session.date.startsWith(today));
  });

  const activePrograms = workoutPlans.filter(plan => plan.status === 'active');

  const tabItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "clients", label: "Client Management", icon: Users },
    { id: "sessions", label: "Session Tracking", icon: Calendar },
    { id: "workouts", label: "Workout Plans", icon: Dumbbell },
    { id: "progress", label: "Progress Tracking", icon: Trophy },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "nutrition", label: "Nutrition", icon: Heart },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          {tabItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTab(item.id)}
              className={`flex items-center space-x-2 w-full p-2 rounded-lg transition-colors ${
                selectedTab === item.id ? 'bg-primary text-white' : 'hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-auto">
        {selectedTab === "workouts" ? (
          <PTpalDashboard />
        ) : (
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.fullName || user?.username} 👋</h1>
              <div className="flex space-x-4">
                <button aria-label='Search'><Search className='cursor-pointer' /></button>
                <button aria-label='Notifications'><Bell className='cursor-pointer' /></button>
                <Button className="flex items-center space-x-2" aria-label="Add New Client">
                  <UserPlus /> <span>Add Client</span>
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
              <Card className="shadow-lg border border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Today's Sessions</h2>
                  {isLoadingPackages ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-gray-700 text-xl">{todaySessions?.length || 0}</p>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-lg border border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Active Programs</h2>
                  {isLoadingPlans ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-gray-700 text-xl">{activePrograms?.length || 0}</p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-red-200 shadow-lg border border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Payments Due</h2>
                  {isLoadingPackages ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-gray-700 text-xl">
                      {sessionPackages.filter(pkg => pkg.paymentStatus === 'pending').length}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-yellow-200 shadow-lg border border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Expiring Packages</h2>
                  {isLoadingPackages ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-gray-700 text-xl">
                      {sessionPackages.filter(pkg => {
                        const thirtyDaysFromNow = new Date();
                        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                        return new Date(pkg.expiryDate) <= thirtyDaysFromNow;
                      }).length}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-green-200 shadow-lg border border-gray-300">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">Active Clients</h2>
                  {isLoadingClients ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <p className="text-gray-700 text-xl">{clients?.length || 0}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Client Management */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Client Management</h2>
              {isLoadingClients ? (
                <p className="text-gray-600 text-center">Loading clients...</p>
              ) : clients && clients.length > 0 ? (
                clients.map((client) => (
                  <div key={client.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-200 transition rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{client.fullName || client.username}</h3>
                      <p className="text-gray-600">{client.email}</p>
                      <Progress value={75} className="mt-2" />
                    </div>
                    <Button variant="outline" className="border-gray-600 text-gray-800 hover:bg-gray-300 transition">
                      View Profile
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">No clients found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}