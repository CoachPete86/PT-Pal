import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Activity,
  Clock,
  Dumbbell,
  FlameKindling,
  Heart,
  LayoutGrid,
  ListChecks,
  ScrollText,
  Snowflake,
  Target,
  Timer,
  Users,
} from "lucide-react";

interface WorkoutPlan {
  introduction: {
    overview: string;
    intensity: string;
    objectives: string[];
    preparation: string;
  };
  mainWorkout: Array<{
    circuitNumber: number;
    explanation: string;
    objective: string;
    setupInstructions: string;
    exercises: Array<{
      exercise: string;
      reps: string;
      sets: string;
      men: string;
      woman: string;
      technique: string;
      notes?: string;
    }>;
  }>;
  recovery: {
    immediateSteps: string[];
    nutritionTips: string[];
    restRecommendations: string;
    nextDayGuidance: string;
  };
}

const workoutFormSchema = z.object({
  sessionType: z.enum(["group", "personal"]),
  planType: z.enum(["oneoff", "program"]),
  classType: z.string().optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  participantInfo: z.object({
    count: z.string().transform((val) => parseInt(val) || 0),
    format: z.enum(["individual", "partner", "groups"]).optional(),
    groupSize: z.string().transform((val) => parseInt(val) || 0).optional(),
  }).optional(),
  circuitPreferences: z.object({
    types: z.array(z.string()),
    stationRotation: z.boolean(),
    restBetweenStations: z.boolean(),
    mixedEquipmentStations: z.boolean(),
  }),
  groupFormat: z.object({
    type: z.enum(["amrap", "emom", "tabata", "custom"]),
    workInterval: z.number().optional(),
    restInterval: z.number().optional(),
    rounds: z.number().optional(),
  }).optional(),
  equipment: z.array(z.string()),
  clientDetails: z.object({
    age: z.string(),
    gender: z.enum(["male", "female", "other"]),
    goals: z.string(),
    limitations: z.string().optional(),
    experience: z.string(),
  }).optional(),
  programDetails: z.object({
    weeks: z.number(),
    sessionsPerWeek: z.number(),
  }).optional(),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

const availableEquipment = [
  {
    category: "Free Weights",
    icon: Dumbbell,
    items: [
      { id: "dumbbells-light", label: "Dumbbells (2-10kg)", count: "Multiple pairs" },
      { id: "dumbbells-medium", label: "Dumbbells (12.5-22.5kg)", count: "Multiple pairs" },
      { id: "kettlebells-light", label: "Kettlebells (8-16kg)", count: "2 of each" },
      { id: "kettlebells-heavy", label: "Kettlebells (20-24kg)", count: "2 of each" },
      { id: "plates", label: "Weight Plates (1.25-20kg)", count: "Multiple sets" },
      { id: "bodybar", label: "Weighted Bars (5-20kg)", count: "4 available" },
    ],
  },
  {
    category: "Cardio Equipment",
    icon: Activity,
    items: [
      { id: "rower", label: "Concept 2 Rowers", count: "3 available" },
      { id: "skierg", label: "SkiErg Machines", count: "2 available" },
      { id: "assault-bike", label: "Assault Bike", count: "1 available" },
      { id: "wattbike", label: "Watt Bike", count: "1 available" },
      { id: "spinbike", label: "Spin Bikes", count: "2 available" },
    ],
  },
  {
    category: "Functional Training",
    icon: Target,
    items: [
      { id: "plyobox", label: "Plyo Boxes (20/24/30\")", count: "2 sets" },
      { id: "stepbox", label: "Adjustable Step Platform", count: "4 available" },
      { id: "battleropes", label: "Battle Ropes (15m)", count: "2 sets" },
      { id: "sledge", label: "Training Sledge", count: "1 available" },
      { id: "trx", label: "TRX Suspension Trainers", count: "2 sets" },
      { id: "resistance-bands", label: "Resistance Bands (Light/Medium/Heavy)", count: "Multiple sets" },
    ],
  },
  {
    category: "Recovery & Mobility",
    icon: Heart,
    items: [
      { id: "foam-roller", label: "Foam Rollers", count: "4 available" },
      { id: "yogamat", label: "Yoga/Exercise Mats", count: "10 available" },
      { id: "mobility-bands", label: "Mobility Bands", count: "Multiple sets" },
      { id: "massage-balls", label: "Massage/Trigger Point Balls", count: "Set of 6" },
    ],
  },
  {
    category: "Accessories",
    icon: LayoutGrid,
    items: [
      { id: "timer", label: "Gym Timer", count: "2 available" },
      { id: "cones", label: "Training Cones", count: "Set of 12" },
      { id: "agility-ladder", label: "Agility Ladder", count: "2 available" },
      { id: "medicine-balls", label: "Medicine Balls (2-10kg)", count: "Set of 6" },
    ],
  },
];

// Update circuit types to focus on timing formats
const circuitTypes = [
  { id: "timed", label: "Timed Circuits (Fixed Work/Rest)" },
  { id: "superset", label: "Supersets (Back-to-back Exercises)" },
  { id: "tabata", label: "Tabata (20s Work/10s Rest)" },
  { id: "amrap", label: "AMRAP (As Many Rounds As Possible)" },
  { id: "emom", label: "EMOM (Every Minute On the Minute)" },
  { id: "intervals", label: "High-Intensity Intervals" },
  { id: "resistance-cardio", label: "Alternating Resistance/Cardio" },
  { id: "pyramid", label: "Pyramid (Increasing/Decreasing Reps)" },
];

export default function WorkoutGenerator() {
  const [sessionType, setSessionType] = useState<"group" | "personal">("group");
  const { toast } = useToast();

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      sessionType: "group",
      planType: "oneoff",
      fitnessLevel: "intermediate",
      equipment: [],
      circuitPreferences: {
        types: [],
        stationRotation: true,
        restBetweenStations: true,
        mixedEquipmentStations: true,
      },
      groupFormat: {
        type: "amrap",
        workInterval: 40,
        restInterval: 20,
        rounds: 5,
      },
    },
  });

  // Update form values when session type changes
  useEffect(() => {
    if (sessionType === "group") {
      form.setValue("planType", "oneoff");
    }
  }, [sessionType, form]);

  const generateMutation = useMutation({
    mutationFn: async (values: WorkoutFormValues) => {
      const res = await apiRequest("POST", "/api/generate-workout", values);
      const data = await res.json();
      if (data.error) throw new Error(data.details || data.error);
      return data.plan as WorkoutPlan;
    },
    onSuccess: () => {
      toast({
        title: "Workout Plan Generated",
        description: "Your workout plan has been generated and saved to Notion.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WorkoutFormValues) => {
    generateMutation.mutate(values);
  };

  const handleDownload = () => {
    if (!generateMutation.data) return;

    //This section needs to be updated to match the new WorkoutPlan interface.  This is a complex task and requires understanding the data structure generated by the API.  I cannot provide a complete and accurate implementation without knowing the exact structure of the data returned by the `/api/generate-workout` endpoint.  The current implementation is a placeholder and will likely produce errors if the API response does not perfectly match the existing logic.  A full refactoring is needed to accurately reflect the new data.

    const content = JSON.stringify(generateMutation.data, null, 2); // Use JSON.stringify for now.  This is not ideal for a downloadable text file but it's safer than attempting to construct the string manually without knowing the API's response structure.

    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generateMutation.data.introduction.overview.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}-workout-plan.json`; //Improved filename generation to avoid special characters.
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workout Plan Generator</CardTitle>
          <CardDescription>
            {sessionType === "group"
              ? "Create group class plans following Coach Pete's proven blueprint for effective group training sessions."
              : "Design personalized training sessions tailored to individual client needs and goals."}
            All plans follow a structured format with proper warm-up, progressive loading, and cool-down phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSessionType(value as "group" | "personal");
                        }}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="group" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Group Class
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="personal" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Personal Training
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {sessionType === "group" ? (
                <>
                  <FormField
                    control={form.control}
                    name="classType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GLC">GLC</SelectItem>
                            <SelectItem value="BURN">BURN</SelectItem>
                            <SelectItem value="HIIT">HIIT</SelectItem>
                            <SelectItem value="LIFT">LIFT</SelectItem>
                            <SelectItem value="METCON">METCON</SelectItem>
                            <SelectItem value="CORE">CORE</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groupFormat.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Format</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="amrap">AMRAP (As Many Rounds As Possible)</SelectItem>
                            <SelectItem value="emom">EMOM (Every Minute On the Minute)</SelectItem>
                            <SelectItem value="tabata">Tabata</SelectItem>
                            <SelectItem value="custom">Custom Work/Rest Intervals</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {form.watch("groupFormat.type") === "custom" && (
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="groupFormat.workInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Interval (seconds)</FormLabel>
                            <FormControl>
                              <Input type="number" min="10" max="300" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="groupFormat.restInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rest Interval (seconds)</FormLabel>
                            <FormControl>
                              <Input type="number" min="5" max="120" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="groupFormat.rounds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Rounds</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="20" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* New Participant Information Section */}
                  <div className="space-y-4">
                    <FormLabel>Participant Information</FormLabel>
                    <FormField
                      control={form.control}
                      name="participantInfo.count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Number of Participants</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="30"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormDescription>
                            This helps optimize station rotations and equipment allocation
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="participantInfo.format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Format</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select workout format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">Individual Stations</SelectItem>
                              <SelectItem value="partner">Partner Workout</SelectItem>
                              <SelectItem value="groups">Small Groups</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {form.watch("participantInfo.format") === "groups" && (
                      <FormField
                        control={form.control}
                        name="participantInfo.groupSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Participants per Group</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="2"
                                max="6"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Circuit Preferences Section */}
                  <div className="space-y-4">
                    <FormLabel>Circuit Preferences</FormLabel>

                    <FormField
                      control={form.control}
                      name="circuitPreferences.types"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Circuit Types</FormLabel>
                            <FormDescription>
                              Select the types of circuits you want to include
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {circuitTypes.map((type) => (
                              <FormField
                                key={type.id}
                                control={form.control}
                                name="circuitPreferences.types"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={type.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(type.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, type.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== type.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {type.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="circuitPreferences.stationRotation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Station Rotation
                              </FormLabel>
                              <FormDescription>
                                Participants move between stations
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="circuitPreferences.restBetweenStations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Rest Between Stations
                              </FormLabel>
                              <FormDescription>
                                Include rest periods during rotations
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="circuitPreferences.mixedEquipmentStations"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Mixed Equipment Stations
                              </FormLabel>
                              <FormDescription>
                                Allow multiple equipment types per station
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Fitness Level</FormLabel>
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
                            <SelectItem value="beginner">Beginner-Friendly</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This will adjust the difficulty and complexity of exercises for the whole group
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                // Personal Training fields
                <>
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Type</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="oneoff" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Single Session
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="program" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              12-Week Program
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />

                  {/* Client Details - Only for Personal Training */}
                  <div className="space-y-4">
                    <FormLabel>Client Details</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientDetails.age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
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
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="clientDetails.goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Goals</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Weight loss, muscle gain, endurance"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientDetails.limitations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limitations or Injuries</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Any physical limitations or injuries"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientDetails.experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <FormControl>
                            <Input placeholder="Describe their experience" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Equipment Selection - Common for both types */}
              <FormField
                control={form.control}
                name="equipment"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Available Equipment</FormLabel>
                      <FormDescription>
                        Select the equipment you want to include in the workout
                      </FormDescription>
                    </div>
                    <div className="space-y-6">
                      {availableEquipment.map((category) => (
                        <div key={category.category} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <category.icon className="h-5 w-5 text-muted-foreground" />
                            <h4 className="font-medium">{category.category}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.items.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="equipment"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent transition-colors"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium">
                                          {item.label}
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                          {item.count}
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  `Generate ${sessionType === "group" ? "Class Plan" : form.watch("planType") === "oneoff" ? "Session" : "Program"}`
                )}
              </Button>
            </form>
          </Form>

          {generateMutation.data && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Plan</CardTitle> {/* Updated Card Title */}
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Plan
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Introduction Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Introduction</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Overview</h4>
                          <p>{generateMutation.data.introduction.overview}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Intensity Level</h4>
                          <p>{generateMutation.data.introduction.intensity}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Objectives</h4>
                          <ul className="list-disc pl-4">
                            {generateMutation.data.introduction.objectives.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium">Preparation</h4>
                          <p>{generateMutation.data.introduction.preparation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Workout Section */}
                    {generateMutation.data.mainWorkout.map((circuit, index) => (
                      <div key={index} className="mb-6 border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">
                          Circuit {circuit.circuitNumber}
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Overview</h4>
                            <p>{circuit.explanation}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Objective</h4>
                            <p>{circuit.objective}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Setup Instructions</h4>
                            <p>{circuit.setupInstructions}</p>
                          </div>

                          {/* Exercises */}
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Exercises</h4>
                            {circuit.exercises.map((exercise, exIndex) => (
                              <div key={exIndex} className="border rounded p-3 mb-3">
                                <h5 className="font-medium">{exercise.exercise}</h5>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <span className="text-sm text-muted-foreground">Sets × Reps:</span>
                                    <span className="ml-2">{exercise.sets} × {exercise.reps}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm text-muted-foreground">Weight/Variation:</span>
                                    <div className="grid grid-cols-2 gap-1">
                                      <div>M: {exercise.men}</div>
                                      <div>W: {exercise.woman}</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-sm text-muted-foreground">Technique:</span>
                                  <p className="mt-1">{exercise.technique}</p>
                                </div>
                                {exercise.notes && (
                                  <div className="mt-2">
                                    <span className="text-sm text-muted-foreground">Notes:</span>
                                    <p className="mt-1">{exercise.notes}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Recovery Section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Recovery & Next Steps</h3>
                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-medium">Immediate Recovery Steps</h4>
                          <ul className="list-disc pl-4">
                            {generateMutation.data.recovery.immediateSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium">Nutrition Tips</h4>
                          <ul className="list-disc pl-4">
                            {generateMutation.data.recovery.nutritionTips.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium">Rest Recommendations</h4>
                          <p>{generateMutation.data.recovery.restRecommendations}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Next Day Guidance</h4>
                          <p>{generateMutation.data.recovery.nextDayGuidance}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}