import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Activity, Users, Dumbbell, Clock, User, FileText } from "lucide-react";
import SessionTracker from "./session-tracker";
import NutritionTracking from "./nutrition-tracking";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  AnimatedButton,
  AnimatedCard,
  CollapsibleSection,
  StaggeredList,
  FadeIn,
  AddItemButton,
  ExpandableSection
} from "@/components/ui/animated-elements";
import { cn } from "@/lib/utils";

export default function PTpalDashboard() {
  const [sessionType, setSessionType] = useState("group");
  const [classType, setClassType] = useState("");
  const [participants, setParticipants] = useState("");
  const [stationRotation, setStationRotation] = useState(false);
  const [restBetweenStations, setRestBetweenStations] = useState(false);
  const { user } = useAuth();

  const { data: workoutPlans = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/workout-plans"],
  });

  const handleGeneratePlan = () => {
    // Implementation for generating workout plan based on form inputs
    console.log("Generating plan for:", {
      sessionType,
      classType,
      participants,
      stationRotation,
      restBetweenStations
    });
  };

  return (
    <motion.div 
      className="p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <FadeIn className="mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.fullName || user?.username}</h1>
        <p className="text-gray-500">Track your fitness journey and connect with your trainer</p>
      </FadeIn>

      <Tabs defaultValue="workoutPlans" className="mt-6">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="workoutPlans">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.03 }}>
              <Dumbbell className="h-4 w-4 mr-1" />
              Workout Plans
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="sessionTracking">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.03 }}>
              <Activity className="h-4 w-4 mr-1" />
              Session Tracking
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.03 }}>
              <Users className="h-4 w-4 mr-1" />
              Nutrition
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="clients">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.03 }}>
              <User className="h-4 w-4 mr-1" />
              Clients
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="documents">
            <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.03 }}>
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </motion.div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workoutPlans">
          <AnimatedCard className="mb-6" hover={false}>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Session Type</h2>
              <div className="flex gap-4 mt-2">
                <AnimatedButton
                  variant={sessionType === "group" ? "default" : "outline"}
                  onClick={() => setSessionType("group")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Group Class
                </AnimatedButton>
                <AnimatedButton
                  variant={sessionType === "personal" ? "default" : "outline"}
                  onClick={() => setSessionType("personal")}
                >
                  <User className="h-4 w-4 mr-1" />
                  Personal Training
                </AnimatedButton>
              </div>
            </CardContent>
          </AnimatedCard>

          {sessionType === "group" && (
            <AnimatedCard className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold">Group Class Setup</h2>
                <Select value={classType} onValueChange={setClassType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Class Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  placeholder="Number of Participants" 
                  className="mt-2" 
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  type="number"
                />
                
                <CollapsibleSection title="Circuit Preferences" defaultOpen={true} className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Station Rotation</span>
                      <Switch 
                        checked={stationRotation} 
                        onCheckedChange={setStationRotation} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rest Between Stations</span>
                      <Switch 
                        checked={restBetweenStations} 
                        onCheckedChange={setRestBetweenStations} 
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              </CardContent>
            </AnimatedCard>
          )}

          {sessionType === "personal" && (
            <AnimatedCard className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold">Personal Training Setup</h2>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client1">John Smith</SelectItem>
                    <SelectItem value="client2">Sarah Johnson</SelectItem>
                    <SelectItem value="client3">Michael Brown</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Focus Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                  </SelectContent>
                </Select>
                
                <ExpandableSection title="Session Details" defaultOpen={true} className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Include Assessments</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Equipment Required</span>
                      <Switch />
                    </div>
                  </div>
                </ExpandableSection>
              </CardContent>
            </AnimatedCard>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatedButton className="w-full" onClick={handleGeneratePlan}>
              <Plus className="mr-1 h-4 w-4" />
              Generate {sessionType === "group" ? "Group" : "Personal"} Plan
            </AnimatedButton>
          </motion.div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Workout Plans</h2>
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
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{plan.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(plan.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <AnimatedButton size="sm" variant="outline">View</AnimatedButton>
                      </div>
                    </CardContent>
                  </AnimatedCard>
                )}
              />
            ) : (
              <FadeIn delay={0.2}>
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-gray-500">No workout plans found.</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first plan above.</p>
                </div>
              </FadeIn>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="sessionTracking">
          <SessionTracker />
        </TabsContent>
        
        <TabsContent value="nutrition">
          <NutritionTracking />
        </TabsContent>
        
        <TabsContent value="clients">
          <AnimatedCard className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Client Management</h2>
              <div className="space-y-4">
                <FadeIn>
                  <div className="flex justify-between items-center">
                    <Input placeholder="Search clients..." className="max-w-md" />
                    <AnimatedButton>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Client
                    </AnimatedButton>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.1}>
                  <div className="mt-6 space-y-4">
                    {[1, 2, 3].map((client) => (
                      <AnimatedCard key={client} hover={true}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                JS
                              </div>
                              <div className="ml-4">
                                <h3 className="font-medium">John Smith</h3>
                                <p className="text-sm text-gray-500">Last session: 3 days ago</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AnimatedButton size="sm" variant="outline">View Profile</AnimatedButton>
                              <AnimatedButton size="sm" variant="outline">Message</AnimatedButton>
                            </div>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    ))}
                  </div>
                </FadeIn>
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Document Templates</h2>
                <div className="space-y-4">
                  <StaggeredList
                    items={[
                      { id: 1, name: "PAR-Q Form", type: "Assessment" },
                      { id: 2, name: "Client Consultation", type: "Onboarding" },
                      { id: 3, name: "Training Agreement", type: "Legal" },
                      { id: 4, name: "Session Plan Template", type: "Planning" }
                    ]}
                    className="space-y-3"
                    renderItem={(template: any) => (
                      <AnimatedCard key={template.id} hover={true}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{template.name}</h3>
                              <p className="text-sm text-gray-500">{template.type}</p>
                            </div>
                            <AnimatedButton size="sm" variant="outline">Use</AnimatedButton>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    )}
                  />
                  
                  <div className="pt-4">
                    <AnimatedButton className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Template
                    </AnimatedButton>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
            
            <AnimatedCard className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
                <div className="space-y-4">
                  <StaggeredList
                    items={[
                      { id: 1, name: "Fitness Assessment - Sarah Johnson", date: "12 March 2023" },
                      { id: 2, name: "Nutrition Plan - Mike Thompson", date: "10 March 2023" },
                      { id: 3, name: "Exercise Program - Emily Davis", date: "5 March 2023" }
                    ]}
                    className="space-y-3"
                    renderItem={(doc: any) => (
                      <AnimatedCard key={doc.id} hover={true}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{doc.name}</h3>
                              <p className="text-sm text-gray-500">Created: {doc.date}</p>
                            </div>
                            <div className="flex gap-2">
                              <AnimatedButton size="sm" variant="outline">View</AnimatedButton>
                              <AnimatedButton size="sm" variant="outline">Edit</AnimatedButton>
                            </div>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    )}
                  />
                </div>
              </CardContent>
            </AnimatedCard>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}