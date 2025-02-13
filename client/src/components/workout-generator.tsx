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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const workoutFormSchema = z.object({
  sessionType: z.enum(["group", "personal"]),
  planType: z.enum(["oneoff", "program"]),
  classType: z.string().optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  focusAreas: z.array(z.string()),
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

interface WorkoutPlan {
  classDetails: {
    className: string;
    coach: string;
    date: string;
    duration: number;
    location: string;
  };
  equipmentNeeded: string[];
  description: string;
  warmup: Array<{
    exercise: string;
    duration: string;
    notes?: string;
  }>;
  mainWorkout: Array<{
    circuitNumber: number;
    explanation: string;
    exercises: Array<{
      exercise: string;
      reps: string;
      sets: string;
      men: string;
      woman: string;
      notes?: string;
    }>;
  }>;
  cooldown: Array<{
    exercise: string;
    duration: string;
    notes?: string;
  }>;
  closingMessage: string;
}

export default function WorkoutGenerator() {
  const [planType, setPlanType] = useState<"oneoff" | "program">("oneoff");
  const [sessionType, setSessionType] = useState<"group" | "personal">("group");
  const { toast } = useToast();

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      sessionType: "group",
      planType: "oneoff", // Always oneoff for group sessions
      fitnessLevel: "intermediate",
      focusAreas: [],
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
      // For group sessions, force oneoff plan type
      const finalValues = {
        ...values,
        planType: values.sessionType === "group" ? "oneoff" : values.planType,
      };

      const res = await apiRequest("POST", "/api/generate-workout", {
        ...finalValues,
        duration: 45,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.details || data.error);
      return data.plan as WorkoutPlan;
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

    const content = `# ${generateMutation.data.classDetails.className} Workout Plan
    
## Class Details
- Coach: ${generateMutation.data.classDetails.coach}
- Date: ${generateMutation.data.classDetails.date}
- Duration: ${generateMutation.data.classDetails.duration} Minutes
- Location: ${generateMutation.data.classDetails.location}

## Equipment Needed
${generateMutation.data.equipmentNeeded.join("\n")}

## Description
${generateMutation.data.description}

## Warm-up
${generateMutation.data.warmup.map(ex => 
  `- ${ex.exercise}: ${ex.duration}${ex.notes ? ` (${ex.notes})` : ""}`
).join("\n")}

## Main Workout
${generateMutation.data.mainWorkout.map(circuit => `
Circuit ${circuit.circuitNumber}
${circuit.explanation}

${circuit.exercises.map(ex => 
  `- ${ex.exercise}: ${ex.sets} sets × ${ex.reps} reps
   Men: ${ex.men} | Women: ${ex.woman}${ex.notes ? `\n   Notes: ${ex.notes}` : ""}`
).join("\n")}`).join("\n\n")}

## Cool Down & Stretch
${generateMutation.data.cooldown.map(ex => 
  `- ${ex.exercise}: ${ex.duration}${ex.notes ? ` (${ex.notes})` : ""}`
).join("\n")}

## Closing Message
${generateMutation.data.closingMessage}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generateMutation.data.classDetails.className.toLowerCase()}-workout-plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Workout Generator</CardTitle>
          <CardDescription>
            Generate professional workout plans powered by Coach Pete's methodology
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

              {/* Only show plan type for personal training */}
              {sessionType === "personal" && (
                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            setPlanType(value as "oneoff" | "program");
                          }}
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
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {sessionType === "group" && (
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
              )}

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
                  </FormItem>
                )}
              />

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
              </div>

              {planType === "program" && (
                <div className="space-y-4">
                  <FormLabel>Program Details</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="programDetails.sessionsPerWeek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sessions per Week</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="7"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

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
                  `Generate ${planType === "oneoff" ? "Workout" : "Program"}`
                )}
              </Button>
            </form>
          </Form>

          {generateMutation.data && (
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{generateMutation.data.classDetails.className}</CardTitle>
                  <CardDescription>
                    {generateMutation.data.classDetails.date} - {generateMutation.data.classDetails.duration} Minutes
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Equipment */}
                <div>
                  <h3 className="font-medium mb-2">Equipment Needed</h3>
                  <ul className="list-disc pl-4">
                    {generateMutation.data.equipmentNeeded.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {generateMutation.data.description}
                  </p>
                </div>

                {/* Warm-up */}
                <div>
                  <h3 className="font-medium mb-2">Warm-up</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exercise</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateMutation.data.warmup.map((exercise, index) => (
                        <TableRow key={index}>
                          <TableCell>{exercise.exercise}</TableCell>
                          <TableCell>{exercise.duration}</TableCell>
                          <TableCell>{exercise.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Main Workout */}
                <div className="space-y-4">
                  <h3 className="font-medium">Main Workout</h3>
                  {generateMutation.data.mainWorkout.map((circuit, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium">Circuit {circuit.circuitNumber}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {circuit.explanation}
                      </p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exercise</TableHead>
                            <TableHead>Sets</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Men</TableHead>
                            <TableHead>Women</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {circuit.exercises.map((exercise, exIndex) => (
                            <TableRow key={exIndex}>
                              <TableCell>{exercise.exercise}</TableCell>
                              <TableCell>{exercise.sets}</TableCell>
                              <TableCell>{exercise.reps}</TableCell>
                              <TableCell>{exercise.men}</TableCell>
                              <TableCell>{exercise.woman}</TableCell>
                              <TableCell>{exercise.notes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>

                {/* Cool Down */}
                <div>
                  <h3 className="font-medium mb-2">Cool Down & Stretch</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exercise</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateMutation.data.cooldown.map((exercise, index) => (
                        <TableRow key={index}>
                          <TableCell>{exercise.exercise}</TableCell>
                          <TableCell>{exercise.duration}</TableCell>
                          <TableCell>{exercise.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Closing Message */}
                <div>
                  <h3 className="font-medium mb-2">Closing Message</h3>
                  <p className="text-sm text-muted-foreground">
                    {generateMutation.data.closingMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}