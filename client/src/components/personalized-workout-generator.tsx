import React, { useState } from "react";
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
                            Select exercises that should be avoided
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {commonAvoidedExercises.map((exercise) => (
                            <FormField
                              key={exercise.value}
                              control={form.control}
                              name="avoidedExercises"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={exercise.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(exercise.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], exercise.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== exercise.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {exercise.label}
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
                    name="workoutDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Duration (minutes): {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={15}
                            max={120}
                            step={5}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>15 min</span>
                          <span>60 min</span>
                          <span>120 min</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intensityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intensity Level: {field.value}/10</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Light</span>
                          <span>Moderate</span>
                          <span>Intense</span>
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
                        <FormLabel>
                          Past Workout Influence: {field.value}%
                        </FormLabel>
                        <FormDescription>
                          How much should past workouts influence this new workout?
                        </FormDescription>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={0}
                            max={100}
                            step={10}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span>
                          <span>Balanced</span>
                          <span>Heavy</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                    <FormField
                      control={form.control}
                      name="includeWarmup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Include Warm-up</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includeCooldown"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Include Cool-down</FormLabel>
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
                            placeholder="Add any specific requirements or notes for this workout..."
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
                        Generating...
                      </>
                    ) : (
                      <>
                        <Dumbbell className="mr-2 h-4 w-4" />
                        Generate Personalized Workout
                      </>
                    )}
                  </Button>

                  {generationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{generationError}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          <div>
            {generatedWorkout ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    {generatedWorkout.title}
                  </CardTitle>
                  <CardDescription>
                    {generatedWorkout.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {generatedWorkout.targetMuscleGroups?.map((group: string) => (
                      <Badge key={group} variant="secondary">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {generatedWorkout.warmup && (
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            Warm-up ({generatedWorkout.warmup.duration})
                          </h3>
                          <div className="space-y-2">
                            {generatedWorkout.warmup.exercises.map((ex: any, i: number) => (
                              <div key={i} className="p-3 bg-muted/50 rounded-md">
                                <p className="font-medium">{ex.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ex.duration} - {ex.instructions}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                          <Dumbbell className="h-4 w-4" />
                          Main Workout
                        </h3>
                        <div className="space-y-2">
                          {generatedWorkout.exercises.map((ex: any, i: number) => (
                            <div key={i} className="p-3 border rounded-md">
                              <p className="font-medium">{ex.name}</p>
                              <div className="flex gap-x-4 gap-y-1 flex-wrap text-sm mt-1">
                                <span>Sets: {ex.sets}</span>
                                <span>Reps: {ex.reps}</span>
                                <span>Rest: {ex.rest}</span>
                              </div>
                              {ex.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {ex.notes}
                                </p>
                              )}
                              {ex.alternatives && ex.alternatives.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-muted-foreground">
                                    Alternatives:
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {ex.alternatives.map((alt: string, j: number) => (
                                      <Badge key={j} variant="outline" className="text-xs">
                                        {alt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {generatedWorkout.cooldown && (
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                            Cool-down ({generatedWorkout.cooldown.duration})
                          </h3>
                          <div className="space-y-2">
                            {generatedWorkout.cooldown.exercises.map((ex: any, i: number) => (
                              <div key={i} className="p-3 bg-muted/50 rounded-md">
                                <p className="font-medium">{ex.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ex.duration} - {ex.instructions}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {generatedWorkout.progressionTips && generatedWorkout.progressionTips.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Progression Tips</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {generatedWorkout.progressionTips.map((tip: string, i: number) => (
                              <li key={i} className="text-sm">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {generatedWorkout.notes && (
                        <div>
                          <h3 className="font-semibold mb-2">Additional Notes</h3>
                          <p className="text-sm text-muted-foreground">
                            {generatedWorkout.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Duration:</span>{" "}
                    {generatedWorkout.durationMinutes} min &bull;{" "}
                    <span className="font-medium">Difficulty:</span>{" "}
                    {generatedWorkout.difficulty}
                  </div>
                  <Button variant="outline" size="sm">
                    Save Workout
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md space-y-3 p-8">
                  <div className="mx-auto w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    <Dumbbell className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Ready for a Personalized Workout
                  </h3>
                  <p className="text-muted-foreground">
                    Fill in the workout parameters and generate a custom workout
                    plan tailored to your needs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}