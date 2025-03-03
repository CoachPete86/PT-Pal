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

interface ClientProfileProps {
  clientId: number;
  onClose: () => void;
}

export default function ClientProfile({ clientId, onClose }: ClientProfileProps) {
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: client, isLoading } = useQuery<User>({
    queryKey: ['/api/clients', clientId],
  });

  const { data: fitnessJourney = [], isLoading: isLoadingJourney } = useQuery({
    queryKey: ['/api/fitness-journey', clientId],
    enabled: !!clientId,
  });

  const { data: workoutPlans = [], isLoading: isLoadingPlans } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workout-plans', clientId],
    enabled: !!clientId,
  });

  const exportPdfMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      setIsExporting(true);
      window.open(`/api/workout-plan/${workoutId}/export-pdf`, '_blank');
      return true;
    },
    onSuccess: () => {
      setIsExporting(false);
      toast({
        title: "Export Started",
        description: "Your PDF is being generated and will download automatically.",
      });
    },
    onError: (error: Error) => {
      setIsExporting(false);
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center p-8">
        <p>Client not found</p>
        <Button onClick={onClose} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Helper function to calculate BMI
  const calculateBMI = () => {
    if (!client?.preferences?.height || !client?.preferences?.weight) return null;
    const height = Number(client.preferences.height) / 100; // convert cm to meters
    const weight = Number(client.preferences.weight);
    const bmi = weight / (height * height);
    return bmi.toFixed(1);
  };

  // Helper function to get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { category: "Normal", color: "text-green-500" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
    return { category: "Obese", color: "text-red-500" };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(Number(bmi)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{client.fullName}</h2>
          <p className="text-muted-foreground">Client Profile</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showWorkoutGenerator} onOpenChange={setShowWorkoutGenerator}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workout Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Workout Plan for {client.fullName}</DialogTitle>
                <DialogDescription>
                  Create a customized workout plan for this client based on their profile information.
                </DialogDescription>
              </DialogHeader>
              <WorkoutGenerator clientId={clientId} onComplete={() => setShowWorkoutGenerator(false)} />
            </DialogContent>
          </Dialog>
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </div>

      {/* Client Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Section */}
              <div className="space-y-4">
                <h3 className="font-medium">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                  {client.preferences?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.preferences.phone}</span>
                    </div>
                  )}
                  {client.preferences?.emergencyContact && (
                    <div className="flex flex-col gap-1 mt-4">
                      <span className="text-sm text-muted-foreground">Emergency Contact:</span>
                      <span>{client.preferences.emergencyContact}</span>
                      {client.preferences?.emergencyPhone && (
                        <span>{client.preferences.emergencyPhone}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="ml-2" variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status || 'Active'}
                    </Badge>
                  </div>
                  {client.preferences?.gender && (
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-2">{
                        client.preferences.gender === 'prefer-not-to-say' 
                          ? 'Prefer not to say' 
                          : client.preferences.gender
                      }</span>
                    </div>
                  )}
                  {client.preferences?.birthdate && (
                    <div>
                      <span className="text-muted-foreground">Birth Date:</span>
                      <span className="ml-2">{new Date(client.preferences.birthdate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Fitness Level:</span>
                    <span className="ml-2">{client.preferences?.fitnessLevel || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Program Progress</span>
                  <span className="text-sm text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xl font-bold text-primary">{workoutPlans.filter(p => p.status === 'active').length}</div>
                  <div className="text-xs text-muted-foreground">Active Programs</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">12</div>
                  <div className="text-xs text-muted-foreground">Sessions Completed</div>
                </div>
                {bmi && (
                  <div className="col-span-2">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">BMI:</div>
                      <div className={`text-sm font-medium ${bmiCategory?.color}`}>
                        {bmi} - {bmiCategory?.category}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="physical">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="physical">Physical Info</TabsTrigger>
          <TabsTrigger value="fitness">Fitness Profile</TabsTrigger>
          <TabsTrigger value="health">Health Info</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="workout-plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="journey">Fitness Journey</TabsTrigger>
        </TabsList>

        {/* Physical Information Tab */}
        <TabsContent value="physical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Physical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Height</div>
                  <div className="text-xl font-bold">{client.preferences?.height ? `${client.preferences.height} cm` : 'N/A'}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="text-xl font-bold">{client.preferences?.weight ? `${client.preferences.weight} kg` : 'N/A'}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Body Fat</div>
                  <div className="text-xl font-bold">{client.preferences?.bodyFatPercentage ? `${client.preferences.bodyFatPercentage}%` : 'N/A'}</div>
                </div>
              </div>

              {bmi && (
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">BMI Calculation</div>
                    <div className={`text-sm font-medium ${bmiCategory?.color}`}>
                      {bmi} - {bmiCategory?.category}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Based on height ({client.preferences?.height} cm) and weight ({client.preferences?.weight} kg)
                  </div>

                  <div className="w-full h-4 bg-gray-200 rounded-full mt-4 overflow-hidden">
                    <div className="flex h-full">
                      <div className="bg-blue-500 h-full" style={{ width: '18.5%' }}></div>
                      <div className="bg-green-500 h-full" style={{ width: '6.5%' }}></div>
                      <div className="bg-yellow-500 h-full" style={{ width: '5%' }}></div>
                      <div className="bg-red-500 h-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Underweight<br />&lt;18.5</span>
                    <span>Normal<br />18.5-25</span>
                    <span>Overweight<br />25-30</span>
                    <span>Obese<br />&gt;30</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fitness Profile Tab */}
        <TabsContent value="fitness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Fitness Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Fitness Level</h3>
                  <Badge className="capitalize">
                    {client.preferences?.fitnessLevel || 'Not specified'}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Fitness Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.preferences?.fitnessGoals && client.preferences.fitnessGoals.length > 0 ? (
                      client.preferences.fitnessGoals.map((goal: string, index: number) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {goal.replace(/-/g, ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No goals specified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Preferred Workout Times</h3>
                <div className="flex flex-wrap gap-2">
                  {client.preferences?.preferredWorkoutTimes && client.preferences.preferredWorkoutTimes.length > 0 ? (
                    client.preferences.preferredWorkoutTimes.map((time: string, index: number) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {time.replace(/-/g, ' ')}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No preferred times specified</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Available Days</h3>
                <div className="flex flex-wrap gap-2">
                  {client.preferences?.availableDays && client.preferences.availableDays.length > 0 ? (
                    client.preferences.availableDays.map((day: string, index: number) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {day}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No available days specified</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Previous Exercise Experience</h3>
                <p className="text-sm">
                  {client.preferences?.previousExperience || 'No information provided'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Preferred Activities</h3>
                  {client.preferences?.preferredActivities && client.preferences.preferredActivities.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm">
                      {client.preferences.preferredActivities.map((activity: string, index: number) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">No preferred activities specified</span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Disliked Exercises</h3>
                  {client.preferences?.dislikedExercises && client.preferences.dislikedExercises.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm">
                      {client.preferences.dislikedExercises.map((exercise: string, index: number) => (
                        <li key={index}>{exercise}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">No disliked exercises specified</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Information Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Medical Conditions</Label>
                  <p className="text-sm mt-1">
                    {client.preferences?.medicalConditions || 'No medical conditions reported'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Injuries/Physical Limitations</Label>
                  <p className="text-sm mt-1">
                    {client.preferences?.injuries || 'No injuries reported'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Medications</Label>
                  <p className="text-sm mt-1">
                    {client.preferences?.medications || 'No medications reported'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Allergies</Label>
                  <p className="text-sm mt-1">
                    {client.preferences?.allergies || 'No allergies reported'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Initial Assessment Status</Label>
                  <div className="mt-1">
                    <Badge variant={client.preferences?.hasInitialAssessment ? "default" : "outline"}>
                      {client.preferences?.hasInitialAssessment ? "Completed" : "Not Completed"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Nutrition Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {client.preferences?.dietaryRestrictions && client.preferences.dietaryRestrictions.length > 0 ? (
                      client.preferences.dietaryRestrictions.map((diet: string, index: number) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {diet.replace(/-/g, ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No dietary restrictions</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Meals Per Day</Label>
                    <p className="text-sm mt-1">
                      {client.preferences?.mealsPerDay || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Water Intake</Label>
                    <p className="text-sm capitalize">
                      {client.preferences?.waterIntake ? client.preferences.waterIntake.replace(/-/g, ' ') : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Supplements Used</Label>
                  <p className="text-sm mt-1">
                    {client.preferences?.supplementsUsed || 'No supplements reported'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workout Plans Tab */}
        <TabsContent value="workout-plans" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Workout Plans
              </CardTitle>
              <Dialog open={showWorkoutGenerator} onOpenChange={setShowWorkoutGenerator}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Workout Plan for {client.fullName}</DialogTitle>
                    <DialogDescription>
                      Create a customized workout plan for this client based on their profile information.
                    </DialogDescription>
                  </DialogHeader>
                  <WorkoutGenerator clientId={clientId} onComplete={() => setShowWorkoutGenerator(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : workoutPlans.length > 0 ? (
                <div className="space-y-4">
                  {workoutPlans.map((plan) => (
                    <Card key={plan.id} className="overflow-hidden">
                      <div className={`h-1 w-full ${
                        plan.status === 'active' ? 'bg-green-500' : 
                        plan.status === 'completed' ? 'bg-blue-500' : 
                        plan.status === 'archived' ? 'bg-gray-500' : 'bg-yellow-500'
                      }`}></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{plan.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {plan.startDate && plan.endDate ? (
                                <>
                                  {format(new Date(plan.startDate), 'MMM d, yyyy')} 
                                  <ArrowRight className="inline h-3 w-3 mx-1" /> 
                                  {format(new Date(plan.endDate), 'MMM d, yyyy')}
                                </>
                              ) : 'No dates specified'}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              plan.status === 'active' ? 'default' : 
                              plan.status === 'completed' ? 'secondary' : 
                              'outline'
                            }
                            className="capitalize"
                          >
                            {plan.status}
                          </Badge>
                        </div>

                        {plan.description && (
                          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                        )}

                        <div className="flex justify-end mt-4 gap-2">
                          <Button variant="outline" size="sm" onClick={() => exportPdfMutation.mutate(plan.id)} disabled={isExporting}>
                            {isExporting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                Export PDF
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Info className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No workout plans found. Create a plan for this client to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fitness Journey Tab */}
        <TabsContent value="journey">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Fitness Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingJourney ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : fitnessJourney.length > 0 ? (
                <div className="space-y-4">
                  {fitnessJourney.map((entry: any) => (
                    <div key={entry.id} className="border-b pb-4">
                      <div className="flex justify-between">
                        <div className="font-medium">{entry.title}</div>
                        <Badge variant="outline" className="capitalize">{entry.category}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </div>
                      <p className="mt-2 text-sm">{entry.description}</p>
                      {entry.value && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Measurement:</span> {entry.value} {entry.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No journey entries yet. Start tracking this client's fitness journey.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}