
import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Users,
  Calendar,
  Dumbbell,
  Trophy,
  MessageSquare,
  TrendingUp,
  Clock,
  Calendar as CalendarIcon,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const StatCard = ({ icon: Icon, title, value, trend, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-md bg-${color}-100`}>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
        {trend > 0 ? "+" : ""}{trend}% from last month
      </p>
    </CardContent>
  </Card>
);

const UpcomingSession = ({ client, time, type, duration }) => (
  <div className="flex items-center space-x-4 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
    <Avatar className="h-10 w-10">
      <AvatarImage src="" />
      <AvatarFallback className="bg-primary/10 text-primary">{client[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <h4 className="text-sm font-medium">{client}</h4>
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="mr-1 h-3 w-3" /> {time} • {duration}
      </div>
    </div>
    <div className="flex items-center">
      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
        {type}
      </span>
    </div>
  </div>
);

const ClientProgressCard = ({ client, progress, lastSession, nextSession }) => (
  <div className="flex items-center space-x-4 p-4 rounded-lg border">
    <Avatar className="h-12 w-12">
      <AvatarImage src="" />
      <AvatarFallback className="bg-primary/10 text-primary">{client[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1">
      <div className="flex justify-between">
        <h4 className="font-medium">{client}</h4>
        <span className="text-sm text-muted-foreground">Goal Progress</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Last: {lastSession}</span>
        <span>Next: {nextSession}</span>
      </div>
    </div>
  </div>
);

export default function PTpalDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Here's what's happening with your coaching business today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex gap-2">
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
          <Button className="flex gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeInUp}>
          <StatCard 
            icon={Users} 
            title="Total Clients" 
            value="24" 
            trend={12} 
            color="blue" 
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            icon={Calendar} 
            title="Sessions This Week" 
            value="18" 
            trend={5} 
            color="green" 
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            icon={TrendingUp} 
            title="Monthly Revenue" 
            value="£4,250" 
            trend={8} 
            color="indigo" 
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            icon={Trophy} 
            title="Client Milestones" 
            value="7" 
            trend={-3} 
            color="amber" 
          />
        </motion.div>
      </motion.div>

      {/* Today's Sessions */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Sessions</CardTitle>
                  <CardDescription>
                    You have 3 upcoming sessions today
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>View All</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <UpcomingSession
                client="Sarah Johnson"
                time="10:00 AM"
                type="Strength"
                duration="60 min"
              />
              <UpcomingSession
                client="Mark Davis"
                time="1:15 PM"
                type="HIIT"
                duration="45 min"
              />
              <UpcomingSession
                client="Emma Wilson"
                time="5:30 PM"
                type="Mobility"
                duration="30 min"
              />
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button variant="ghost" className="w-full justify-between">
                <span>Schedule a new session</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Workout Builder</CardTitle>
              <CardDescription>
                Create or modify workouts on the go
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-md bg-accent/40">
                  <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Strength</span>
                </div>
                <div className="flex items-center p-2 rounded-md">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  <span className="text-sm">Cardio</span>
                </div>
                <div className="flex items-center p-2 rounded-md">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  <span className="text-sm">Mobility</span>
                </div>
                <div className="flex items-center p-2 rounded-md">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  <span className="text-sm">Group Class</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button className="w-full">Build New Workout</Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Client Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Client Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your clients' progression towards their goals
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All Clients
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <ClientProgressCard
                client="James Wilson"
                progress={78}
                lastSession="Oct 12"
                nextSession="Oct 19"
              />
              <ClientProgressCard
                client="Lisa Chen"
                progress={45}
                lastSession="Oct 10"
                nextSession="Oct 17"
              />
              <ClientProgressCard
                client="Michael Brown"
                progress={92}
                lastSession="Oct 14"
                nextSession="Oct 21"
              />
              <ClientProgressCard
                client="Emily Davis"
                progress={34}
                lastSession="Oct 13"
                nextSession="Oct 20"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Dumbbell, Heart, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { DropdownNav } from "./ui/dropdown-nav";
import { useQuery } from "@tanstack/react-query";
import SessionTracker from "./session-tracker";
import NutritionTracking from "./nutrition-tracking";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, FileIcon, FileText } from "lucide-react";
import {
  StaggeredList,
  AnimatedCard,
  AnimatedButton,
  FadeIn,
} from "@/components/ui/animated-elements";
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
// FileIcon is likely already imported elsewhere in this file

export default function PTpalDashboard() {
  const [activeTab, setActiveTab] = useState("workoutPlans");
  const { user } = useAuth();

  const navOptions = [
    {
      id: "workoutPlans",
      label: "Workout Plans",
      icon: Dumbbell,
    },
    {
      id: "sessionTracking",
      label: "Session Tracking",
      icon: Activity,
    },
    {
      id: "nutrition",
      label: "Nutrition",
      icon: Heart,
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
    },
    {
      id: "documents",
      label: "Documents",
      icon: Users, // Placeholder icon -  replace with appropriate icon
    },
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
              <CardDescription>
                Create and manage your workout plans
              </CardDescription>
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
                              {new Date(plan.createdAt).toLocaleDateString(
                                "en-GB",
                              )}
                            </p>
                          </div>
                          <AnimatedButton
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                          >
                            View
                          </AnimatedButton>
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
                    <p className="text-sm text-gray-400 mt-1">
                      Create your first plan above.
                    </p>
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
                            <SelectItem value="oneoff">
                              Single Session
                            </SelectItem>
                            <SelectItem value="program">
                              Full Program
                            </SelectItem>
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
                            <SelectItem value="personal">
                              Personal Training
                            </SelectItem>
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
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
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
                      <Label htmlFor="clientDetails">
                        Client Details/Requirements (Optional)
                      </Label>
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
              <CardDescription>
                Manage your client relationships
              </CardDescription>
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
        <h1 className="text-3xl font-bold">
          Welcome, {user?.fullName || user?.username}
        </h1>
        <p className="text-gray-500">
          Track your fitness journey and connect with your trainer
        </p>
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
