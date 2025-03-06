import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Dumbbell, Heart, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DropdownNav } from "./ui/dropdown-nav";
import { useQuery } from "@tanstack/react-query";
import SessionTracker from "./session-tracker";
import NutritionTracking from "./nutrition-tracking";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, FileIcon, FileText } from "lucide-react";
import { StaggeredList, AnimatedCard, AnimatedButton, FadeIn } from "@/components/ui/animated-elements";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileIcon } from "lucide-react"; // Added import for FileIcon

export default function PTpalDashboard() {
  const [activeTab, setActiveTab] = useState("workoutPlans");
  const { user } = useAuth();

  const navOptions = [
    {
      id: "workoutPlans",
      label: "Workout Plans",
      icon: Dumbbell
    },
    {
      id: "sessionTracking",
      label: "Session Tracking",
      icon: Activity
    },
    {
      id: "nutrition",
      label: "Nutrition",
      icon: Heart
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users
    },
    {
      id: "documents",
      label: "Documents",
      icon: Users // Placeholder icon -  replace with appropriate icon
    }
  ];

  const { data: workoutPlans = [], isLoading } = useQuery({
    queryKey: ["/api/workout-plans"],
  });

  const renderContent = () => {
    switch (activeTab) {
      case "workoutPlans":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Workout Plans</CardTitle>
              <CardDescription>Create and manage your workout plans</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : workoutPlans && workoutPlans.length > 0 ? (
                <StaggeredList
                  items={workoutPlans}
                  className="grid gap-4"
                  renderItem={(plan: any) => (
                    <AnimatedCard key={plan.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h3 className="font-medium">{plan.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(plan.createdAt).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                          <AnimatedButton size="sm" variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">View</AnimatedButton>
                        </div>
                      </CardContent>
                    </AnimatedCard>
                  )}
                />
              ) : (
                <FadeIn delay={0.2}>
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Loader2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-gray-500">No workout plans found.</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first plan above.</p>
                  </div>
                </FadeIn>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">Create New Plan</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create Workout Plan</DialogTitle>
                    <DialogDescription>
                      Generate a personalized workout plan for your client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="planType">Plan Type</Label>
                        <Select defaultValue="oneoff">
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oneoff">Single Session</SelectItem>
                            <SelectItem value="program">Full Program</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sessionType">Session Type</Label>
                        <Select defaultValue="personal">
                          <SelectTrigger>
                            <SelectValue placeholder="Select session type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal Training</SelectItem>
                            <SelectItem value="group">Group Class</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fitnessLevel">Fitness Level</Label>
                        <Select defaultValue="intermediate">
                          <SelectTrigger>
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="classType">Class Type</Label>
                        <Select defaultValue="HIIT">
                          <SelectTrigger>
                            <SelectValue placeholder="Select class type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HIIT">HIIT</SelectItem>
                            <SelectItem value="BURN">BURN</SelectItem>
                            <SelectItem value="GLC">GLC</SelectItem>
                            <SelectItem value="LIFT">LIFT</SelectItem>
                            <SelectItem value="METCON">METCON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="clientDetails">Client Details/Requirements (Optional)</Label>
                      <Textarea 
                        id="clientDetails" 
                        className="min-h-[100px]" 
                        placeholder="Enter any client-specific details, goals, or limitations..."
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button>Cancel</Button>
                      <Button type="submit">Generate Workout Plan</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        );
      case "sessionTracking":
        return <SessionTracker />;
      case "nutrition":
        return <NutritionTracking />;
      case "clients":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Manage your client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Existing client management code would go here */}
            </CardContent>
          </Card>
        );
      case "documents":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Existing document management code would go here */}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.fullName || user?.username}</h1>
        <p className="text-gray-500">Track your fitness journey and connect with your trainer</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <DropdownNav
            options={navOptions}
            activeTab={activeTab}
            onSelect={setActiveTab}
            className="mb-6 md:mb-0 sticky top-20"
          />

          <Card className="mt-6 hidden md:block">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Active Clients</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Sessions This Week</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Revenue This Month</p>
                  <p className="text-2xl font-bold">$2,400</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-9">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}