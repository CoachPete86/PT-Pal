import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [classType, setClassType] = useState<string>("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/generate-workout", {
        classType,
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
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Select
                value={classType}
                onValueChange={setClassType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLC">GLC</SelectItem>
                  <SelectItem value="BURN">BURN</SelectItem>
                  <SelectItem value="HIIT">HIIT</SelectItem>
                  <SelectItem value="LIFT">LIFT</SelectItem>
                  <SelectItem value="METCON">METCON</SelectItem>
                  <SelectItem value="CORE">CORE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!classType || generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Workout Plan"
              )}
            </Button>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
