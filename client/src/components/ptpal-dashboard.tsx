import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import SessionTracker from "./session-tracker";
import NutritionTracking from "./nutrition-tracking";
import { useAuth } from "@/hooks/use-auth";

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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Welcome, {user?.fullName || user?.username}</h1>
      <p className="text-gray-500">Track your fitness journey and connect with your trainer</p>

      <Tabs defaultValue="workoutPlans" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="workoutPlans">Workout Plans</TabsTrigger>
          <TabsTrigger value="sessionTracking">Session Tracking</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workoutPlans">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Session Type</h2>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={sessionType === "group" ? "default" : "outline"}
                  onClick={() => setSessionType("group")}
                >
                  Group Class
                </Button>
                <Button
                  variant={sessionType === "personal" ? "default" : "outline"}
                  onClick={() => setSessionType("personal")}
                >
                  Personal Training
                </Button>
              </div>
            </CardContent>
          </Card>

          {sessionType === "group" && (
            <Card className="mb-6">
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
                
                <h3 className="text-md font-semibold mt-4">Circuit Preferences</h3>
                <div className="flex items-center justify-between mt-2">
                  <span>Station Rotation</span>
                  <Switch 
                    checked={stationRotation} 
                    onCheckedChange={setStationRotation} 
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Rest Between Stations</span>
                  <Switch 
                    checked={restBetweenStations} 
                    onCheckedChange={setRestBetweenStations} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {sessionType === "personal" && (
            <Card className="mb-6">
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
                
                <h3 className="text-md font-semibold mt-4">Session Details</h3>
                <div className="flex items-center justify-between mt-2">
                  <span>Include Assessments</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Equipment Required</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          )}

          <Button className="w-full" onClick={handleGeneratePlan}>
            Generate {sessionType === "group" ? "Group" : "Personal"} Plan
          </Button>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Workout Plans</h2>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : workoutPlans && workoutPlans.length > 0 ? (
              <div className="grid gap-4">
                {workoutPlans.map((plan: any) => (
                  <Card key={plan.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{plan.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(plan.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No workout plans found. Create your first plan above.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="sessionTracking">
          <SessionTracker />
        </TabsContent>
        
        <TabsContent value="nutrition">
          <NutritionTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
}