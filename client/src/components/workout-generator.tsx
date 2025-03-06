import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import SessionPlanTemplate, { SessionPlan } from "./session-plan-template";
import HelpTooltip from "@/components/ui/help-tooltip";

// UI imports
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, ChevronRight, HelpCircle, Info as InfoIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type SessionType = "group" | "personal";
type PlanType = "oneoff" | "program";

// Minimal circuit format type
type ClassFormatType = "tabata" | "amrap" | "emom" | "timed-sets" | "custom";

// Example format interface
interface ClassFormat {
  type: ClassFormatType;
  rounds?: string; // store as string for partial input
  workInterval?: string; // store as string
  restInterval?: string; // store as string
  description?: string;
}

interface WorkoutPlan {
  id?: number;
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

// Group Class Types
const groupClassTypes = [
  { value: "GLC", label: "GLC (Glutes, Legs & Core)" },
  { value: "BURN", label: "BURN (Calorie Focus)" },
  { value: "HIIT", label: "HIIT (High Intensity)" },
  { value: "LIFT", label: "LIFT (Strength Focus)" },
  { value: "METCON", label: "METCON (Metabolic Conditioning)" },
  { value: "CORE", label: "CORE (Core & Stability)" },
  { value: "FLEX", label: "FLEX (Mobility & Flexibility)" },
];

// Class Format Options
const classFormatOptions = [
  { id: "tabata", name: "Tabata (20s Work / 10s Rest)" },
  { id: "amrap", name: "AMRAP (As Many Rounds As Possible)" },
  { id: "emom", name: "EMOM (Every Minute on the Minute)" },
  { id: "timed-sets", name: "Timed Sets" },
  { id: "custom", name: "Custom Format" },
];

// Minimal “template” to quickly add
const classFormatTemplates = [
  {
    id: "hiit-standard",
    name: "HIIT Standard",
    description: "Tabata & AMRAP blocks",
    formats: [
      {
        type: "tabata",
        workInterval: "20",
        restInterval: "10",
        rounds: "8",
        description: "20s on, 10s off × 8",
      },
      {
        type: "amrap",
        workInterval: "300",
        restInterval: "60",
        rounds: "3",
        description: "5-min AMRAP x 3",
      },
    ],
  },
  {
    id: "strength-circuit",
    name: "Strength Circuit",
    description: "EMOM & Timed Sets",
    formats: [
      {
        type: "emom",
        workInterval: "50",
        restInterval: "10",
        rounds: "10",
        description: "50s on, 10s off × 10",
      },
      {
        type: "timed-sets",
        workInterval: "40",
        restInterval: "20",
        rounds: "4",
        description: "4 sets 40s on, 20s off",
      },
    ],
  },
];

// Personal training location & goals
const locationOptions = [
  { value: "commercial-gym", label: "Commercial Gym" },
  { value: "home-gym", label: "Home Gym" },
  { value: "outdoor", label: "Outdoor Training" },
  { value: "hybrid", label: "Hybrid Environment" },
];
const personalGoals = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Muscle Building" },
  { value: "endurance", label: "Endurance" },
  { value: "weight-loss", label: "Weight Loss" },
];

