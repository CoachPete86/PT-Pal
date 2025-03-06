
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircle, Dumbbell, BarChart, Heart, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  clientId: z.string().optional(),
  sessionType: z.enum(["personal", "group"]),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  focusAreas: z.array(z.string()).min(1, "Select at least one focus area"),
  preferredEquipment: z.array(z.string()).optional(),
  avoidedExercises: z.array(z.string()).optional(),
  pastWorkoutInfluence: z.number().min(0).max(100),
  intensityLevel: z.number().min(1).max(10),
  workoutDuration: z.number().min(15).max(120),
  includeWarmup: z.boolean().default(true),
  includeCooldown: z.boolean().default(true),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PersonalizedWorkoutGenerator() {
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionType: "personal",
      fitnessLevel: "intermediate",
      focusAreas: ["strength"],
      pastWorkoutInfluence: 50,
      intensityLevel: 7,
      workoutDuration: 45,
      includeWarmup: true,
      includeCooldown: true,
    },
  });

  // Fetch clients for the dropdown
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await axios.get("/api/clients");
      return response.data;
    },
  });

  // Fetch client workout history when a client is selected
  const selectedClientId = form.watch("clientId");
  const { data: clientWorkoutHistory } = useQuery({
    queryKey: ["clientWorkoutHistory", selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return null;
      const response = await axios.get(`/api/workout-plans?clientId=${selectedClientId}`);
      return response.data;
    },
    enabled: !!selectedClientId,
  });

  // Fetch client goals when a client is selected
  const { data: clientGoals } = useQuery({
    queryKey: ["clientGoals", selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return null;
      const response = await axios.get(`/api/client-goals/${selectedClientId}`);
      return response.data;
    },
    enabled: !!selectedClientId,
  });

  // Fetch client progress metrics when a client is selected
  const { data: clientMetrics } = useQuery({
    queryKey: ["clientMetrics", selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return null;
      const response = await axios.get(`/api/progress-metrics/${selectedClientId}`);
      return response.data;
    },
    enabled: !!selectedClientId,
  });

  const focusAreas = [
    { value: "strength", label: "Strength" },
    { value: "hypertrophy", label: "Muscle Growth" },
    { value: "endurance", label: "Endurance" },
    { value: "flexibility", label: "Flexibility" },
    { value: "core", label: "Core" },
    { value: "upper_body", label: "Upper Body" },
    { value: "lower_body", label: "Lower Body" },
    { value: "full_body", label: "Full Body" },
    { value: "cardio", label: "Cardiovascular" },
    { value: "hiit", label: "HIIT" },
  ];

  const equipment = [
    { value: "dumbbells", label: "Dumbbells" },
    { value: "kettlebells", label: "Kettlebells" },
    { value: "barbell", label: "Barbell" },
    { value: "resistance_bands", label: "Resistance Bands" },
    { value: "machines", label: "Machines" },
    { value: "bodyweight", label: "Bodyweight Only" },
    { value: "trx", label: "TRX/Suspension Trainer" },
    { value: "bench", label: "Bench" },
    { value: "box", label: "Plyo Box" },
    { value: "rowing_machine", label: "Rowing Machine" },
    { value: "bike", label: "Exercise Bike" },
    { value: "treadmill", label: "Treadmill" },
  ];

  const commonAvoidedExercises = [
    { value: "burpees", label: "Burpees" },
    { value: "pushups", label: "Push-ups" },
    { value: "pullups", label: "Pull-ups" },
    { value: "lunges", label: "Lunges" },
    { value: "deadlifts", label: "Deadlifts" },
    { value: "squats", label: "Squats" },
    { value: "overhead_press", label: "Overhead Press" },
    { value: "plank", label: "Planks" },
    { value: "running", label: "Running" },
    { value: "jumping", label: "Jumping Exercises" },
  ];

  async function onSubmit(data: FormValues) {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // Prepare data for API call with client context if available
      const apiData = {
        ...data,
        clientContext: selectedClientId ? {
          history: clientWorkoutHistory || [],
          goals: clientGoals || [],
          metrics: clientMetrics || []
        } : undefined
      };
      
      const response = await axios.post("/api/generate-personalized-workout", apiData);
      
      setGeneratedWorkout(response.data.plan);
    } catch (error) {
      console.error("Failed to generate workout:", error);
      setGenerationError("Failed to generate workout. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Personalized Workout Generator</h1>
          <p className="text-muted-foreground">
            Create customized workouts that adapt to client preferences, history, and fitness level.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Workout Parameters</CardTitle>
              <CardDescription>
                Configure the details for the personalized workout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No specific client</SelectItem>
                            {clients?.map((client: any) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecting a client will personalize the workout based on their history
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sessionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select session type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal Training</SelectItem>
                              <SelectItem value="group">Group Class</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fitnessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fitness level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="focusAreas"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Focus Areas</FormLabel>
                          <FormDescription>
                            Select one or more focus areas for this workout
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {focusAreas.map((area) => (
                            <FormField
                              key={area.value}
                              control={form.control}
                              name="focusAreas"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={area.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(area.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, area.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== area.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {area.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredEquipment"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred Equipment (Optional)</FormLabel>
                          <FormDescription>
                            Select equipment to prioritize in the workout
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {equipment.map((item) => (
                            <FormField
                              key={item.value}
                              control={form.control}
                              name="preferredEquipment"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], item.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avoidedExercises"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Exercises to Avoid (Optional)</FormLabel>
                          <FormDescription>
                            Select exercises to exclude from the workout
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {commonAvoidedExercises.map((item) => (
                            <FormField
                              key={item.value}
                              control={form.control}
                              name="avoidedExercises"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], item.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pastWorkoutInfluence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Workout Influence ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            max={100}
                            step={5}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          How much should past workouts influence this one
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="intensityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensity Level ({field.value}/10)</FormLabel>
                          <FormControl>
                            <Slider
                              defaultValue={[field.value]}
                              max={10}
                              min={1}
                              step={1}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workoutDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration ({field.value} mins)</FormLabel>
                          <FormControl>
                            <Slider
                              defaultValue={[field.value]}
                              max={120}
                              min={15}
                              step={5}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="includeWarmup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Warm-up</FormLabel>
                            <FormDescription>
                              Add warm-up exercises to the workout
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="includeCooldown"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Cool-down</FormLabel>
                            <FormDescription>
                              Add cool-down exercises to the workout
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional information or specific requests"
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Workout...
                      </>
                    ) : (
                      <>
                        <Dumbbell className="mr-2 h-4 w-4" />
                        Generate Personalized Workout
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {generationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{generationError}</AlertDescription>
              </Alert>
            )}

            {generatedWorkout ? (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{generatedWorkout.sessionDetails?.name || "Personalized Workout"}</CardTitle>
                      <CardDescription>
                        {generatedWorkout.sessionDetails?.type} • {generatedWorkout.sessionDetails?.duration} minutes • {generatedWorkout.sessionDetails?.fitnessLevel} level
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        <span>{generatedWorkout.sessionDetails?.focusArea}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-lg mb-2">Overview</h3>
                        <p className="text-muted-foreground">{generatedWorkout.introduction?.overview}</p>
                        
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Objectives:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {generatedWorkout.introduction?.objectives?.map((obj: string, i: number) => (
                              <li key={i} className="text-sm">{obj}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {generatedWorkout.warmup && generatedWorkout.warmup.length > 0 && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Warm-up</h3>
                          <div className="space-y-2">
                            {generatedWorkout.warmup.map((ex: any, i: number) => (
                              <div key={i} className="border rounded-md p-3">
                                <div className="flex justify-between">
                                  <p className="font-medium">{ex.exercise}</p>
                                  <p className="text-sm text-muted-foreground">{ex.duration}</p>
                                </div>
                                {ex.notes && <p className="text-sm mt-1">{ex.notes}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium text-lg mb-2">Main Workout</h3>
                        <div className="space-y-6">
                          {generatedWorkout.mainWorkout.map((circuit: any, i: number) => (
                            <div key={i} className="border rounded-md p-4">
                              <h4 className="font-medium text-base mb-1">Circuit {circuit.circuitNumber}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{circuit.explanation}</p>
                              
                              <div className="space-y-3 mt-4">
                                {circuit.exercises.map((ex: any, j: number) => (
                                  <div key={j} className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                      <p className="font-medium">{ex.exercise}</p>
                                      <div className="text-sm">
                                        <span className="bg-primary/10 text-primary rounded px-2 py-0.5">
                                          {ex.sets} × {ex.reps}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm mt-1">{ex.technique}</p>
                                    {ex.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 italic">{ex.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {generatedWorkout.cooldown && generatedWorkout.cooldown.length > 0 && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Cool-down</h3>
                          <div className="space-y-2">
                            {generatedWorkout.cooldown.map((ex: any, i: number) => (
                              <div key={i} className="border rounded-md p-3">
                                <div className="flex justify-between">
                                  <p className="font-medium">{ex.exercise}</p>
                                  <p className="text-sm text-muted-foreground">{ex.duration}</p>
                                </div>
                                <p className="text-sm mt-1">{ex.technique}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {generatedWorkout.recovery && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Recovery</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium">Immediate Steps:</p>
                              <ul className="list-disc list-inside">
                                {generatedWorkout.recovery.immediateSteps?.map((step: string, i: number) => (
                                  <li key={i} className="text-sm">{step}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Nutrition Tips:</p>
                              <ul className="list-disc list-inside">
                                {generatedWorkout.recovery.nutritionTips?.map((tip: string, i: number) => (
                                  <li key={i} className="text-sm">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
                    Save as Template
                  </Button>
                  <Button>
                    Assign to Client
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-muted/40">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mb-2">Generate a Workout</CardTitle>
                  <CardDescription className="max-w-sm mx-auto">
                    Fill out the form to create a personalized workout plan based on client history, preferences, and goals.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertCircle,
  Dumbbell,
  Loader2,
  Star,
  BarChart,
  Goal,
  Heart,
  ArrowDown,
  ArrowUp,
  User,
  Save,
  Download,
  Calendar,
  Clock,
  Tag,
  Activity,
  RotateCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  clientDetails: z.object({
    age: z.string().min(1, "Age is required"),
    gender: z.string().min(1, "Gender is required"),
    heightCm: z.string().optional(),
    weightKg: z.string().optional(),
    fitnessLevel: z.string().min(1, "Fitness level is required"),
    goals: z.array(z.string()).min(1, "At least one goal is required"),
    limitations: z.array(z.string()).optional(),
    preferences: z.array(z.string()).optional(),
  }),
  workoutParameters: z.object({
    duration: z.string().min(1, "Duration is required"),
    frequency: z.string().min(1, "Frequency is required"),
    intensity: z.string().min(1, "Intensity is required"),
    equipment: z.array(z.string()),
    location: z.string().min(1, "Location is required"),
    workoutType: z.string().min(1, "Workout type is required"),
  }),
  adaptiveSettings: z.object({
    progressionRate: z.string().min(1, "Progression rate is required"),
    adaptToPerformance: z.boolean(),
    autoAdjustDifficulty: z.boolean(),
    recoveryDays: z.string(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  alternatives: string[];
}

interface WorkoutPlan {
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: string;
  targetMuscleGroups: string[];
  equipment: string[];
  warmup: {
    duration: string;
    exercises: Array<{
      name: string;
      instructions: string;
      duration: string;
    }>;
  };
  exercises: Exercise[];
  cooldown: {
    duration: string;
    exercises: Array<{
      name: string;
      instructions: string;
      duration: string;
    }>;
  };
  progressionTips: string[];
  notes: string;
}

export default function PersonalizedWorkoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<WorkoutPlan[]>([]);
  const [activeTab, setActiveTab] = useState("builder");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientDetails: {
        age: "",
        gender: "",
        heightCm: "",
        weightKg: "",
        fitnessLevel: "intermediate",
        goals: [],
        limitations: [],
        preferences: [],
      },
      workoutParameters: {
        duration: "45",
        frequency: "3",
        intensity: "moderate",
        equipment: [],
        location: "gym",
        workoutType: "strength",
      },
      adaptiveSettings: {
        progressionRate: "moderate",
        adaptToPerformance: true,
        autoAdjustDifficulty: true,
        recoveryDays: "2",
      },
    },
  });

  const fitnessGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Strength",
    "Endurance",
    "Flexibility",
    "Balance",
    "Speed",
    "Power",
    "General Fitness",
    "Sport Specific",
  ];

  const physicalLimitations = [
    "Lower Back Pain",
    "Knee Issues",
    "Shoulder Pain",
    "Wrist/Hand Problems",
    "Hip Limitations",
    "Ankle Instability",
    "Neck Pain",
    "Balance Issues",
    "Breathing Difficulties",
    "Limited Mobility",
    "Other (Specify in Notes)",
  ];

  const exercisePreferences = [
    "Strength Training",
    "Cardio",
    "HIIT",
    "Circuit Training",
    "Functional Training",
    "Yoga/Pilates",
    "Bodyweight Exercises",
    "Machine Exercises",
    "Free Weights",
    "Sport Specific",
  ];

  const equipmentOptions = [
    "None (Bodyweight Only)",
    "Dumbbells",
    "Kettlebells",
    "Resistance Bands",
    "Barbell",
    "Pull-up Bar",
    "TRX/Suspension Trainer",
    "Medicine Ball",
    "Exercise Ball",
    "Machines",
    "Cable Machine",
    "Treadmill",
    "Stationary Bike",
    "Rowing Machine",
    "Elliptical",
  ];

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    setWorkoutPlan(null);

    try {
      const response = await axios.post("/api/generate-personalized-workout", {
        ...data,
      });

      if (response.data && response.data.plan) {
        setWorkoutPlan(response.data.plan);
        setGeneratedWorkouts((prev) => [...prev, response.data.plan]);
        setActiveTab("result");
        toast({
          title: "Workout Plan Generated",
          description: "Your personalized workout plan is ready!",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating workout:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          "There was an error generating your workout plan. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveWorkout = async () => {
    if (!workoutPlan) return;

    try {
      await axios.post("/api/documents", {
        title: workoutPlan.title,
        content: JSON.stringify(workoutPlan, null, 2),
        type: "workout_plan",
      });

      toast({
        title: "Workout Saved",
        description: "Your workout plan has been saved to your documents.",
      });
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save the workout plan. Please try again.",
      });
    }
  };

  const regenerateWorkout = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-bold">Personalized AI Workout Generator</h2>
        <p className="text-muted-foreground">
          Create custom AI-generated workouts tailored to specific needs and goals
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Workout Builder</TabsTrigger>
          <TabsTrigger value="result" disabled={!workoutPlan}>
            Generated Workout
          </TabsTrigger>
          <TabsTrigger value="history" disabled={generatedWorkouts.length === 0}>
            History ({generatedWorkouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Details
                  </CardTitle>
                  <CardDescription>
                    Enter client information to personalize the workout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientDetails.age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientDetails.gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientDetails.heightCm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="175" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientDetails.weightKg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="70" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientDetails.fitnessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fitness level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="athlete">Athlete</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="clientDetails.goals"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Fitness Goals</FormLabel>
                          <FormDescription>
                            Select all fitness goals that apply
                          </FormDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {fitnessGoals.map((goal) => (
                            <FormField
                              key={goal}
                              control={form.control}
                              name="clientDetails.goals"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(goal)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, goal])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== goal,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm cursor-pointer">
                                      {goal}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientDetails.limitations"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Physical Limitations</FormLabel>
                          <FormDescription>
                            Select any physical limitations to consider
                          </FormDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {physicalLimitations.map((limitation) => (
                            <FormField
                              key={limitation}
                              control={form.control}
                              name="clientDetails.limitations"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(limitation)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                limitation,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== limitation,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm cursor-pointer">
                                      {limitation}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientDetails.preferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Exercise Preferences</FormLabel>
                          <FormDescription>
                            Select preferred exercise types
                          </FormDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {exercisePreferences.map((preference) => (
                            <FormField
                              key={preference}
                              control={form.control}
                              name="clientDetails.preferences"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(preference)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                preference,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== preference,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm cursor-pointer">
                                      {preference}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Workout Parameters
                  </CardTitle>
                  <CardDescription>
                    Define the structure and requirements for the workout plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="workoutParameters.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">60 minutes</SelectItem>
                              <SelectItem value="90">90 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workoutParameters.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency (per week)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1x per week</SelectItem>
                              <SelectItem value="2">2x per week</SelectItem>
                              <SelectItem value="3">3x per week</SelectItem>
                              <SelectItem value="4">4x per week</SelectItem>
                              <SelectItem value="5">5x per week</SelectItem>
                              <SelectItem value="6">6x per week</SelectItem>
                              <SelectItem value="7">7x per week</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workoutParameters.intensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensity Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select intensity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="challenging">Challenging</SelectItem>
                              <SelectItem value="intense">Intense</SelectItem>
                              <SelectItem value="maximum">Maximum</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="workoutParameters.equipment"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Available Equipment</FormLabel>
                          <FormDescription>
                            Select all equipment that is available
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {equipmentOptions.map((equipment) => (
                            <FormField
                              key={equipment}
                              control={form.control}
                              name="workoutParameters.equipment"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(equipment)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                equipment,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== equipment,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm cursor-pointer">
                                      {equipment}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="workoutParameters.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="gym">Gym</SelectItem>
                              <SelectItem value="outdoors">Outdoors</SelectItem>
                              <SelectItem value="hotel">Hotel/Travel</SelectItem>
                              <SelectItem value="anywhere">Anywhere</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workoutParameters.workoutType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select workout type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strength">Strength Training</SelectItem>
                              <SelectItem value="hiit">HIIT</SelectItem>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="circuit">Circuit Training</SelectItem>
                              <SelectItem value="flexibility">
                                Flexibility/Mobility
                              </SelectItem>
                              <SelectItem value="mixed">Mixed/Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Adaptive Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how the workout adapts to client progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adaptiveSettings.progressionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Progression Rate</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select progression rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="conservative">
                                Conservative (Slow)
                              </SelectItem>
                              <SelectItem value="moderate">
                                Moderate (Standard)
                              </SelectItem>
                              <SelectItem value="aggressive">
                                Aggressive (Fast)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How quickly to increase difficulty over time
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adaptiveSettings.recoveryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recovery Days Between Workouts</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recovery days" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0 (Daily Training)</SelectItem>
                              <SelectItem value="1">1 Day</SelectItem>
                              <SelectItem value="2">2 Days</SelectItem>
                              <SelectItem value="3">3+ Days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Recommended rest between similar workouts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="adaptiveSettings.adaptToPerformance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Adapt to Performance</FormLabel>
                            <FormDescription>
                              Adjust future workouts based on completed workout data
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adaptiveSettings.autoAdjustDifficulty"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Auto-Adjust Difficulty</FormLabel>
                            <FormDescription>
                              Provide easier and harder variations for each exercise
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Personalized Workout...
                  </>
                ) : (
                  <>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Generate Personalized Workout
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="result">
          {workoutPlan ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{workoutPlan.title}</h2>
                  <p className="text-muted-foreground">{workoutPlan.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateWorkout}
                    className="flex items-center gap-1"
                  >
                    <RotateCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={saveWorkout}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {workoutPlan.durationMinutes} min
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold capitalize">
                      {workoutPlan.difficulty}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Target Muscles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {workoutPlan.targetMuscleGroups.map((muscle, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs rounded-full"
                        >
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workoutPlan.equipment.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Warm-Up</CardTitle>
                    <CardDescription>
                      {workoutPlan.warmup.duration} - Prepare your body for the workout
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workoutPlan.warmup.exercises.map((exercise, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 border rounded-lg">
                          <div className="bg-primary/10 text-primary p-2 rounded-full">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.duration}
                            </p>
                            <p className="text-sm mt-1">{exercise.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Main Workout</CardTitle>
                    <CardDescription>
                      Complete all exercises as described
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {workoutPlan.exercises.map((exercise, i) => (
                        <div
                          key={i}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">{exercise.name}</h3>
                            <Badge variant="secondary">
                              {exercise.sets} × {exercise.reps}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Rest: {exercise.rest}
                          </p>

                          <p>{exercise.notes}</p>

                          {exercise.alternatives && exercise.alternatives.length > 0 && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium">Alternatives:</h4>
                              <ul className="list-disc list-inside text-sm mt-1">
                                {exercise.alternatives.map((alt, j) => (
                                  <li key={j}>{alt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cool Down</CardTitle>
                    <CardDescription>
                      {workoutPlan.cooldown.duration} - Recover and reduce muscle soreness
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workoutPlan.cooldown.exercises.map((exercise, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 border rounded-lg">
                          <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-full">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exercise.duration}
                            </p>
                            <p className="text-sm mt-1">{exercise.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progression Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {workoutPlan.progressionTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {workoutPlan.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{workoutPlan.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="space-y-4 text-center">
                <Dumbbell className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                <h3 className="text-lg font-medium">No Workout Generated Yet</h3>
                <p className="text-muted-foreground">
                  Complete the form to generate a personalized workout plan
                </p>
                <Button onClick={() => setActiveTab("builder")}>
                  Go to Workout Builder
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Previously Generated Workouts</h3>
            
            <div className="space-y-4">
              {generatedWorkouts.map((workout, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{workout.title}</span>
                      <Badge
                        variant="secondary"
                        className="capitalize"
                      >
                        {workout.difficulty}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{workout.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {workout.targetMuscleGroups.map((muscle, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs"
                        >
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{workout.durationMinutes} minutes</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 pt-2">
                    <Button 
                      variant="ghost" 
                      className="w-full text-sm h-8"
                      onClick={() => {
                        setWorkoutPlan(workout);
                        setActiveTab("result");
                      }}
                    >
                      View Workout
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
