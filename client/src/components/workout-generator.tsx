import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
import { Loader2, FileText, Download, ChevronRight } from "lucide-react";
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
      equipment: [
        "Dumbbells", "Kettlebells", "Plyo Boxes", "Concept 2 Rowers",
        "Ski Erg Machines", "Watt Bike", "Spin Bike", "Sledge",
        "Battle Ropes", "Bodybar with plates", "Step up Box", "Yoga Matt"
      ],
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
      <Card>
        <CardHeader>
          <CardTitle>Group Class Setup</CardTitle>
          <CardDescription>
            Choose your class type, participants, and define formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Class Type */}
          <div>
            <Label>Class Type</Label>
            <Select
              value={groupClassType}
              onValueChange={(val) => setGroupClassType(val)}
            >
              <SelectTrigger>
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
          </div>

          {/* Fitness Level */}
          <div>
            <Label>Group Fitness Level</Label>
            <Select
              value={groupFitnessLevel}
              onValueChange={(val) => setGroupFitnessLevel(val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          <div>
            <Label>Number of Participants</Label>
            <Input
              type="number"
              value={participantCount}
              onChange={(e) => setParticipantCount(+e.target.value)}
            />
          </div>
          <div>
            <Label>Workout Format</Label>
            <Select
              value={participantFormat}
              onValueChange={(val) => setParticipantFormat(val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="groups">Groups (3-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {participantFormat === "groups" && (
            <div>
              <Label>Group Size</Label>
              <Input
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(+e.target.value)}
              />
            </div>
          )}

          {/* Circuit Preferences */}
          <div className="border p-3 rounded-md space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={stationRotation}
                onCheckedChange={(val) => setStationRotation(!!val)}
              />
              <Label>Station Rotation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={restBetweenStations}
                onCheckedChange={(val) => setRestBetweenStations(!!val)}
              />
              <Label>Rest Between Stations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={mixedEquipmentStations}
                onCheckedChange={(val) => setMixedEquipmentStations(!!val)}
              />
              <Label>Mixed Equipment Stations</Label>
            </div>
          </div>

          {/* Class Formats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Class Formats</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFormatTemplate("hiit-standard")}
                >
                  Load HIIT Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFormatTemplate("strength-circuit")}
                >
                  Load Strength Template
                </Button>
                <Button size="sm" onClick={addFormat}>
                  Add Format
                </Button>
              </div>
            </div>
            {classFormats.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-md">
                No formats yet. Add or load a template.
              </div>
            ) : (
              <div className="space-y-2">
                {classFormats.map((fmt, idx) => {
                  const fmtOption = classFormatOptions.find(
                    (o) => o.id === fmt.type,
                  );
                  return (
                    <Card key={idx} className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {fmtOption ? fmtOption.name : fmt.type}
                        </CardTitle>
                        <CardDescription>{fmt.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Rounds: {fmt.rounds || "?"} | Work:{" "}
                          {fmt.workInterval || "?"}s | Rest:{" "}
                          {fmt.restInterval || "?"}s
                        </p>
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
        <CardFooter>
          <Button className="w-full" onClick={handleSubmitGroupPlan}>
            {generateMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Group Plan"
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

  // EDITOR for Add/Edit Format
  function renderFormatEditor() {
    if (!showFormatEditor) return null;

    // If editing an existing format
    useEffect(() => {
      if (showFormatEditor) {
        const existing = editingIndex !== null ? classFormats[editingIndex] : undefined;
        setLocalType(existing?.type || "tabata");
        setLocalRounds(existing?.rounds || "");
        setLocalWork(existing?.workInterval || "");
        setLocalRest(existing?.restInterval || "");
        setLocalDesc(existing?.description || "");
      }
    }, [showFormatEditor, editingIndex, classFormats]);

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
              <Label>Format Type</Label>
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
                <Label>Rounds</Label>
                <Input
                  type="text"
                  value={localRounds}
                  onChange={(e) => setLocalRounds(e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
              <div>
                <Label>Work Interval (s)</Label>
                <Input
                  type="text"
                  value={localWork}
                  onChange={(e) => setLocalWork(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>
              <div>
                <Label>Rest Interval (s)</Label>
                <Input
                  type="text"
                  value={localRest}
                  onChange={(e) => setLocalRest(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <Label>Description</Label>
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
          <CardTitle>Personal Training Wizard</CardTitle>
          <CardDescription>Step {personalStep} of 4</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {personalStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Plan Type</Label>
                <RadioGroup
                  value={planType}
                  onValueChange={(val) => setPlanType(val as PlanType)}
                >
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="oneoff" />
                    <FormLabel>Single Session</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="program" />
                    <FormLabel>12-Week Program</FormLabel>
                  </FormItem>
                </RadioGroup>
              </div>
              {planType === "program" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Program Duration (weeks)</Label>
                    <Input
                      type="number"
                      value={programWeeks}
                      onChange={(e) => setProgramWeeks(+e.target.value)}
                      min={4}
                      max={24}
                    />
                  </div>
                  <div>
                    <Label>Sessions Per Week</Label>
                    <Input
                      type="number"
                      value={sessionsPerWeek}
                      onChange={(e) => setSessionsPerWeek(+e.target.value)}
                      min={1}
                      max={7}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input
                    value={clientAge}
                    onChange={(e) => setClientAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={clientGender}
                    onValueChange={(val) => setClientGender(val as any)}
                  >
                    <SelectTrigger>
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
                <Label>Goals</Label>
                <Input
                  placeholder="Fat loss, muscle gain..."
                  value={clientGoals}
                  onChange={(e) => setClientGoals(e.target.value)}
                />
              </div>
              <div>
                <Label>Limitations/Injuries</Label>
                <Input
                  placeholder="E.g. knee pain"
                  value={clientLimitations}
                  onChange={(e) => setClientLimitations(e.target.value)}
                />
              </div>
              <div>
                <Label>Exercise Experience</Label>
                <Input
                  placeholder="Beginner? Some sports?"
                  value={clientExperience}
                  onChange={(e) => setClientExperience(e.target.value)}
                />
              </div>
            </div>
          )}
          {personalStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Training Location</Label>
                <Select
                  value={trainingLocation}
                  onValueChange={(val) => setTrainingLocation(val)}
                >
                  <SelectTrigger>
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
              </div>
              <div>
                <Label>Equipment</Label>
                <Input
                  placeholder="Comma-separated list: dumbbells, barbell..."
                  value={personalEquipment}
                  onChange={(e) => setPersonalEquipment(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll parse by commas
                </p>
              </div>
            </div>
          )}
          {personalStep === 3 && (
            <div className="space-y-4">
              <Label>Primary Goal</Label>
              <Select
                value={personalGoal}
                onValueChange={(val) => setPersonalGoal(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {personalGoals.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {personalStep === 4 && (
            <div className="space-y-4">
              <Label>Preferred Circuit Types</Label>
              <div className="space-y-2">
                {["strength", "hypertrophy", "endurance", "superset"].map(
                  (ct) => {
                    const checked = personalCircuitTypes.includes(ct);
                    return (
                      <div key={ct} className="flex items-center space-x-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) => {
                            if (val) {
                              setPersonalCircuitTypes((prev) => [...prev, ct]);
                            } else {
                              setPersonalCircuitTypes((prev) =>
                                prev.filter((x) => x !== ct),
                              );
                            }
                          }}
                        />
                        <Label>{ct}</Label>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {personalStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
          {personalStep < 4 ? (
            <Button onClick={nextStep}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitPersonalPlan}>
              {generateMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Plan"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
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

      {!selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Session Type</CardTitle>
            <CardDescription>Choose Group or Personal</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={sessionType}
              onValueChange={(val) => setSessionType(val as SessionType)}
            >
              <FormItem className="flex items-center space-x-2">
                <RadioGroupItem value="group" />
                <FormLabel>Group Class</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="personal" />
                <FormLabel>Personal Training</FormLabel>
              </FormItem>
            </RadioGroup>
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
        </Card>
      )}
    </div>
  );
}