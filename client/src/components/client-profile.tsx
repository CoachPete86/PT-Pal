import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, WorkoutPlan } from "@shared/schema";
import { Loader2, Mail, Phone, FileText, Activity, Target, Heart, Calendar, ChevronRight, Clipboard, Dumbbell, Plus, User as UserIcon, Info, Clock, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import WorkoutGenerator from "./workout-generator";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Label } from "./ui/label";

export default function ClientProfile({ clientId, onClose }: { clientId: number, onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);

  // Get client data
  const { data: client, isLoading: isLoadingClient } = useQuery<User>({
    queryKey: ["client", clientId],
    async queryFn() {
      const response = await apiRequest("GET", `/api/clients/${clientId}`);
      return response.json();
    },
  });

  // Get client's workout plans
  const { data: workoutPlans, isLoading: isLoadingPlans } = useQuery<WorkoutPlan[]>({
    queryKey: ["client-workout-plans", clientId],
    async queryFn() {
      const response = await apiRequest("GET", `/api/clients/${clientId}/workout-plans`);
      return response.json();
    },
  });

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Back to Client List
            </Button>
          )}
          <h2 className="text-3xl font-bold tracking-tight">{client.name || client.fullName || client.username}</h2>
        </div>
        <Button onClick={() => setShowWorkoutGenerator(true)}>Create Workout Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{client.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Member since {format(new Date(client.createdAt), "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Fitness Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {client.fitnessGoals ? (
              <ul className="list-disc pl-5 space-y-1">
                {client.fitnessGoals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No goals set</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Update Goals
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Session Packages</CardTitle>
          </CardHeader>
          <CardContent>
            {client.sessionPackages && client.sessionPackages.length > 0 ? (
              <div className="space-y-2">
                {client.sessionPackages.map((pkg, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.remainingSessions} / {pkg.totalSessions} sessions
                      </p>
                    </div>
                    <Badge>{pkg.paymentStatus}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No active packages</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Add Package
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-6">
        <DropdownNav 
          options={[
            { id: "overview", label: "Overview" },
            { id: "workout-plans", label: "Workout Plans" },
            { id: "progress", label: "Progress" },
            { id: "notes", label: "Notes" }
          ]}
          activeTab={activeTab}
          onSelect={setActiveTab}
          className="max-w-[300px]"
        />

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Progress Summary</CardTitle>
              <CardDescription>Overview of fitness metrics and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Workout Attendance</Label>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Goal Progress</Label>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Recent Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">92%</p>
                      <p className="text-xs text-muted-foreground">Assigned workouts</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workout-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Plans</CardTitle>
              <CardDescription>Assigned workouts and training programs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlans ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : workoutPlans && workoutPlans.length > 0 ? (
                <div className="space-y-4">
                  {workoutPlans.map((plan, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <Badge>{plan.type}</Badge>
                        </div>
                        <CardDescription>{format(new Date(plan.createdAt), "MMM d, yyyy")}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="line-clamp-2">{plan.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          View Plan
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12">
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No workout plans assigned yet</p>
                  <Button onClick={() => setShowWorkoutGenerator(true)}>
                    Create Workout Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>Body measurements and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No progress data recorded yet</p>
                <Button>Record Measurements</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
              <CardDescription>Records from past training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="note-1">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span>April 15, 2023</span>
                        <Badge className="ml-2" variant="outline">
                          HIIT Session
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p>Client completed full HIIT circuit. Showed improvement in squats form. Still working on proper plank position. Recommended focus on core strength for next session.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="note-2">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span>April 8, 2023</span>
                        <Badge className="ml-2" variant="outline">
                          Strength Training
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p>Focused on upper body. Increased bench press weight by 5kg. Client reported slight shoulder discomfort - adjusted form and monitored closely.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add New Note</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showWorkoutGenerator} onOpenChange={setShowWorkoutGenerator}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Workout Plan</DialogTitle>
            <DialogDescription>
              Generate a personalized workout plan for {client.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <WorkoutGenerator clientId={clientId} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}