export default function WorkoutGenerator({ clientId }: { clientId?: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sessionType, setSessionType] = useState<SessionType>("group");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New session plan template feature
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  // -------------- GROUP STATES --------------
  const [groupClassType, setGroupClassType] = useState("");
  const [groupFitnessLevel, setGroupFitnessLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [participantCount, setParticipantCount] = useState(10);
  const [participantFormat, setParticipantFormat] = useState<
    "individual" | "partner" | "groups"
  >("individual");
  const [groupSize, setGroupSize] = useState(3);
  const [stationRotation, setStationRotation] = useState(true);
  const [restBetweenStations, setRestBetweenStations] = useState(true);
  const [mixedEquipmentStations, setMixedEquipmentStations] = useState(true);
  
  // Equipment selection state
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  
  // Available equipment options
  const equipmentOptions = [
    "Dumbbells", "Kettlebells", "Plyo Boxes", "Concept 2 Rowers",
    "Ski Erg Machines", "Watt Bike", "Spin Bike", "Sledge",
    "Battle Ropes", "Bodybar with plates", "Step up Box", "Yoga Matt",
    "Resistance Bands", "Medicine Balls", "Slam Balls", "TRX Straps",
    "Barbell & Plates", "Cable Machine", "Smith Machine", "Bosu Ball"
  ];

  // Single list of “classFormats” for group. No second list.
  const [classFormats, setClassFormats] = useState<ClassFormat[]>([]);
  // For “Add / Edit Format” UI
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showFormatEditor, setShowFormatEditor] = useState(false);

  // -------------- PERSONAL WIZARD --------------
  const [personalStep, setPersonalStep] = useState(1);
  const [planType, setPlanType] = useState<PlanType>("oneoff");

  // Client info
  const [clientAge, setClientAge] = useState("");
  const [clientGender, setClientGender] = useState<"male" | "female" | "other">(
    "other",
  );
  const [clientGoals, setClientGoals] = useState("");
  const [clientLimitations, setClientLimitations] = useState("");
  const [clientExperience, setClientExperience] = useState("");

  // Program details
  const [programWeeks, setProgramWeeks] = useState(12);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);

  // Wizard steps: location + equipment + goal
  const [trainingLocation, setTrainingLocation] = useState("");
  const [personalEquipment, setPersonalEquipment] = useState("");
  const [personalGoal, setPersonalGoal] = useState("");
  const [personalCircuitTypes, setPersonalCircuitTypes] = useState<string[]>(
    [],
  );

  // -------------- QUERIES --------------
  const { data: clientData } = useQuery<User>({
    queryKey: ["client-data", clientId],
    enabled: !!clientId,
  });
  useEffect(() => {
    // Potentially fill from clientData
  }, [clientData]);

  // -------------- MUTATIONS --------------
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      setIsGenerating(true);
      const res = await apiRequest("POST", "/api/generate-workout", payload);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.plan as WorkoutPlan;
    },
    onSuccess: (plan) => {
      setIsGenerating(false);
      setSelectedPlan(plan);
      toast({ title: "Workout Plan Generated" });
    },
    onError: (err: any) => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    },
  });

  const exportPdfMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      window.open(`/api/workout-plan/${workoutId}/export-pdf`, "_blank");
      return true;
    },
    onSuccess: () => {
      toast({ title: "Export Started", description: "PDF generating..." });
    },
    onError: (err: any) => {
      toast({
        title: "Export Failed",
        description: String(err),
        variant: "destructive",
      });
    },
  });

  // -------------- HANDLERS --------------

  // Group
  function handleSubmitGroupPlan() {
    // Convert string fields to numbers if needed, etc.
    // Build a minimal payload
    const payload = {
      sessionType: "group",
      classType: groupClassType,
      fitnessLevel: groupFitnessLevel,
      participantInfo: {
        count: participantCount,
        format: participantFormat,
        groupSize: participantFormat === "groups" ? groupSize : 0,
      },
      circuitPreferences: {
        stationRotation,
        restBetweenStations,
        mixedEquipmentStations,
        types: [],
      },
      equipment: selectedEquipment.length > 0 
        ? selectedEquipment 
        : equipmentOptions.slice(0, 8), // Default to first 8 equipment if nothing selected
      classFormats: classFormats.map((fmt) => ({
        type: fmt.type,
        rounds: parseInt(fmt.rounds || "0") || 0,
        workInterval: parseInt(fmt.workInterval || "0") || 0,
        restInterval: parseInt(fmt.restInterval || "0") || 0,
        description: fmt.description || "",
      })),
    };
    generateMutation.mutate(payload);
  }

  // Personal
  function handleSubmitPersonalPlan() {
    const payload = {
      sessionType: "personal",
      planType,
      clientDetails: {
        age: clientAge,
        gender: clientGender,
        goals: clientGoals,
        limitations: clientLimitations,
        experience: clientExperience,
      },
      programDetails:
        planType === "program"
          ? { weeks: programWeeks, sessionsPerWeek }
          : undefined,
      trainingLocation,
      equipment: personalEquipment
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      workoutGoal: personalGoal,
      circuitPreferences: {
        types: personalCircuitTypes,
      },
    };
    generateMutation.mutate(payload);
  }

  function handleDownload() {
    if (!selectedPlan) return;
    if (selectedPlan.id) {
      exportPdfMutation.mutate(selectedPlan.id);
      return;
    }
    // otherwise export JSON
    try {
      const content = JSON.stringify(selectedPlan, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "workout-plan.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded JSON" });
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  // -------------- CLASS FORMAT METHODS (Group) --------------
  function addFormat() {
    setEditingIndex(null);
    setShowFormatEditor(true);
  }
  function editFormat(idx: number) {
    setEditingIndex(idx);
    setShowFormatEditor(true);
  }
  function removeFormat(idx: number) {
    setClassFormats((prev) => prev.filter((_, i) => i !== idx));
  }

  function loadFormatTemplate(templateId: string) {
    const template = classFormatTemplates.find((t) => t.id === templateId);
    if (!template) return;
    // Add them to the existing array
    const newFormats = template.formats.map((f) => ({
      type: f.type as ClassFormatType,
      rounds: f.rounds || "",
      workInterval: f.workInterval || "",
      restInterval: f.restInterval || "",
      description: f.description || "",
    }));
    setClassFormats((prev) => [...prev, ...newFormats]);
  }

  // If the user hits “Save” in the editor
  function saveFormatEditor(format: ClassFormat) {
    if (editingIndex !== null) {
      // update existing
      setClassFormats((prev) => {
        const updated = [...prev];
        updated[editingIndex] = format;
        return updated;
      });
    } else {
      // add new
      setClassFormats((prev) => [...prev, format]);
    }
    setShowFormatEditor(false);
    setEditingIndex(null);
  }

  // -------------- RENDER UI --------------

  // GROUP FLOW
  function renderGroupFlow() {
    return (
      <Card className="animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle>Group Class Workout Plan</CardTitle>
          <CardDescription>
            Design a complete group class session with exercises, equipment, and timing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="bg-muted/20 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-lg">Class Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Type */}
              <div>
                <Label className="text-sm font-medium">Class Type</Label>
                <Select
                  value={groupClassType}
                  onValueChange={(val) => setGroupClassType(val)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Class Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupClassTypes.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">The primary focus of your class</p>
              </div>

              {/* Fitness Level */}
              <div>
                <Label className="text-sm font-medium">Group Fitness Level</Label>
                <Select
                  value={groupFitnessLevel}
                  onValueChange={(val) => setGroupFitnessLevel(val as any)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="mixed">Mixed Levels</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Affects exercise selection and intensity</p>
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className="space-y-4 rounded-lg bg-secondary/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Participant Setup</h3>
              <HelpTooltip 
                character="coach" 
                content="Configure how your participants will be organized during the class. This affects station setup, equipment requirements, and exercise selection."
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </HelpTooltip>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Expected Participants</Label>
                <Input
                  type="number"
                  value={participantCount}
                  onChange={(e) => setParticipantCount(+e.target.value)}
                  className="mt-1.5"
                  min={1}
                  max={50}
                />
                <p className="text-xs text-muted-foreground mt-1">Total number of people in class</p>
              </div>
              <div>
                <Label className="text-sm">Workout Format</Label>
                <Select
                  value={participantFormat}
                  onValueChange={(val) => setParticipantFormat(val as any)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Stations</SelectItem>
                    <SelectItem value="partner">Partner Workouts</SelectItem>
                    <SelectItem value="groups">Small Groups (3-5)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">How participants will work together</p>
              </div>
            </div>
            
            {participantFormat === "groups" && (
              <div>
                <Label className="text-sm">Group Size</Label>
                <Input
                  type="number"
                  value={groupSize}
                  onChange={(e) => setGroupSize(+e.target.value)}
                  className="mt-1.5 w-full md:w-1/3"
                  min={2}
                  max={8}
                />
                <p className="text-xs text-muted-foreground mt-1">Number of participants per group</p>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-muted">
              <h4 className="text-sm font-medium mb-2">Class Dynamics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={stationRotation}
                    onCheckedChange={(val) => setStationRotation(!!val)}
                    id="station-rotation"
                  />
                  <div>
                    <Label htmlFor="station-rotation" className="cursor-pointer">Station Rotation</Label>
                    <p className="text-xs text-muted-foreground">Participants move between stations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={restBetweenStations}
                    onCheckedChange={(val) => setRestBetweenStations(!!val)}
                    id="rest-between"
                  />
                  <div>
                    <Label htmlFor="rest-between" className="cursor-pointer">Rest Between Stations</Label>
                    <p className="text-xs text-muted-foreground">Include transition/rest periods</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={mixedEquipmentStations}
                    onCheckedChange={(val) => setMixedEquipmentStations(!!val)}
                    id="mixed-equipment"
                  />
                  <div>
                    <Label htmlFor="mixed-equipment" className="cursor-pointer">Mixed Equipment Stations</Label>
                    <p className="text-xs text-muted-foreground">Use different equipment at each station</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Equipment Selection */}
          <div className="border p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Gym Equipment Available</h3>
              <HelpTooltip 
                character="gym-buddy" 
                content="Select the equipment available in your commercial gym for this workout. The workout plan will be customized based on your equipment selection."
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </HelpTooltip>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedEquipment(equipmentOptions.filter(e => 
                  ["Dumbbells", "Kettlebells", "Resistance Bands", "Plyo Boxes", "Yoga Matt"].includes(e)
                ))}
              >
                Basic Equipment
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedEquipment(equipmentOptions.filter(e => 
                  ["Dumbbells", "Kettlebells", "Battle Ropes", "Medicine Balls", "TRX Straps"].includes(e)
                ))}
              >
                HIIT Setup
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedEquipment(equipmentOptions.filter(e => 
                  ["Barbell & Plates", "Dumbbells", "Smith Machine", "Cable Machine"].includes(e)
                ))}
              >
                Strength Focus
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedEquipment(equipmentOptions.filter(e => 
                  ["Concept 2 Rowers", "Spin Bike", "Ski Erg Machines", "Medicine Balls"].includes(e)
                ))}
              >
                Cardio Equipment
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
              {equipmentOptions.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedEquipment.includes(item)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEquipment((prev) => [...prev, item]);
                      } else {
                        setSelectedEquipment((prev) => 
                          prev.filter((equip) => equip !== item)
                        );
                      }
                    }}
                    id={`equipment-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label 
                    htmlFor={`equipment-${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="cursor-pointer text-sm"
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="mt-2 pt-2 border-t border-dashed">
              <p className="text-xs text-muted-foreground">Selected: {selectedEquipment.length} items</p>
            </div>
          </div>

          {/* Class Formats */}
          <div className="space-y-4 border p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Workout Structure</h3>
                <HelpTooltip 
                  character="coach" 
                  content="Define how your workout will be structured with work/rest intervals. This creates the framework for your entire class."
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </HelpTooltip>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFormatTemplate("hiit-standard")}
                  className="flex-grow sm:flex-grow-0"
                >
                  <span>HIIT Format</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFormatTemplate("strength-circuit")}
                  className="flex-grow sm:flex-grow-0"
                >
                  <span>Strength Format</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={addFormat}
                  className="flex-grow sm:flex-grow-0"
                >
                  <span>Add Custom Format</span>
                </Button>
              </div>
            </div>
            
            {classFormats.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground p-6 border border-dashed rounded-md">
                No workout structures defined yet. Add a custom format or select a template.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classFormats.map((fmt, idx) => {
                  const fmtOption = classFormatOptions.find(
                    (o) => o.id === fmt.type,
                  );
                  return (
                    <Card key={idx} className="border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {fmtOption ? fmtOption.name : fmt.type}
                        </CardTitle>
                        {fmt.description && <CardDescription>{fmt.description}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-primary/10">Rounds: {fmt.rounds || "?"}</Badge>
                          <Badge variant="outline" className="bg-primary/10">Work: {fmt.workInterval || "?"}s</Badge>
                          <Badge variant="outline" className="bg-primary/10">Rest: {fmt.restInterval || "?"}s</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editFormat(idx)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFormat(idx)}
                        >
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="text-sm text-muted-foreground w-full text-center pb-2">
            This will generate a complete group workout plan with warmup, main exercises, and cooldown
          </div>
          <Button className="w-full" onClick={handleSubmitGroupPlan}>
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Group Workout Plan...
              </>
            ) : (
              "Generate Group Workout Plan"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Format editor state (moved to component level)
  const [localType, setLocalType] = useState<ClassFormatType>("tabata");
  const [localRounds, setLocalRounds] = useState("");
  const [localWork, setLocalWork] = useState("");
  const [localRest, setLocalRest] = useState("");
  const [localDesc, setLocalDesc] = useState("");
  
  // Effect to update local state when editing begins
  useEffect(() => {
    if (showFormatEditor && editingIndex !== null) {
      const existing = classFormats[editingIndex];
      if (existing) {
        setLocalType(existing.type || "tabata");
        setLocalRounds(existing.rounds || "");
        setLocalWork(existing.workInterval || "");
        setLocalRest(existing.restInterval || "");
        setLocalDesc(existing.description || "");
      }
    } else if (showFormatEditor) {
      // Reset values for new format
      setLocalType("tabata");
      setLocalRounds("");
      setLocalWork("");
      setLocalRest("");
      setLocalDesc("");
    }
  }, [showFormatEditor, editingIndex, classFormats]);

  // EDITOR for Add/Edit Format
  function renderFormatEditor() {
    if (!showFormatEditor) return null;

    function handleSave() {
      // keep as strings, parse later
      const newFmt: ClassFormat = {
        type: localType,
        rounds: localRounds,
        workInterval: localWork,
        restInterval: localRest,
        description: localDesc,
      };
      saveFormatEditor(newFmt);
    }
    return (
      <AlertDialog
        open={true}
        onOpenChange={(open) => !open && setShowFormatEditor(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingIndex !== null ? "Edit Format" : "Add New Format"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Label>Format Type</Label>
                <HelpTooltip 
                  character="gym-buddy" 
                  content="The format type determines how exercises will be structured during the workout session. Different formats emphasize various training aspects like intensity, endurance, or strength."
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </HelpTooltip>
              </div>
              <Select
                value={localType}
                onValueChange={(val) => setLocalType(val as ClassFormatType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format type" />
                </SelectTrigger>
                <SelectContent>
                  {classFormatOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Rounds</Label>
                  <HelpTooltip 
                    character="coach" 
                    content="The number of times you'll repeat the exercise sequence. For example, '8 rounds' means the entire circuit will be performed 8 times."
                    side="top"
                  >
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                <Input
                  type="text"
                  value={localRounds}
                  onChange={(e) => setLocalRounds(e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Work Interval (s)</Label>
                  <HelpTooltip 
                    character="scientist" 
                    content="This is the time spent actively performing the exercise. For example, '20' means 20 seconds of work per exercise per round."
                    side="top"
                  >
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                <Input
                  type="text"
                  value={localWork}
                  onChange={(e) => setLocalWork(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Rest Interval (s)</Label>
                  <HelpTooltip 
                    character="physio" 
                    content="This is the recovery time between exercises. For example, '10' means 10 seconds of rest after each exercise before starting the next one."
                    side="top"
                  >
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                <Input
                  type="text"
                  value={localRest}
                  onChange={(e) => setLocalRest(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Description</Label>
                  <HelpTooltip 
                    character="nutritionist" 
                    content="Add a short description to help identify this format block. This is especially useful when you have multiple formats in your workout."
                    side="top"
                  >
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                <Input
                  type="text"
                  value={localDesc}
                  onChange={(e) => setLocalDesc(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFormatEditor(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // PERSONAL FLOW (Wizard)
  function renderPersonalWizard() {
    function nextStep() {
      setPersonalStep((s) => s + 1);
    }
    function prevStep() {
      setPersonalStep((s) => s - 1);
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Training Session Plan</CardTitle>
          <CardDescription>Step {personalStep} of 4 - Complete client details and training requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {personalStep === 1 && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-lg">Session Format</h3>
                <div>
                  <Label>Plan Type</Label>
                  <RadioGroup
                    value={planType}
                    onValueChange={(val) => setPlanType(val as PlanType)}
                    className="flex flex-col space-y-2 mt-2"
                  >
                    <div className="flex items-start space-x-2 p-3 border rounded-md hover:bg-muted/20 transition-colors">
                      <RadioGroupItem value="oneoff" id="oneoff" className="mt-1" />
                      <div>
                        <FormLabel htmlFor="oneoff" className="font-medium">Single Training Session</FormLabel>
                        <p className="text-sm text-muted-foreground">Create a plan for a one-time personal training session</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 p-3 border rounded-md hover:bg-muted/20 transition-colors">
                      <RadioGroupItem value="program" id="program" className="mt-1" />
                      <div>
                        <FormLabel htmlFor="program" className="font-medium">Progressive Training Program</FormLabel>
                        <p className="text-sm text-muted-foreground">Design a structured program spanning multiple weeks</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                {planType === "program" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t">
                    <div>
                      <Label>Program Duration (weeks)</Label>
                      <Input
                        type="number"
                        value={programWeeks}
                        onChange={(e) => setProgramWeeks(+e.target.value)}
                        min={4}
                        max={24}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Length of the full program</p>
                    </div>
                    <div>
                      <Label>Sessions Per Week</Label>
                      <Input
                        type="number"
                        value={sessionsPerWeek}
                        onChange={(e) => setSessionsPerWeek(+e.target.value)}
                        min={1}
                        max={7}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Training frequency per week</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border p-4 rounded-lg space-y-4">
                <h3 className="font-medium text-lg">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    <Input
                      value={clientAge}
                      onChange={(e) => setClientAge(e.target.value)}
                      className="mt-1"
                      placeholder="e.g. 32"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={clientGender}
                      onValueChange={(val) => setClientGender(val as any)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label>Client Goals</Label>
                    <HelpTooltip 
                      character="coach" 
                      content="Be specific about what the client wants to achieve with this session/program. The plan will be tailored to these objectives."
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </HelpTooltip>
                  </div>
                  <Input
                    placeholder="e.g. Fat loss, muscle gain, sports performance..."
                    value={clientGoals}
                    onChange={(e) => setClientGoals(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label>Exercise Experience</Label>
                    <HelpTooltip 
                      character="coach" 
                      content="The client's training history and experience level. This helps determine exercise complexity and intensity."
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </HelpTooltip>
                  </div>
                  <Select
                    value={clientExperience}
                    onValueChange={(val) => setClientExperience(val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                      <SelectItem value="novice">Novice (6-12 months)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                      <SelectItem value="athlete">Competitive Athlete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label>Health Considerations</Label>
                    <HelpTooltip 
                      character="physiotherapist" 
                      content="Any injuries, medical conditions or physical limitations that should be considered when designing the workout."
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </HelpTooltip>
                  </div>
                  <Input
                    placeholder="e.g. Knee pain, lower back issues, pregnancy, heart condition..."
                    value={clientLimitations}
                    onChange={(e) => setClientLimitations(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {personalStep === 2 && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">Training Environment</h3>
                  <HelpTooltip 
                    character="coach" 
                    content="The training location and available equipment significantly impact the exercise selection and workout structure."
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                
                <div>
                  <Label>Facility Type</Label>
                  <Select
                    value={trainingLocation}
                    onValueChange={(val) => setTrainingLocation(val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Where the training will take place</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Available Equipment</h3>
                  <HelpTooltip 
                    character="gym-buddy" 
                    content="Select the equipment available for this session. Be specific about what the client can access."
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPersonalEquipment("Dumbbells, Kettlebells, Resistance Bands, Stability Ball, Bench")}
                  >
                    Standard Gym
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPersonalEquipment("Dumbbells, Barbell, Squat Rack, Bench, Cable Machine, Leg Press")}
                  >
                    Full Commercial Gym
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPersonalEquipment("Dumbbells (Light), Resistance Bands, Exercise Mat, Stability Ball")}
                  >
                    Home Gym
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPersonalEquipment("Bodyweight only")}
                  >
                    Bodyweight Only
                  </Button>
                </div>
                
                <div>
                  <Label>Equipment List</Label>
                  <Input
                    placeholder="Comma-separated list: e.g. dumbbells, barbell, bench, pull-up bar..."
                    value={personalEquipment}
                    onChange={(e) => setPersonalEquipment(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    List all equipment available, separated by commas
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {personalStep === 3 && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">Session Focus</h3>
                  <HelpTooltip 
                    character="coach" 
                    content="Define the primary goals and focal points for this training session or program."
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                
                <div>
                  <Label>Primary Goal</Label>
                  <Select
                    value={personalGoal}
                    onValueChange={(val) => setPersonalGoal(val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {personalGoals.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="functional">Functional Fitness</SelectItem>
                      <SelectItem value="flexibility">Flexibility & Mobility</SelectItem>
                      <SelectItem value="power">Power & Explosiveness</SelectItem>
                      <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Main focus of the workout</p>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label>Body Focus Areas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {[
                      "Full Body", "Upper Body", "Lower Body", "Core", "Back", "Chest", 
                      "Shoulders", "Arms", "Legs", "Glutes", "Cardio", "Mobility"
                    ].map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                          onCheckedChange={(checked) => {
                            // You'd need to add state for these focus areas
                            // For now, this is just UI without the state management
                          }}
                        />
                        <Label 
                          htmlFor={`area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                          className="cursor-pointer text-sm"
                        >
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Session Structure</h3>
                  <HelpTooltip 
                    character="coach" 
                    content="Determine how long the session will be and what components to include."
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Duration</Label>
                    <Select defaultValue="60">
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes (standard)</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Intensity Level</Label>
                    <Select defaultValue="moderate">
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light (Recovery/Introduction)</SelectItem>
                        <SelectItem value="moderate">Moderate (Standard)</SelectItem>
                        <SelectItem value="challenging">Challenging (Advanced)</SelectItem>
                        <SelectItem value="intense">Very Intense (Elite)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Include Components</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      {id: "warmup", label: "Warmup Section"}, 
                      {id: "mobility", label: "Mobility Work"},
                      {id: "activation", label: "Activation Exercises"}, 
                      {id: "main", label: "Main Workout"},
                      {id: "cooldown", label: "Cooldown"}, 
                      {id: "stretching", label: "Stretching Routine"}
                    ].map((component) => (
                      <div key={component.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`component-${component.id}`}
                          defaultChecked={component.id === "warmup" || component.id === "main" || component.id === "cooldown"}
                        />
                        <Label 
                          htmlFor={`component-${component.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {component.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {personalStep === 4 && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">Training Methodology</h3>
                  <HelpTooltip 
                    character="scientist" 
                    content="Select the training methods and approaches you want to incorporate in this workout plan."
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                
                <div>
                  <Label>Preferred Circuit Types</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {[
                      {id: "strength", label: "Strength Focus", desc: "Heavy weights, lower reps, longer rest periods"},
                      {id: "hypertrophy", label: "Hypertrophy", desc: "Moderate weights, moderate reps, focus on muscle growth"},
                      {id: "endurance", label: "Muscular Endurance", desc: "Higher reps, shorter rest, continuous tension"},
                      {id: "superset", label: "Supersets", desc: "Pairs of exercises performed back-to-back"},
                      {id: "circuit", label: "Circuit Training", desc: "Multiple exercises performed in sequence"},
                      {id: "hiit", label: "HIIT", desc: "High-intensity intervals with brief rest periods"},
                      {id: "emom", label: "EMOM", desc: "Every Minute On the Minute timing format"},
                      {id: "power", label: "Power Training", desc: "Explosive movements with sufficient recovery"}
                    ].map((ct) => {
                      const checked = personalCircuitTypes.includes(ct.id);
                      return (
                        <div key={ct.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-secondary/5 transition-colors">
                          <Checkbox
                            id={`circuit-${ct.id}`}
                            checked={checked}
                            onCheckedChange={(val) => {
                              if (val) {
                                setPersonalCircuitTypes((prev) => [...prev, ct.id]);
                              } else {
                                setPersonalCircuitTypes((prev) =>
                                  prev.filter((x) => x !== ct.id),
                                );
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <Label htmlFor={`circuit-${ct.id}`} className="cursor-pointer font-medium">{ct.label}</Label>
                            <p className="text-xs text-muted-foreground">{ct.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="border p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Additional Notes</h3>
                  <HelpTooltip 
                    character="coach" 
                    content="Any special considerations or requirements for this session that haven't been covered elsewhere."
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </HelpTooltip>
                </div>
                
                <textarea
                  className="w-full p-3 border rounded-md mt-2"
                  rows={3}
                  placeholder="Add any additional notes or requirements for this training session..."
                ></textarea>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium">Review Summary</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <p><strong>Plan Type:</strong> {planType === "oneoff" ? "Single Session" : `${programWeeks}-Week Program (${sessionsPerWeek} sessions/week)`}</p>
                  <p><strong>Client:</strong> {clientAge ? `${clientAge} year old ` : ""}{clientGender} with {clientExperience || "unspecified"} experience</p>
                  <p><strong>Goals:</strong> {clientGoals || "Not specified"}</p>
                  <p><strong>Training Environment:</strong> {locationOptions.find(l => l.value === trainingLocation)?.label || "Not specified"}</p>
                  <p><strong>Equipment:</strong> {personalEquipment || "Not specified"}</p>
                  <p><strong>Focus:</strong> {personalGoals.find(g => g.value === personalGoal)?.label || "Not specified"}</p>
                  <p><strong>Training Methods:</strong> {personalCircuitTypes.length ? personalCircuitTypes.join(", ") : "Not specified"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {personalStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
              Previous
            </Button>
          )}
          {personalStep < 4 ? (
            <Button onClick={nextStep} className="ml-auto">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitPersonalPlan} className="ml-auto">
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Personal Training Plan...
                </>
              ) : (
                "Generate Personal Training Plan"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Generate new session plan template
  function generateSessionPlanTemplate() {
    // Create a session plan based on the selected plan
    // Extract exercises and details from the generated workout plan
    const usedEquipment = selectedEquipment.length > 0 
      ? selectedEquipment 
      : (sessionType === "group" ? equipmentOptions.slice(0, 8) : ["Dumbbells", "Kettlebells", "Resistance Bands"]);
    
    // Create a detailed session plan based on the workout type and selected equipment
    const workoutType = sessionType === "group" ? "Group Training" : "Personal Training";
    const workoutFocus = selectedPlan && selectedPlan.introduction && selectedPlan.introduction.objectives 
      ? selectedPlan.introduction.objectives[0] 
      : (personalGoal ? personalGoals.find(g => g.value === personalGoal)?.label : "Full Body Workout");
    
    // Extract some exercises from the generated workout plan if available
    let extractedExercises: string[] = [];
    let exerciseDetails: { [key: string]: { reps?: string, load?: string, technique?: string } } = {};
    
    if (selectedPlan && selectedPlan.mainWorkout) {
      selectedPlan.mainWorkout.forEach(circuit => {
        circuit.exercises.forEach(ex => {
          extractedExercises.push(ex.exercise);
          exerciseDetails[ex.exercise] = {
            reps: ex.reps || "10-12 reps",
            load: ex.men || ex.woman || "Moderate",
            technique: ex.technique || "Focus on proper form"
          };
        });
      });
    }
    
    // Determine appropriate weights based on the workout type
    const weights = workoutType === "Group Training" 
      ? ["Light dumbbells (2-5kg)", "Medium dumbbells (6-10kg)", "Heavy dumbbells (12-20kg)"]
      : ["Client-specific weights", "Adjustable dumbbells", "Weight plates for barbell"];
    
    // Generate appropriate machine setup based on location
    const machines = trainingLocation === "Gym" 
      ? ["Cable Machine", "Leg Press", "Lat Pulldown", "Chest Press"]
      : (trainingLocation === "Home" ? ["Adjustable Bench", "Pull-up Bar"] : ["Portable Equipment"]);
    
    // Create a plan following the required structure with expanded details
    const sampleSessionPlan: SessionPlan = {
      sessionDetails: {
        sessionType: workoutType,
        clientName: clientData?.fullName || "Client",
        coach: "Coach Pete",
        duration: "45 Minutes",
        location: trainingLocation || "Gym",
        date: new Date().toLocaleDateString(),
        focus: workoutFocus as string
      },
      equipmentNeeded: {
        equipmentList: usedEquipment,
        weights: weights,
        machines: machines.slice(0, 2),
        other: "Water bottle, towel, training shoes, and comfortable clothes"
      },
      warmup: {
        explanation: "Begin with these dynamic movements to increase core temperature, enhance joint mobility, and prepare the neuromuscular system for the workout ahead.",
        exercises: [
          { exercise: "Arm Circles", durationOrReps: "30 seconds", notes: "Both directions, gradually increasing range of motion" },
          { exercise: "Bodyweight Squats", durationOrReps: "12 reps", notes: "Focus on keeping chest up, knees tracking with toes" },
          { exercise: "Walkouts", durationOrReps: "6 reps", notes: "Slow and controlled, engage core throughout movement" },
          { exercise: "Shoulder Taps in Plank", durationOrReps: "20 seconds", notes: "Maintain stable hips, avoid rotation" }
        ]
      },
      mainWorkout: [
        {
          blockTitle: "WORKOUT BLOCK 1: POWER & STRENGTH",
          format: "3 rounds, 40 sec work/20 sec rest",
          explanation: "Complete all exercises in sequence with minimal rest between exercises. Rest 2 minutes between rounds. Focus on quality movement and maintaining form throughout.",
          exercises: [
            { 
              exercise: extractedExercises[0] || "Kettlebell Swings", 
              repsOrTime: "40 seconds", 
              rest: "20 seconds",
              load: "Medium-heavy weight",
              notes: "Power through hips, maintain neutral spine", 
              technique: "Hinge at hips, snap to standing, keep shoulders packed down" 
            },
            { 
              exercise: extractedExercises[1] || "Push-ups", 
              repsOrTime: "40 seconds", 
              rest: "20 seconds",
              load: "Body weight",
              notes: "Modify on knees if needed for proper form", 
              technique: "Maintain straight line from head to heels, elbows at 45°" 
            },
            { 
              exercise: extractedExercises[2] || "Goblet Squats", 
              repsOrTime: "40 seconds", 
              rest: "20 seconds", 
              load: "Moderate dumbbell/kettlebell",
              notes: "Keep weight in heels, chest up throughout", 
              technique: "Knees track with toes, maintain upright torso" 
            },
            { 
              exercise: extractedExercises[3] || "Plank Hold", 
              repsOrTime: "40 seconds", 
              rest: "20 seconds",
              load: "Body weight",
              notes: "Engage core throughout, breathe normally", 
              technique: "Shoulders over elbows, maintain straight line from head to heels" 
            }
          ]
        },
        {
          blockTitle: "WORKOUT BLOCK 2: ENDURANCE & CONDITIONING",
          format: "AMRAP in 10 minutes",
          explanation: "Complete as many rounds as possible in 10 minutes. Focus on maintaining consistent pace and quality movement. Record total rounds completed for progress tracking.",
          exercises: [
            { 
              exercise: extractedExercises[4] || "Dumbbell Rows", 
              repsOrTime: "8 each side", 
              rest: "Minimal",
              load: "Moderate weight",
              notes: "Focus on back engagement, avoid shoulder shrugging", 
              technique: "Pull elbow back, squeeze shoulder blade at top" 
            },
            { 
              exercise: extractedExercises[5] || "Walking Lunges", 
              repsOrTime: "10 each leg", 
              rest: "Minimal",
              load: "Body weight or light dumbbells",
              notes: "Step length appropriate to client height", 
              technique: "Front knee tracks over ankle, back knee lowers toward floor" 
            },
            { 
              exercise: extractedExercises[6] || "Mountain Climbers", 
              repsOrTime: "20 total", 
              rest: "Minimal",
              load: "Body weight",
              notes: "Maintain pace appropriate to fitness level", 
              technique: "Keep hips stable, alternate knees driving toward chest" 
            }
          ]
        },
        {
          blockTitle: "WORKOUT BLOCK 3: TARGETED FOCUS",
          format: "3 sets, prescribed reps, 45 sec rest between sets",
          explanation: "Complete all prescribed repetitions with excellent form. Rest 45 seconds between sets and 90 seconds between exercises. Adjust weights as needed to maintain proper technique.",
          exercises: [
            { 
              exercise: extractedExercises[7] || "Dumbbell Shoulder Press", 
              repsOrTime: "12 repetitions", 
              rest: "45 seconds between sets",
              load: "Moderate dumbbells",
              notes: "Avoid arching lower back", 
              technique: "Start with dumbbells at shoulder height, press directly overhead" 
            },
            { 
              exercise: extractedExercises[8] || "Dumbbell Romanian Deadlift", 
              repsOrTime: "10 repetitions", 
              rest: "45 seconds between sets",
              load: "Moderate-heavy dumbbells",
              notes: "Hamstring focus, feel stretch but not strain", 
              technique: "Hinge at hips, soft knees, weights close to legs throughout" 
            }
          ]
        }
      ],
      extraWork: {
        explanation: "If time permits and energy levels are sufficient, complete these additional exercises to address specific goals. These exercises target areas for improvement identified from previous sessions.",
        exercises: [
          { 
            exercise: "Tricep Dips", 
            sets: "3", 
            reps: "12", 
            load: "Body weight",
            notes: "Use bench or sturdy chair, shoulders down away from ears" 
          },
          { 
            exercise: "Bicep Curls", 
            sets: "3", 
            reps: "12", 
            load: "Light to medium weight",
            notes: "Control throughout full range of motion, avoid swinging" 
          },
          { 
            exercise: "Core Rotations", 
            sets: "2", 
            reps: "15 each side", 
            load: "Light medicine ball or weight",
            notes: "Engage core throughout, focus on rotation through torso" 
          }
        ]
      },
      cooldown: {
        explanation: "These exercises help gradually reduce heart rate, begin recovery processes, and improve flexibility of worked muscles. Focus on breathing deeply and releasing tension with each exhale.",
        exercises: [
          { 
            exercise: "Child's Pose", 
            duration: "45 seconds", 
            notes: "Deep breathing, arms extended, gentle stretch through back" 
          },
          { 
            exercise: "Hamstring Stretch", 
            duration: "30 seconds each leg", 
            notes: "Gentle tension, avoid bouncing, keep back neutral" 
          },
          { 
            exercise: "Chest Stretch Against Wall", 
            duration: "30 seconds each arm", 
            notes: "Place palm on wall, gently rotate away to feel stretch" 
          },
          { 
            exercise: "Quad Stretch", 
            duration: "30 seconds each leg", 
            notes: "Use wall or chair for balance if needed" 
          },
          { 
            exercise: "Deep Breathing", 
            duration: "1 minute", 
            notes: "Inhale for 4 counts, hold for 2, exhale for 6 counts" 
          }
        ]
      },
      machineSetupGuide: {
        explanation: "For optimal safety and effectiveness, set up machines according to these client-specific guidelines. Proper setup ensures appropriate joint alignment and optimal muscle engagement throughout exercises.",
        machines: [
          { 
            machine: "Cable Machine", 
            setupInstructions: "Set to hip height for rows (handle in line with navel), shoulder height for pushes. Adjust pin to appropriate weight based on exercise and client strength level." 
          },
          { 
            machine: "Adjustable Bench", 
            setupInstructions: "For flat press: ensure bench is completely flat. For incline: set to 30-45 degrees based on client comfort. For seated exercises: set to 90 degrees with back support." 
          },
          { 
            machine: "Leg Press", 
            setupInstructions: "Adjust seat so knees form 90° angle at bottom position. Feet shoulder-width apart, placed mid-platform. Start with lighter weight to assess proper form." 
          }
        ]
      },
      closingMessage: "Excellent effort today! This session was specifically designed to target your goals of improving overall strength and endurance. Your form has improved significantly on compound movements, and your work capacity is showing meaningful progress. Remember to stay hydrated throughout the day and aim for protein intake within 30-60 minutes post-workout to support recovery. Your consistency is paying off!",
      progressNotes: [
        "Client completed all exercises with proper form and good intensity",
        "Increased weight on goblet squats from 10kg to 12kg since last session",
        "Demonstrated improved hip mobility during squats and lunges",
        "Core stability has improved - maintained plank with good form for full duration",
        "Successfully completed 4.5 rounds of AMRAP block (up from 4 rounds in previous session)"
      ],
      clientFeedback: [
        "Reported slight knee discomfort during lunges - modified to reduce range of motion",
        "Enjoys the interval training format - feels challenged but not overwhelmed",
        "Requested more core work in future sessions"
      ],
      progressSummary: {
        improvements: [
          "Squat mechanics have improved significantly",
          "Upper body pushing strength increasing steadily",
          "Overall workout capacity has increased by approximately 15%"
        ],
        challenges: [
          "Still needs attention on shoulder mobility for overhead movements",
          "Core engagement during compound movements needs reinforcement",
          "Tendency to rush through repetitions when fatigue sets in"
        ],
        nextFocusAreas: [
          "Introduce more unilateral exercises to address minor imbalances",
          "Progress to more advanced core exercises",
          "Focus on eccentric control during lower body exercises"
        ]
      },
      nextSessionPreparation: [
        "☑ Focus on upper body strength during next session to address imbalances",
        "☑ Prepare more complex core exercises for progression",
        "☑ Incorporate targeted mobility work for shoulders",
        "☑ Plan for cardiovascular conditioning with increased work intervals",
        "☑ Client should practice hip hinge pattern at home between sessions"
      ]
    };
    
    setSessionPlan(sampleSessionPlan);
    setShowNewTemplate(true);
  }
  
  // Render the session plan template
  function renderSessionPlanTemplate() {
    if (!sessionPlan || !showNewTemplate) return null;
    
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Session Plan Template</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowNewTemplate(false)}
          >
            Back to Generator
          </Button>
        </div>
        <div className="border rounded-lg p-1 bg-card">
          <SessionPlanTemplate 
            plan={sessionPlan} 
            onExportPdf={() => {
              toast({ 
                title: "PDF Export", 
                description: "PDF export functionality will be implemented soon." 
              });
            }}
            onExportNotion={() => {
              toast({ 
                title: "Notion Export", 
                description: "Notion export functionality will be implemented soon." 
              });
            }}
          />
        </div>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="relative space-y-6">
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-lg">Generating Plan...</p>
        </div>
      )}

      {/* Show template selection if nothing else is displayed */}
      {!selectedPlan && !showNewTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Workout Plan Type</CardTitle>
              <HelpTooltip 
                character="coach" 
                content="Select the type of workout you want to create. Group classes are designed for multiple participants, while personal training is tailored to individual clients."
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </HelpTooltip>
            </div>
            <CardDescription>Choose your session format and details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Session Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Session Format</Label>
                <RadioGroup
                  value={sessionType}
                  onValueChange={(val) => setSessionType(val as SessionType)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex flex-col space-y-2 px-4 py-3 border rounded-md bg-secondary/5 hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="personal" id="personal-option" />
                        <FormLabel htmlFor="personal-option" className="font-medium">Personal Training</FormLabel>
                      </div>
                      <HelpTooltip 
                        character="physio" 
                        content="Personal training plans are customized for individual clients. These workouts are tailored to specific goals, limitations, and equipment availability."
                        side="top"
                      >
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </HelpTooltip>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">One-on-one training sessions tailored to client's specific needs and goals</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 px-4 py-3 border rounded-md bg-secondary/5 hover:bg-secondary/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="group-option" />
                        <FormLabel htmlFor="group-option" className="font-medium">Group Class</FormLabel>
                      </div>
                      <HelpTooltip 
                        character="gym-buddy" 
                        content="Group classes are high-energy workouts designed for multiple participants. Great for creating HIIT, circuit training, and other formats that work well in a group setting."
                        side="top"
                      >
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </HelpTooltip>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">Group sessions for multiple participants with shared fitness objectives</p>
                  </div>
                </RadioGroup>
              </div>

              {/* Plan Type */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Plan Duration</Label>
                <Select
                  value={planType}
                  onValueChange={(val) => setPlanType(val as PlanType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oneoff">Single Session</SelectItem>
                    <SelectItem value="program">Structured Program</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {planType === "oneoff" 
                    ? "Create a detailed plan for a single workout session" 
                    : "Design a progressive program with multiple sessions"}
                </p>
              </div>

              {/* Fitness Level - Common to both types */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Fitness Level</Label>
                <Select
                  value={groupFitnessLevel}
                  onValueChange={(val) => setGroupFitnessLevel(val as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Session Type Specific Options */}
              {sessionType === "group" ? (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Group Class Details</h3>
                  
                  <div className="space-y-2">
                    <Label>Class Type</Label>
                    <Select
                      value={groupClassType}
                      onValueChange={(val) => setGroupClassType(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class type" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupClassTypes.map((ct) => (
                          <SelectItem key={ct.value} value={ct.value}>
                            {ct.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">The focus and style of your group class</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Participant Count</Label>
                      <Input
                        type="number"
                        value={participantCount}
                        onChange={(e) => setParticipantCount(+e.target.value)}
                        min={2}
                        max={30}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Workout Format</Label>
                      <Select
                        value={participantFormat}
                        onValueChange={(val) => setParticipantFormat(val as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="groups">Groups</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      if (sessionType === "group") {
                        // Continue to next step
                        // For now just render the group flow directly
                      }
                    }}
                    className="w-full mt-2"
                  >
                    Continue to Group Setup
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Personal Training Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client Age</Label>
                      <Input
                        type="text"
                        value={clientAge}
                        onChange={(e) => setClientAge(e.target.value)}
                        placeholder="e.g. 35"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Client Gender</Label>
                      <Select
                        value={clientGender}
                        onValueChange={(val) => setClientGender(val as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Client Goals</Label>
                    <Input
                      placeholder="e.g. Weight loss, muscle gain, etc."
                      value={clientGoals}
                      onChange={(e) => setClientGoals(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Limitations/Injuries</Label>
                    <Input
                      placeholder="e.g. Knee pain, lower back issues, etc."
                      value={clientLimitations}
                      onChange={(e) => setClientLimitations(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Training Location</Label>
                    <Select
                      value={trainingLocation}
                      onValueChange={(val) => setTrainingLocation(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={() => setPersonalStep(1)}
                    className="w-full mt-2"
                  >
                    Continue to Personal Training Setup
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* GROUP */}
      {!selectedPlan && sessionType === "group" && renderGroupFlow()}
      {/* PERSONAL */}
      {!selectedPlan && sessionType === "personal" && renderPersonalWizard()}

      {/* Format Editor Dialog (Group) */}
      {renderFormatEditor()}

      {/* If plan is generated, show final card */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center w-full">
              <span>Generated Plan</span>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                {selectedPlan.id ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              {selectedPlan.introduction?.overview || "Your plan is ready."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <div>
              <h3 className="text-lg font-semibold">Introduction</h3>
              <p>
                <strong>Intensity:</strong>{" "}
                {selectedPlan.introduction?.intensity}
              </p>
              <p>
                <strong>Preparation:</strong>{" "}
                {selectedPlan.introduction?.preparation}
              </p>
              {selectedPlan.introduction?.objectives?.length ? (
                <div className="mt-2">
                  <h4 className="font-medium">Objectives</h4>
                  <ul className="list-disc pl-5">
                    {selectedPlan.introduction.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Main Workout */}
            <div>
              <h3 className="text-lg font-semibold">Main Workout</h3>
              {selectedPlan.mainWorkout.map((circuit, i) => (
                <Card key={i} className="border mt-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Circuit {circuit.circuitNumber}
                    </CardTitle>
                    <CardDescription>{circuit.objective}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{circuit.explanation}</p>
                    <p className="font-medium mt-2">
                      Setup: {circuit.setupInstructions}
                    </p>
                    <Table className="mt-3">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exercise</TableHead>
                          <TableHead>Sets</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead>Technique</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {circuit.exercises.map((ex, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{ex.exercise}</TableCell>
                            <TableCell>{ex.sets}</TableCell>
                            <TableCell>{ex.reps}</TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="link" className="p-0 h-auto">
                                    View
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {ex.exercise}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      <p>
                                        <strong>Technique:</strong>{" "}
                                        {ex.technique}
                                      </p>
                                      {ex.notes && (
                                        <p>
                                          <strong>Notes:</strong> {ex.notes}
                                        </p>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogAction>OK</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recovery */}
            <div>
              <h3 className="text-lg font-semibold">Recovery</h3>
              {selectedPlan.recovery?.immediateSteps?.length ? (
                <div>
                  <h4 className="font-medium">Immediate Steps</h4>
                  <ul className="list-disc pl-5">
                    {selectedPlan.recovery.immediateSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {selectedPlan.recovery?.nutritionTips?.length ? (
                <div className="mt-2">
                  <h4 className="font-medium">Nutrition Tips</h4>
                  <ul className="list-disc pl-5">
                    {selectedPlan.recovery.nutritionTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {selectedPlan.recovery?.restRecommendations && (
                <p className="mt-2">
                  <strong>Rest Recommendations:</strong>{" "}
                  {selectedPlan.recovery.restRecommendations}
                </p>
              )}
              {selectedPlan.recovery?.nextDayGuidance && (
                <p className="mt-2">
                  <strong>Next Day Guidance:</strong>{" "}
                  {selectedPlan.recovery.nextDayGuidance}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <div className="flex items-center gap-2">
              <HelpTooltip 
                character="yoga-instructor" 
                content="Generate a detailed session template with warmup, main exercise blocks, cooldown, and equipment guidance. Perfect for sharing with clients!"
                side="top"
              >
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </HelpTooltip>
              <Button 
                variant="outline" 
                onClick={generateSessionPlanTemplate}
              >
                Create Session Template
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Render the session plan template if it's active */}
      {showNewTemplate && renderSessionPlanTemplate()}
    </div>
  );
}