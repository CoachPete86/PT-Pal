import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Loader2, Download, FileText } from "lucide-react";
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
  CheckCircle2,
  AlertCircle,
  Home,
  Building,
  Warehouse,
  Footprints,
  Weight,
  ChevronRight,
  Zap,
  LucideIcon
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface WorkoutPlan {
  id?: number;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
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

// Add validation schema with conditional fields based on session type
// Update schema to include session type
type SessionType = "group" | "personal";
type ClassFormatType = "amrap" | "emom" | "tabata" | "rep-based" | "timed-sets" | "ladder" | "pyramid" | "complex" | "chipper" | "custom";

interface ClassFormat {
  type: ClassFormatType;
  workInterval?: number;
  restInterval?: number;
  rounds?: number;
  description?: string;
}

interface ClassFormatTemplate {
  id: string;
  name: string;
  classType: string;
  description: string;
  formats: ClassFormat[];
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
    types: z.array(z.string()).min(1, "Select at least one circuit type"),
    stationRotation: z.boolean(),
    restBetweenStations: z.boolean(),
    mixedEquipmentStations: z.boolean(),
  }),
  classFormats: z.array(z.object({
    type: z.enum(["amrap", "emom", "tabata", "rep-based", "timed-sets", "ladder", "pyramid", "complex", "chipper", "custom"]),
    workInterval: z.number().optional(),
    restInterval: z.number().optional(),
    rounds: z.number().optional(),
    description: z.string().optional(),
  })).optional(),
  equipment: z.array(z.string()).min(1, "Select at least one equipment item"),
  clientDetails: z.object({
    age: z.string(),
    gender: z.enum(["male", "female", "other"]),
    goals: z.string(),
    limitations: z.string().optional(),
    experience: z.string(),
  }).optional(),
  programDetails: z.object({
    weeks: z.number().min(1).max(24),
    sessionsPerWeek: z.number().min(1).max(7),
  }).optional(),
  useFullGym: z.boolean().default(false),
  // New fields for the equipment wizard
  wizardEnabled: z.boolean().default(true),
  trainingLocation: z.enum(["commercial-gym", "home-gym", "outdoor", "hybrid"]).optional(),
  workoutGoal: z.enum(["strength", "hypertrophy", "endurance", "weight-loss", "general-fitness"]).optional(),
  equipmentAvailability: z.enum(["minimal", "moderate", "extensive"]).optional(),
  specialtyEquipment: z.array(z.string()).default([]),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

// Equipment categories with nested items
const baseEquipment = {
  freeWeights: {
    category: "Free Weights",
    icon: Dumbbell,
    items: [
      { id: "dumbbells-light", label: "Dumbbells (2-10kg)", count: "Multiple pairs" },
      { id: "dumbbells-medium", label: "Dumbbells (12.5-22.5kg)", count: "Multiple pairs" },
      { id: "dumbbells-heavy", label: "Dumbbells (25-50kg)", count: "Multiple pairs" },
      { id: "kettlebells-light", label: "Kettlebells (8-16kg)", count: "2 of each" },
      { id: "kettlebells-heavy", label: "Kettlebells (20-32kg)", count: "2 of each" },
      { id: "plates", label: "Weight Plates (1.25-20kg)", count: "Multiple sets" },
      { id: "bodybar", label: "Weighted Bars (5-20kg)", count: "4 available" },
      { id: "barbell", label: "Olympic Barbell", count: "2 available" },
      { id: "ez-curl", label: "EZ Curl Bar", count: "1 available" },
    ],
  },
  cardio: {
    category: "Cardio Equipment",
    icon: Activity,
    items: [
      { id: "rower", label: "Concept 2 Rowers", count: "3 available" },
      { id: "skierg", label: "SkiErg Machines", count: "2 available" },
      { id: "assault-bike", label: "Assault Bike", count: "1 available" },
      { id: "wattbike", label: "Watt Bike", count: "1 available" },
      { id: "spinbike", label: "Spin Bikes", count: "2 available" },
      { id: "treadmill", label: "Treadmill", count: "1 available" },
      { id: "elliptical", label: "Elliptical", count: "1 available" },
    ],
  },
  functional: {
    category: "Functional Training",
    icon: Target,
    items: [
      { id: "plyobox", label: "Plyo Boxes (20/24/30\")", count: "2 sets" },
      { id: "stepbox", label: "Adjustable Step Platform", count: "4 available" },
      { id: "battleropes", label: "Battle Ropes (15m)", count: "2 sets" },
      { id: "sledge", label: "Training Sledge", count: "1 available" },
      { id: "trx", label: "TRX Suspension Trainers", count: "2 sets" },
      { id: "resistance-bands", label: "Resistance Bands (Light/Medium/Heavy)", count: "Multiple sets" },
      { id: "cables", label: "Cable Machine", count: "1 available" },
      { id: "bosu", label: "BOSU Ball", count: "2 available" },
      { id: "stability-ball", label: "Stability Ball", count: "2 available" },
    ],
  },
  recovery: {
    category: "Recovery & Mobility",
    icon: Heart,
    items: [
      { id: "foam-roller", label: "Foam Rollers", count: "4 available" },
      { id: "yogamat", label: "Yoga/Exercise Mats", count: "10 available" },
      { id: "mobility-bands", label: "Mobility Bands", count: "Multiple sets" },
      { id: "massage-balls", label: "Massage/Trigger Point Balls", count: "Set of 6" },
      { id: "lacrosse-ball", label: "Lacrosse Balls", count: "4 available" },
      { id: "rumble-roller", label: "Rumble Roller", count: "2 available" },
    ],
  },
  accessories: {
    category: "Accessories",
    icon: LayoutGrid,
    items: [
      { id: "timer", label: "Gym Timer", count: "2 available" },
      { id: "cones", label: "Training Cones", count: "Set of 12" },
      { id: "agility-ladder", label: "Agility Ladder", count: "2 available" },
      { id: "medicine-balls", label: "Medicine Balls (2-10kg)", count: "Set of 6" },
      { id: "slide-discs", label: "Slide Discs", count: "4 pairs" },
      { id: "balance-pad", label: "Balance Pad", count: "2 available" },
      { id: "jump-rope", label: "Jump Ropes", count: "4 available" },
      { id: "hurdles", label: "Adjustable Hurdles", count: "6 available" },
    ],
  },
};

// Training locations with equipment recommendations
const trainingLocations = [
  {
    id: "commercial-gym",
    name: "Commercial Gym",
    icon: Building,
    description: "Full-service fitness facility with extensive equipment options",
    recommended: ["dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "kettlebells-light", "kettlebells-heavy", 
                 "barbell", "ez-curl", "plates", "cables", "rower", "treadmill"]
  },
  {
    id: "home-gym",
    name: "Home Gym",
    icon: Home,
    description: "Limited equipment in a home setting",
    recommended: ["dumbbells-light", "dumbbells-medium", "kettlebells-light", "resistance-bands", "jump-rope", "yogamat"]
  },
  {
    id: "outdoor",
    name: "Outdoor Training",
    icon: Footprints,
    description: "Parks, beaches, or outdoor spaces with minimal equipment",
    recommended: ["resistance-bands", "jump-rope", "agility-ladder", "cones", "timer"]
  },
  {
    id: "hybrid",
    name: "Hybrid Environment",
    icon: Warehouse,
    description: "Mix of gym equipment and outdoor/functional training",
    recommended: ["dumbbells-light", "kettlebells-light", "resistance-bands", "medicine-balls", "trx", "agility-ladder"]
  }
];

interface WorkoutGoal {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  recommended: string[];
  forSessionType?: ("personal" | "group")[];
}

// Workout goals with equipment recommendations
const workoutGoals: WorkoutGoal[] = [
  {
    id: "strength",
    name: "Strength Building", 
    icon: Weight,
    description: "Heavy resistance training for maximum strength gains",
    recommended: ["barbell", "dumbbells-heavy", "kettlebells-heavy", "plates", "cables"],
    forSessionType: ["personal"]
  },
  {
    id: "hypertrophy",
    name: "Muscle Building",
    icon: Dumbbell,
    description: "Moderate weights with higher volume for muscle growth",
    recommended: ["dumbbells-medium", "dumbbells-heavy", "cables", "barbell", "ez-curl"],
    forSessionType: ["personal"]
  },
  {
    id: "endurance",
    name: "Muscular Endurance",
    icon: Clock,
    description: "Light to moderate weights with high repetitions",
    recommended: ["dumbbells-light", "kettlebells-light", "resistance-bands", "bodybar", "rower", "assault-bike"],
    forSessionType: ["personal", "group"]
  },
  {
    id: "weight-loss",
    name: "Weight Loss",
    icon: FlameKindling,
    description: "High-intensity workouts with minimal rest",
    recommended: ["kettlebells-light", "battle-ropes", "rower", "assault-bike", "jump-rope", "medicine-balls"],
    forSessionType: ["personal", "group"]
  },
  {
    id: "general-fitness",
    name: "Group Fitness",
    icon: Users,
    description: "Dynamic circuits for group training environments",
    recommended: ["dumbbells-light", "kettlebells-light", "resistance-bands", "medicine-balls", "cones", "agility-ladder"],
    forSessionType: ["group"]
  },
  {
    id: "hiit",
    name: "HIIT Training",
    icon: Zap,
    description: "High-intensity interval training with varied equipment",
    recommended: ["kettlebells-light", "battle-ropes", "plyobox", "medicine-balls", "jump-rope", "timer"],
    forSessionType: ["group"]
  }
];

// Equipment availability levels
const equipmentAvailability = [
  {
    id: "minimal",
    name: "Minimal",
    icon: Snowflake,
    description: "Basic equipment only (dumbbells, resistance bands, bodyweight)",
    recommended: ["dumbbells-light", "resistance-bands", "jump-rope", "yogamat", "timer"]
  },
  {
    id: "moderate",
    name: "Moderate",
    icon: ListChecks,
    description: "Standard home gym or small studio setup",
    recommended: ["dumbbells-light", "dumbbells-medium", "kettlebells-light", "resistance-bands", "medicine-balls", "trx"]
  },
  {
    id: "extensive",
    name: "Extensive",
    icon: ScrollText,
    description: "Full commercial gym or well-equipped training facility",
    maxItems: 25
  }
];

// Preset equipment groups for quick selection
const equipmentPresets = [
  // Group class-specific equipment presets
  {
    id: "hiit-class",
    name: "HIIT Class",
    description: "Equipment for high-intensity interval training",
    items: [
      "kettlebells-light", "medicine-balls", "jump-rope", "battle-ropes", 
      "cones", "timer", "agility-ladder", "plyobox"
    ]
  },
  {
    id: "circuit-class",
    name: "Circuit Training",
    description: "Versatile equipment for circuit stations",
    items: [
      "dumbbells-light", "kettlebells-light", "resistance-bands",
      "medicine-balls", "jump-rope", "cones", "timer", "yogamat"
    ]
  },
  {
    id: "bootcamp",
    name: "Bootcamp Class",
    description: "Dynamic equipment for intense group workouts",
    items: [
      "kettlebells-light", "medicine-balls", "battle-ropes",
      "agility-ladder", "cones", "jump-rope", "plyobox", "timer"
    ]
  },
  {
    id: "strength-class",
    name: "Group Strength",
    description: "Equipment for strength-focused group sessions",
    items: [
      "dumbbells-light", "dumbbells-medium", "kettlebells-light",
      "bodybar", "resistance-bands", "yogamat", "timer"
    ]
  },
  {
    id: "minimal",
    name: "Minimal Setup",
    description: "Basic equipment for home or limited gym access",
    items: [
      "dumbbells-light", "kettlebells-light", "resistance-bands", 
      "yogamat", "jump-rope", "timer"
    ]
  },
  {
    id: "bodyweight",
    name: "Bodyweight Focus",
    description: "Equipment to enhance bodyweight training",
    items: [
      "trx", "resistance-bands", "yogamat", "timer", 
      "agility-ladder", "plyobox"
    ]
  },
  {
    id: "standard-gym",
    name: "Standard Gym",
    description: "Common equipment found in most commercial gyms",
    items: [
      "dumbbells-light", "dumbbells-medium", "kettlebells-light",
      "plates", "barbell", "cables", "trx", "treadmill",
      "rower", "yogamat", "foam-roller"
    ]
  },
  {
    id: "full-gym",
    name: "Full Gym",
    description: "Complete access to all equipment",
    items: Object.values(baseEquipment).flatMap(category => 
      category.items.map(item => item.id)
    )
  }
];

// Specialty equipment for specific training goals
const specialtyEquipment = [
  { id: "olympic-lifting", name: "Olympic Lifting", items: ["olympic-platform", "bumper-plates", "lifting-blocks"] },
  { id: "powerlifting", name: "Powerlifting", items: ["power-rack", "competition-bench", "deadlift-platform"] },
  { id: "crossfit", name: "CrossFit", items: ["wall-ball", "climbing-rope", "ghd-machine", "gymnastics-rings"] },
  { id: "boxing", name: "Boxing/MMA", items: ["heavy-bag", "speed-bag", "focus-mitts", "boxing-gloves"] },
  { id: "yoga-pilates", name: "Yoga/Pilates", items: ["yoga-blocks", "pilates-reformer", "resistance-rings"] }
];

// Enhanced class formats
const classFormatOptions = [
  { id: "amrap", name: "AMRAP", description: "As Many Rounds As Possible in a set time" },
  { id: "emom", name: "EMOM", description: "Every Minute On the Minute" },
  { id: "tabata", name: "Tabata", description: "20 seconds work, 10 seconds rest" },
  { id: "rep-based", name: "Rep Based", description: "Fixed number of repetitions" },
  { id: "timed-sets", name: "Timed Sets", description: "Work for a set time period" },
  { id: "ladder", name: "Ladder", description: "Increasing or decreasing reps" },
  { id: "pyramid", name: "Pyramid", description: "Increase then decrease reps" },
  { id: "complex", name: "Complex", description: "Multiple exercises with same weight" },
  { id: "chipper", name: "Chipper", description: "Work through a list of exercises once" },
  { id: "custom", name: "Custom Format", description: "Create your own workout format" }
];

// Class format templates for different class types
const classFormatTemplates = [
  {
    id: "hiit-standard",
    name: "Standard HIIT",
    classType: "hiit",
    description: "Classic high-intensity interval training with work/rest periods",
    formats: [
      { 
        type: "tabata", 
        workInterval: 20, 
        restInterval: 10, 
        rounds: 8,
        description: "Tabata Protocol - 20s work/10s rest × 8"
      },
      { 
        type: "amrap", 
        workInterval: 300, 
        restInterval: 60, 
        rounds: 3,
        description: "5-minute AMRAP blocks with 1-minute rest between rounds"
      }
    ]
  },
  {
    id: "hiit-pyramid",
    name: "HIIT Pyramid",
    classType: "hiit",
    description: "Increasing then decreasing work intervals",
    formats: [
      { 
        type: "timed-sets", 
        workInterval: 30, 
        restInterval: 15, 
        rounds: 5,
        description: "Build-up phase: 30s work/15s rest × 5"
      },
      { 
        type: "pyramid", 
        workInterval: 45, 
        restInterval: 15, 
        rounds: 3,
        description: "Peak phase: 45s work/15s rest × 3"
      },
      { 
        type: "timed-sets", 
        workInterval: 30, 
        restInterval: 15, 
        rounds: 5,
        description: "Decrease phase: 30s work/15s rest × 5"
      }
    ]
  },
  {
    id: "strength-circuit",
    name: "Strength Circuit",
    classType: "strength",
    description: "Progressive strength-building circuit",
    formats: [
      { 
        type: "emom", 
        workInterval: 50, 
        restInterval: 10, 
        rounds: 10,
        description: "Strength EMOM: 50s work/10s transition × 10 minutes"
      },
      { 
        type: "timed-sets", 
        workInterval: 40, 
        restInterval: 20, 
        rounds: 4,
        description: "Heavy compound exercises: 40s work/20s rest × 4"
      }
    ]
  },
  {
    id: "bootcamp-mixed",
    name: "Mixed Bootcamp",
    classType: "bootcamp",
    description: "Varied format bootcamp with strength and cardio",
    formats: [
      { 
        type: "amrap", 
        workInterval: 360, 
        restInterval: 60, 
        rounds: 3,
        description: "6-minute AMRAP circuits with 1-minute rest"
      },
      { 
        type: "tabata", 
        workInterval: 20, 
        restInterval: 10, 
        rounds: 8,
        description: "Cardio Tabata burst"
      },
      { 
        type: "rep-based", 
        rounds: 3,
        description: "Strength finisher: 3 rounds of fixed reps"
      }
    ]
  },
  {
    id: "endurance",
    name: "Endurance Training",
    classType: "cardio",
    description: "Long-format endurance workout",
    formats: [
      { 
        type: "timed-sets", 
        workInterval: 120, 
        restInterval: 30, 
        rounds: 5,
        description: "Long endurance blocks: 2 min work/30s rest × 5"
      },
      { 
        type: "ladder", 
        rounds: 5,
        description: "Decreasing intensity ladder: 5 rounds with decreasing work"
      }
    ]
  },
  {
    id: "circuit-training",
    name: "Classic Circuit",
    classType: "circuit",
    description: "Traditional circuit training format",
    formats: [
      { 
        type: "timed-sets", 
        workInterval: 45, 
        restInterval: 15, 
        rounds: 3,
        description: "Circuit 1: 45s work/15s rest × 3 rounds"
      },
      { 
        type: "timed-sets", 
        workInterval: 30, 
        restInterval: 10, 
        rounds: 4,
        description: "Circuit 2: 30s work/10s rest × 4 rounds"
      },
      { 
        type: "amrap", 
        workInterval: 180, 
        rounds: 1,
        description: "Finisher: 3-minute AMRAP challenge"
      }
    ]
  }
];

// Circuit types
const baseCircuitTypes = [
  { id: "timed", label: "Timed Circuits (Fixed Work/Rest)" },
  { id: "superset", label: "Supersets (Back-to-back Exercises)" },
  { id: "tabata", label: "Tabata (20s Work/10s Rest)" },
  { id: "amrap", label: "AMRAP (As Many Rounds As Possible)" },
  { id: "emom", label: "EMOM (Every Minute On the Minute)" },
  { id: "intervals", label: "High-Intensity Intervals" },
  { id: "resistance-cardio", label: "Alternating Resistance/Cardio" },
  { id: "pyramid", label: "Pyramid (Increasing/Decreasing Reps)" },
  { id: "complex", label: "Barbell/Dumbbell Complexes" },
  { id: "density", label: "Density Training (Max Reps in Time)" },
  { id: "ladder", label: "Ladder Formats (Up/Down Reps)" },
  { id: "tri-set", label: "Tri-Sets (3 Exercises in Sequence)" },
  { id: "giant-set", label: "Giant Sets (4+ Exercises in Sequence)" },
];

// PT-specific circuit types
const ptCircuitTypes = [
  { id: "strength", label: "Progressive Strength Building" },
  { id: "hypertrophy", label: "Hypertrophy Focus (8-12 reps)" },
  { id: "power", label: "Power Development (Low Reps, High Intensity)" },
  { id: "endurance", label: "Muscular Endurance (15+ reps)" },
  { id: "corrective", label: "Corrective Exercise Sequence" },
  { id: "split", label: "Body Part Split Training" },
  { id: "functional", label: "Functional Movement Patterns" },
  { id: "sport-specific", label: "Sport-Specific Training" },
];

// Group-specific circuit types
const groupCircuitTypes = [
  { id: "station", label: "Station-Based Rotations" },
  { id: "partner", label: "Partner Exercises & Drills" },
  { id: "team", label: "Team Challenges & Competitions" },
  { id: "bootcamp", label: "Bootcamp Style Formats" },
];

interface WorkoutGeneratorProps {
  clientId?: number;
  onComplete?: () => void;
}

export default function WorkoutGenerator({ clientId, onComplete }: WorkoutGeneratorProps) {
  const [sessionType, setSessionType] = useState<"group" | "personal">("group");
  const [planType, setPlanType] = useState<"oneoff" | "program">("oneoff");
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardEnabled, setWizardEnabled] = useState<boolean>(true);
  // New state for managing multiple class formats
  const [classFormats, setClassFormats] = useState<ClassFormat[]>([]);
  const [addingNewFormat, setAddingNewFormat] = useState(false);
  const [currentFormatIndex, setCurrentFormatIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If clientId is provided, fetch client data
  const { data: clientData } = useQuery<User>({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId,
  });

  // Filter equipment based on context
  const getContextualEquipment = () => {
    let filteredEquipment = [];

    // Base equipment categories that will always be included
    const commonCategories = ["recovery", "accessories"];

    // Add common categories
    commonCategories.forEach(cat => {
      if (baseEquipment[cat as keyof typeof baseEquipment]) {
        filteredEquipment.push(baseEquipment[cat as keyof typeof baseEquipment]);
      }
    });

    // Add context-specific equipment
    if (sessionType === "personal") {
      // For personal training, include more specialized equipment
      filteredEquipment.push(baseEquipment.freeWeights);
      filteredEquipment.push(baseEquipment.cardio);
      filteredEquipment.push(baseEquipment.functional);

      // For advanced clients in PT, show all equipment
      if (fitnessLevel === "advanced") {
        // All equipment is already included
      } else if (fitnessLevel === "beginner") {
        // Filter out more advanced equipment for beginners
        filteredEquipment = filteredEquipment.map(category => {
          if (category.category === "Free Weights") {
            return {
              ...category,
              items: category.items.filter(item =>
                !item.id.includes("heavy") &&
                !item.id.includes("barbell") &&
                !item.id.includes("ez-curl")
              )
            };
          }
          return category;
        });
      }

      // For program plans, include more equipment options for progression
      if (planType === "program") {
        // All equipment is already included for programs to allow for progression
      }
    } else {
      // For group training, focus on equipment that works well in circuits
      filteredEquipment.push({
        ...baseEquipment.freeWeights,
        items: baseEquipment.freeWeights.items.filter(item =>
          !item.id.includes("barbell") &&
          !item.id.includes("ez-curl") &&
          (fitnessLevel !== "beginner" || !item.id.includes("heavy"))
        )
      });

      filteredEquipment.push(baseEquipment.cardio);

      filteredEquipment.push({
        ...baseEquipment.functional,
        items: baseEquipment.functional.items.filter(item =>
          fitnessLevel !== "beginner" ||
          !["sledge", "cables"].includes(item.id)
        )
      });
    }

    return filteredEquipment;
  };

  // Filter workout goals based on session type
  const getContextualWorkoutGoals = () => {
    return workoutGoals.filter(goal => 
      !goal.forSessionType || goal.forSessionType.includes(sessionType)
    );
  };

  // Get circuit types based on context
  const getContextualCircuitTypes = () => {
    let circuitTypes = [...baseCircuitTypes];

    if (sessionType === "personal") {
      circuitTypes = [...circuitTypes, ...ptCircuitTypes];

      // Filter out complex circuits for beginners in PT
      if (fitnessLevel === "beginner") {
        circuitTypes = circuitTypes.filter(type =>
          !["complex", "density", "giant-set"].includes(type.id)
        );
      }
    } else {
      circuitTypes = [...circuitTypes, ...groupCircuitTypes];

      // Filter based on fitness level for group sessions
      if (fitnessLevel === "beginner") {
        circuitTypes = circuitTypes.filter(type =>
          !["complex", "density", "ladder", "giant-set"].includes(type.id)
        );
      }
    }

    return circuitTypes;
  };

  // Get recommended equipment based on form values
  const getRecommendedEquipment = () => {
    const values = form.getValues();
    let recommended: string[] = [];

    // Add equipment based on training location
    if (values.trainingLocation) {
      const locationRecs = trainingLocations.find(loc => loc.id === values.trainingLocation)?.recommended || [];
      recommended = [...recommended, ...locationRecs];
    }

    // Add equipment based on workout goal
    if (values.workoutGoal) {
      const goalRecs = workoutGoals.find(goal => goal.id === values.workoutGoal)?.recommended || [];
      recommended = [...recommended, ...goalRecs];
    }

    // Add specialty equipment
    if (values.specialtyEquipment && values.specialtyEquipment.length > 0) {
      const specialtyItems = values.specialtyEquipment.flatMap(
        id => specialtyEquipment.find(s => s.id === id)?.items || []
      );
      recommended = [...recommended, ...specialtyItems];
    }

    // If extensive equipment is available, include more items
    if (values.equipmentAvailability === "extensive") {
      // Add more comprehensive equipment options
      const standardGymItems = equipmentPresets.find(p => p.id === "standard-gym")?.items || [];
      recommended = [...recommended, ...standardGymItems];
    } else if (values.equipmentAvailability === "minimal") {
      // Filter to only keep minimal equipment
      const minimalItems = equipmentPresets.find(p => p.id === "minimal")?.items || [];
      recommended = recommended.filter(item => minimalItems.includes(item));

      // Make sure we have at least the minimal items
      recommended = [...recommended, ...minimalItems].filter((item, index, array) => array.indexOf(item) === index);
    }

    // Remove duplicates
    return recommended.filter((item, index) => recommended.indexOf(item) === index);
  };

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      sessionType: "group",
      planType: "oneoff",
      fitnessLevel: "intermediate",
      equipment: [],
      useFullGym: false,
      wizardEnabled: true,
      circuitPreferences: {
        types: [],
        stationRotation: true,
        restBetweenStations: true,
        mixedEquipmentStations: true,
      },
      classFormats: [],
      specialtyEquipment: [],
    },
  });

  // Pre-fill form with client data if available
  useEffect(() => {
    if (clientData) {
      // Pre-populate form fields from client data
      form.setValue("fitnessLevel", clientData.preferences?.fitnessLevel || "intermediate");

      if (clientData.preferences?.gender) {
        form.setValue("clientDetails.gender", clientData.preferences.gender as any);
      }

      if (clientData.preferences?.birthdate) {
        // Calculate age from birthdate
        const birthdate = new Date(clientData.preferences.birthdate);
        const today = new Date();
        const age = today.getFullYear() - birthdate.getFullYear();
        form.setValue("clientDetails.age", age.toString());
      }

      if (clientData.preferences?.goals) {
        form.setValue("clientDetails.goals", clientData.preferences.goals);
      }

      if (clientData.preferences?.injuries || clientData.preferences?.medicalConditions) {
        form.setValue("clientDetails.limitations", 
          [
            clientData.preferences?.injuries, 
            clientData.preferences?.medicalConditions
          ].filter(Boolean).join(". ")
        );
      }

      if (clientData.preferences?.previousExperience) {
        form.setValue("clientDetails.experience", clientData.preferences.previousExperience);
      }

      // If client has disliked exercises, we'll avoid these in the workout
      if (clientData.preferences?.dislikedExercises?.length) {
        // This would be used in the API call later
      }

      // Default to personal training when used in client profile
      form.setValue("sessionType", "personal");
      setSessionType("personal");
    }
  }, [clientData, form]);

  // Update form values when session type changes
  useEffect(() => {
    // Reset relevant form fields when session type changes
    if (sessionType === "group") {
      form.setValue("planType", "oneoff");
      form.setValue("circuitPreferences.types", []);
      form.setValue("equipment", []);
      setPlanType("oneoff");
    } else {
      // Personal training default values
      form.setValue("circuitPreferences.types", []);
      form.setValue("equipment", []);

      // Only show program option in client profile view
      if (!clientId) {
        form.setValue("planType", "oneoff");
        setPlanType("oneoff");
      }
    }
  }, [sessionType, form, clientId]);

  // Update form values when fitness level changes
  useEffect(() => {
    // Reset equipment and circuit types when fitness level changes
    form.setValue("circuitPreferences.types", []);
    form.setValue("equipment", []);
    setSelectedPreset(null);
  }, [fitnessLevel, form]);

  // Update form values when plan type changes
  useEffect(() => {
    if (sessionType === "personal") {
      // Reset relevant fields when plan type changes
      form.setValue("circuitPreferences.types", []);
      form.setValue("equipment", []);
      setSelectedPreset(null);
    }
  }, [planType, sessionType, form]);

  // Apply equipment recommendations when wizard form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (wizardEnabled && (
        value.trainingLocation !== undefined || 
        value.workoutGoal !== undefined || 
        value.equipmentAvailability !== undefined ||
        value.specialtyEquipment !== undefined
      )) {
        // Wait for the next tick to ensure all form values are updated
        setTimeout(() => {
          const recommended = getRecommendedEquipment();
          if (recommended.length > 0) {
            form.setValue("equipment", recommended);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, wizardEnabled]);

  // This effect will load default class formats when class type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "classType" && value.classType && sessionType === "group") {
        const classType = value.classType;
        let templateId = "";
      
        // Map class types to template IDs and equipment presets
        const classConfig: Record<string, { template: string; preset: string; circuitTypes: string[]; formats?: Partial<ClassFormat>[] }> = {
          "HIIT": {
            template: "hiit-standard",
            preset: "hiit-class",
            circuitTypes: ["tabata", "amrap", "intervals"]
          },
          "BURN": {
            template: "bootcamp-mixed",
            preset: "bootcamp",
            circuitTypes: ["intervals", "emom", "tabata"]
          },
          "LIFT": {
            template: "strength-circuit",
            preset: "strength-class",
            circuitTypes: ["timed", "superset", "resistance-cardio"]
          },
          "GLC": {
            template: "circuit-training",
            preset: "circuit-class",
            circuitTypes: ["station", "superset", "tri-set"]
          },
          "METCON": {
            template: "endurance",
            preset: "circuit-class",
            circuitTypes: ["amrap", "emom", "intervals"]
          },
          "CORE": {
            template: "circuit-training",
            preset: "minimal",
            circuitTypes: ["timed", "superset"],
            formats: [
              { type: "timed-sets", workInterval: 40, restInterval: 20, rounds: 3 },
              { type: "tabata", workInterval: 20, restInterval: 10, rounds: 8 }
            ]
          },
          "FLEX": {
            template: "circuit-training",
            preset: "bodyweight",
            circuitTypes: ["timed", "superset"],
            formats: [
              { type: "timed-sets", workInterval: 60, restInterval: 30, rounds: 2 },
              { type: "timed-sets", workInterval: 45, restInterval: 15, rounds: 3 }
            ]
          }
        };
      
        const config = classConfig[classType];
        if (config) {
          templateId = config.template;
          
          // Apply equipment preset
          handlePresetChange(config.preset);
          
          // Set up formats
          let formattedItems: ClassFormat[] = [];
          
          if (config.formats) {
            // Use predefined formats for special cases like CORE and FLEX
            formattedItems = config.formats.map(format => ({
              type: format.type as ClassFormatType,
              workInterval: format.workInterval,
              restInterval: format.restInterval,
              rounds: format.rounds,
              description: `${format.type === 'timed-sets' ? 'Timed Set' : 'Tabata'} Format`
            }));
          } else {
            // Use template formats for standard classes
            const template = classFormatTemplates.find(t => t.id === templateId);
            if (template?.formats.length) {
              formattedItems = template.formats.map(format => ({
                ...format,
                type: format.type as ClassFormatType
              }));
            }
          }
          
          if (formattedItems.length > 0) {
            // Update formats
            setClassFormats(formattedItems);
            form.setValue('classFormats', formattedItems, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true
            });
            
            // Update circuit preferences
            form.setValue('circuitPreferences', {
              types: config.circuitTypes,
              stationRotation: !["CORE", "FLEX"].includes(classType),
              restBetweenStations: true,
              mixedEquipmentStations: !["CORE", "FLEX"].includes(classType)
            }, {
              shouldValidate: true
            });

            // Notify user
            toast({
              title: "Class Format Applied",
              description: `Configured ${classType} with ${formattedItems.length} format sections and ${config.circuitTypes.length} circuit types.`,
              variant: "default"
            });
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, sessionType, toast]);

  // Handle moving to next step in wizard
  const handleNextStep = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    }
  };

  // Handle moving to previous step in wizard
  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  // Update equipment when preset changes
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = equipmentPresets.find(p => p.id === presetId);
    if (preset) {
      form.setValue("equipment", preset.items);

      if (presetId === "full-gym") {
        form.setValue("useFullGym", true);
      } else {
        form.setValue("useFullGym", false);
      }
    }
  };

  // Complete the wizard and apply all recommendations
  const completeWizard = () => {
    const recommended = getRecommendedEquipment();
    form.setValue("equipment", recommended);
    setWizardStep(4); // Move to manual selection step
    toast({
      title: "Equipment Recommendations Applied",
      description: "The wizard has selected equipment based on your preferences. You can still modify the selection manually.",
    });
  };

  const generateMutation = useMutation({
    mutationFn: async (values: WorkoutFormValues) => {
      setIsGenerating(true);

      // Add client data to the request if available
      const requestData = clientId ? { ...values, clientId } : values;

      const res = await apiRequest("POST", "/api/generate-workout", requestData);
      const data = await res.json();
      if (data.error) throw new Error(data.details || data.error);
      return data.plan as WorkoutPlan;
    },
    onSuccess: (data) => {
      setSelectedWorkoutPlan(data);
      setIsGenerating(false);
      toast({
        title: "Workout Plan Generated",
        description: "Your workout plan has been generated successfully.",
      });

      if (onComplete) {
        // Notify parent component that generation is complete
        onComplete();
      }
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportPdfMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      window.open(`/api/workout-plan/${workoutId}/export-pdf`, '_blank');
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Export Started",
        description: "Your PDF is being generated and will download automatically.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WorkoutFormValues) => {
    generateMutation.mutate(values);
  };

  const handleExportPdf = (workoutId: number) => {
    exportPdfMutation.mutate(workoutId);
  };

  // Load a class format template
  const loadFormatTemplate = (templateId: string) => {
    const template = classFormatTemplates.find(t => t.id === templateId);
    if (template) {
      const formats = template.formats.map(f => ({
        ...f,
        type: f.type as ClassFormatType
      }));
      setClassFormats(formats);
      form.setValue('classFormats', formats);
      
      toast({
        title: "Template Applied",
        description: `Loaded "${template.name}" template with ${formats.length} format sections.`,
      });
    }
  };

  // Add a class format
  const addClassFormat = (format: ClassFormat) => {
    const currentFormats = form.getValues().classFormats || [];
    form.setValue('classFormats', [...currentFormats, format]);
    setClassFormats([...currentFormats, format]);
    setAddingNewFormat(false);
    setCurrentFormatIndex(null);
  };

  // Edit a class format
  const editClassFormat = (index: number, format: ClassFormat) => {
    const currentFormats = [...(form.getValues().classFormats || [])];
    currentFormats[index] = format;
    form.setValue('classFormats', currentFormats);
    setClassFormats(currentFormats);
    setAddingNewFormat(false);
    setCurrentFormatIndex(null);
  };

  // Remove a class format
  const removeClassFormat = (index: number) => {
    const currentFormats = form.getValues().classFormats || [];
    const newFormats = currentFormats.filter((_, i) => i !== index);
    form.setValue('classFormats', newFormats);
    setClassFormats(newFormats);
  };

  const handleDownload = () => {
    if (!selectedWorkoutPlan) return;

    // If the plan has an ID, offer PDF export
    if (selectedWorkoutPlan.id) {
      handleExportPdf(selectedWorkoutPlan.id);
      return;
    }

    // Otherwise, export as JSON
    try {
      const content = JSON.stringify(selectedWorkoutPlan, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedWorkoutPlan.introduction.overview.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}-workout-plan.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "DownloadComplete",
        description: "Your workout plan has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the workout plan.",
        variant: "destructive",
      });
    }
  };

  // Update local state when these fields change in the form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "sessionType" && value.sessionType) {
        setSessionType(value.sessionType as "group" | "personal");
      }
      if (name === "planType" && value.planType) {
        setPlanType(value.planType as "oneoff" | "program");
      }
      if (name === "fitnessLevel" && value.fitnessLevel) {
        setFitnessLevel(value.fitnessLevel as "beginner" | "intermediate" | "advanced");
      }
      if (name === "wizardEnabled" && value.wizardEnabled !== undefined) {
        setWizardEnabled(value.wizardEnabled);
      }

      // Reset preset selection if equipment selection changes manually
      if (name === "equipment" && selectedPreset && 
          JSON.stringify(value.equipment) !== JSON.stringify(equipmentPresets.find(p => p.id === selectedPreset)?.items)) {
        setSelectedPreset(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, selectedPreset]);

  // Get contextual equipment, circuit types and workout goals
  const availableEquipment = getContextualEquipment();
  const circuitTypes = getContextualCircuitTypes();
  const availableWorkoutGoals = getContextualWorkoutGoals();

  // Filter workout goals based on session type
  const filteredWorkoutGoals = workoutGoals.filter(goal => 
    !goal.forSessionType || goal.forSessionType.includes(sessionType)
  );

  // Filter equipment presets based on fitness level and session type
  const filteredPresets = equipmentPresets.filter(preset => {
    if (preset.id === "full-gym") return true; // Always show full gym option

    if (sessionType === "personal") {
      if (fitnessLevel === "beginner" && preset.id === "minimal") return true;
      if (fitnessLevel === "intermediate") return preset.id !== "full-gym";
      return true; // Show all presets for advanced
    } else {
      // For group sessions
      if (fitnessLevel === "beginner") return preset.id === "minimal" || preset.id === "bodyweight";
      if (fitnessLevel === "intermediate") return preset.id !== "full-gym";
      return true; // Show all presets for advanced
    }
  });

  // Render a card with icon for selection options
  const renderOptionCard = (
    id: string, 
    name: string, 
    description: string, 
    icon: LucideIcon, 
    isSelected: boolean, 
    onClick: () => void
  ) => {
    const Icon = icon;
    return (
      <div 
        key={id}
        className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
          isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-medium">{name}</h3>
          {isSelected && <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Full-screen loading overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Generating Your Workout Plan</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Coach Pete is designing a personalized workout plan based on your preferences.
              This may take a moment...
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Workout Plan Generator</CardTitle>
          <CardDescription>
            {sessionType === "group"
              ? "Create group class plans following Coach Pete's proven blueprint for effective group training sessions."
              : `Design ${planType === "oneoff" ? "single session" : "comprehensive program"} training sessions tailored to individual client needs and goals.`}
            All plans follow a structured format with proper warm-up, progressive loading, and cool-down phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Only show session type selection when not in client profile */}
              {!clientId && (
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
              )}

              {sessionType === "group" ? (
                <>
                  <FormField
                    control={form.control}
                    name="classType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            
                            // Auto-select appropriate equipment preset based on class type
                            if (value === "HIIT") {
                              handlePresetChange("hiit-class");
                            } else if (value === "GLC") {
                              handlePresetChange("circuit-class");
                            } else if (value === "BURN") {
                              handlePresetChange("bootcamp");
                            } else if (value === "LIFT") {
                              handlePresetChange("strength-class");
                            } else if (value === "CORE") {
                              handlePresetChange("minimal");
                            } else if (value === "FLEX") {
                              handlePresetChange("bodyweight");
                            }
                            
                            // Reset any formats already added
                            setClassFormats([]);
                            form.setValue('classFormats', []);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GLC">GLC (General Conditioning)</SelectItem>
                            <SelectItem value="BURN">BURN (Calorie Focus)</SelectItem>
                            <SelectItem value="HIIT">HIIT (High Intensity)</SelectItem>
                            <SelectItem value="LIFT">LIFT (Strength Focus)</SelectItem>
                            <SelectItem value="METCON">METCON (Metabolic Conditioning)</SelectItem>
                            <SelectItem value="CORE">CORE (Core & Stability)</SelectItem>
                            <SelectItem value="FLEX">FLEX (Mobility & Flexibility)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecting a class type will auto-suggest appropriate equipment and formats
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* Class Formats Section - Multiple formats allowed */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel>Class Formats</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setAddingNewFormat(true);
                          setCurrentFormatIndex(null);
                        }}
                      >
                        Add Format
                      </Button>
                    </div>
                    <FormDescription>
                      Create a varied class with multiple workout formats (e.g., EMOM, Tabata, etc.)
                    </FormDescription>
                    
                    {/* Template selection */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Format Templates</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {classFormatTemplates
                          .filter(template => !form.watch('classType') || template.classType === form.watch('classType'))
                          .map(template => (
                            <Button
                              key={template.id}
                              type="button"
                              variant="outline"
                              className="h-auto py-2 justify-start flex flex-col items-start text-left"
                              onClick={() => loadFormatTemplate(template.id)}
                            >
                              <span className="font-medium">{template.name}</span>
                              <span className="text-xs text-muted-foreground">{template.formats.length} format sections</span>
                            </Button>
                          ))}
                      </div>
                    </div>
                    
                    {/* List of added formats */}
                    {classFormats.length > 0 ? (
                      <div className="space-y-3">
                        {classFormats.map((format, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <span className="font-medium">
                                {classFormatOptions.find(opt => opt.id === format.type)?.name || format.type}
                              </span>
                              {format.workInterval && format.restInterval && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  {format.workInterval}s work / {format.restInterval}s rest
                                </span>
                              )}
                              {format.rounds && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  {format.rounds} rounds
                                </span>
                              )}
                              {format.description && (
                                <p className="text-sm text-muted-foreground mt-1">{format.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentFormatIndex(index);
                                  setAddingNewFormat(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeClassFormat(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
                        No formats added yet. Add your first workout format.
                      </div>
                    )}

                    {/* Format editor */}
                    {addingNewFormat && (
                      <Card className="border p-4">
                        <CardHeader className="p-0 pb-4">
                          <CardTitle className="text-lg">
                            {currentFormatIndex !== null ? 'Edit Format' : 'Add New Format'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Format Type</Label>
                              <Select 
                                value={currentFormatIndex !== null ? classFormats[currentFormatIndex].type : undefined}
                                onValueChange={(value) => {
                                  const formatType = value as ClassFormatType;
                                  
                                  // Set default values based on format type
                                  let defaultWorkInterval, defaultRestInterval, defaultRounds;
                                  
                                  if (formatType === 'tabata') {
                                    defaultWorkInterval = 20;
                                    defaultRestInterval = 10;
                                    defaultRounds = 8;
                                  } else if (formatType === 'emom') {
                                    defaultWorkInterval = 50;
                                    defaultRestInterval = 10;
                                    defaultRounds = 10;
                                  } else if (formatType === 'amrap') {
                                    defaultWorkInterval = 300;
                                    defaultRounds = 1;
                                  } else if (formatType === 'timed-sets') {
                                    defaultWorkInterval = 40;
                                    defaultRestInterval = 20;
                                    defaultRounds = 3;
                                  }
                                  
                                  if (currentFormatIndex !== null) {
                                    const updatedFormats = [...classFormats];
                                    updatedFormats[currentFormatIndex] = {
                                      ...updatedFormats[currentFormatIndex],
                                      type: formatType,
                                      workInterval: defaultWorkInterval || updatedFormats[currentFormatIndex].workInterval,
                                      restInterval: defaultRestInterval || updatedFormats[currentFormatIndex].restInterval,
                                      rounds: defaultRounds || updatedFormats[currentFormatIndex].rounds
                                    };
                                    setClassFormats(updatedFormats);
                                  } else {
                                    setClassFormats([...classFormats, { 
                                      type: formatType,
                                      workInterval: defaultWorkInterval,
                                      restInterval: defaultRestInterval,
                                      rounds: defaultRounds
                                    }]);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {classFormatOptions.map(format => (
                                    <SelectItem key={format.id} value={format.id}>
                                      {format.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                {classFormatOptions.find(f => 
                                  currentFormatIndex !== null 
                                    ? f.id === classFormats[currentFormatIndex].type 
                                    : false
                                )?.description || 'Select a format type'}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="rounds">Rounds</Label>
                              <Input
                                id="rounds"
                                type="number"
                                min="1"
                                max="20"
                                step="1" 
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Number of rounds"
                                value={currentFormatIndex !== null && classFormats[currentFormatIndex].rounds !== undefined 
                                  ? classFormats[currentFormatIndex].rounds 
                                  : ''}
                                onChange={(e) => {
                                  const rounds = e.target.value ? parseInt(e.target.value) : undefined;
                                  
                                  if (currentFormatIndex !== null) {
                                    const updatedFormats = [...classFormats];
                                    updatedFormats[currentFormatIndex] = {
                                      ...updatedFormats[currentFormatIndex],
                                      rounds
                                    };
                                    setClassFormats(updatedFormats);
                                  } else if (classFormats.length > 0) {
                                    const lastIndex = classFormats.length - 1;
                                    const updatedFormats = [...classFormats];
                                    updatedFormats[lastIndex] = {
                                      ...updatedFormats[lastIndex],
                                      rounds
                                    };
                                    setClassFormats(updatedFormats);
                                  }
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="workInterval">Work Interval (seconds)</Label>
                              <Input
                                id="workInterval"
                                type="number"
                                min="5"
                                max="300"
                                step="5"
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="e.g. 30 seconds"
            value={currentFormatIndex !== null && classFormats[currentFormatIndex].workInterval !== undefined 
              ? classFormats[currentFormatIndex].workInterval 
              : ''}
            onChange={(e) => {
              const workInterval = e.target.value ? parseInt(e.target.value) : undefined;
              
              if (currentFormatIndex !== null) {
                const updatedFormats = [...classFormats];
                updatedFormats[currentFormatIndex] = {
                  ...updatedFormats[currentFormatIndex],
                  workInterval
                };
                setClassFormats(updatedFormats);
              } else if (classFormats.length > 0) {
                const lastIndex = classFormats.length - 1;
                const updatedFormats = [...classFormats];
                updatedFormats[lastIndex] = {
                  ...updatedFormats[lastIndex],
                  workInterval
                };
                setClassFormats(updatedFormats);
              }
            }}
          />
          <div className="flex justify-between mt-1">
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 20;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    workInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              20s
            </button>
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 30;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    workInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              30s
            </button>
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 45;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    workInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              45s
            </button>
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 60;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    workInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              60s
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="restInterval">Rest Interval (seconds)</Label>
          <Input
            id="restInterval"
            type="number"
            min="0"
            max="300"
            step="5"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="e.g. 10 seconds"
            value={currentFormatIndex !== null && classFormats[currentFormatIndex].restInterval !== undefined 
              ? classFormats[currentFormatIndex].restInterval 
              : ''}
            onChange={(e) => {
              const restInterval = e.target.value ? parseInt(e.target.value) : undefined;
              
              if (currentFormatIndex !== null) {
                const updatedFormats = [...classFormats];
                updatedFormats[currentFormatIndex] = {
                  ...updatedFormats[currentFormatIndex],
                  restInterval
                };
                setClassFormats(updatedFormats);
              } else if (classFormats.length > 0) {
                const lastIndex = classFormats.length - 1;
                const updatedFormats = [...classFormats];
                updatedFormats[lastIndex] = {
                  ...updatedFormats[lastIndex],
                  restInterval
                };
                setClassFormats(updatedFormats);
              }
            }}
          />
          <div className="flex justify-between mt-1">
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 10;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    restInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              10s
            </button>
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 15;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    restInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              15s
            </button>
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 30;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    restInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              30s
            </button>
            <button 
              type="button" 
              className="text-xs text-primary"
              onClick={() => {
                const value = 60;
                if (currentFormatIndex !== null) {
                  const updatedFormats = [...classFormats];
                  updatedFormats[currentFormatIndex] = {
                    ...updatedFormats[currentFormatIndex],
                    restInterval: value
                  };
                  setClassFormats(updatedFormats);
                }
              }}
            >
              60s
            </button>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Description</Label>
          <Input
            placeholder="Optional description or notes"
            value={currentFormatIndex !== null && classFormats[currentFormatIndex].description 
              ? classFormats[currentFormatIndex].description 
              : ''}
            onChange={(e) => {
              const description = e.target.value || undefined;
              
              if (currentFormatIndex !== null) {
                const updatedFormats = [...classFormats];
                updatedFormats[currentFormatIndex] = {
                  ...updatedFormats[currentFormatIndex],
                  description
                };
                setClassFormats(updatedFormats);
              } else if (classFormats.length > 0) {
                const lastIndex = classFormats.length - 1;
                const updatedFormats = [...classFormats];
                updatedFormats[lastIndex] = {
                  ...updatedFormats[lastIndex],
                  description
                };
                setClassFormats(updatedFormats);
              }
            }}
          />
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-2 p-0 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setAddingNewFormat(false);
          setCurrentFormatIndex(null);
        }}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={() => {
          if (currentFormatIndex !== null) {
            // We're editing an existing format
            editClassFormat(currentFormatIndex, classFormats[currentFormatIndex]);
          } else if (classFormats.length > 0) {
            // We have a new format in the state
            const newFormat = classFormats[classFormats.length - 1];
            if (newFormat.type) {
              addClassFormat(newFormat);
            }
          }
        }}
        disabled={currentFormatIndex === null && classFormats.length === 0}
                        >
                          {currentFormatIndex !== null ? 'Update' : 'Add'}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>

                  {/* Participant Information Section */}
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
                              <SelectItem value="individual">Individual Work</SelectItem>
                              <SelectItem value="partner">Partner Workouts</SelectItem>
                              <SelectItem value="groups">Small Groups (3-5)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The format influences exercise selection and setup
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {form.watch("participantInfo.format") === "groups" && (
                      <FormField
                        control={form.control}
                        name="participantInfo.groupSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Size</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="3"
                                max="8"
                                placeholder="3"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Group Circuit Preferences */}
                  <div className="space-y-4">
                    <FormLabel>Circuit Preferences</FormLabel>
                    <FormField
                      control={form.control}
                      name="circuitPreferences.stationRotation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Station Rotations
                            </FormLabel>
                            <FormDescription>
                              Participants rotate between exercise stations
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="circuitPreferences.restBetweenStations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                              Include dedicated rest periods between stations
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="circuitPreferences.mixedEquipmentStations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                              Allow different equipment at each station
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="classType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            
                            // Auto-select appropriate equipment preset based on class type
                            if (value === "HIIT") {
                              handlePresetChange("hiit-class");
                            } else if (value === "GLC") {
                              handlePresetChange("circuit-class");
                            } else if (value === "BURN") {
                              handlePresetChange("bootcamp");
                            } else if (value === "LIFT") {
                              handlePresetChange("strength-class");
                            } else if (value === "CORE") {
                              handlePresetChange("minimal");
                            } else if (value === "FLEX") {
                              handlePresetChange("bodyweight");
                            }
                            
                            // Clear current formats and suggest formats based on the class type
                            setClassFormats([]);
                            form.setValue('classFormats', []);
                            
                            // Suggest format templates based on class type
                            const templateToSuggest = 
                              value === "HIIT" ? "hiit-standard" :
                              value === "BURN" ? "bootcamp-mixed" :
                              value === "LIFT" ? "strength-circuit" :
                              value === "GLC" ? "circuit-training" : 
                              value === "METCON" ? "endurance" : null;
                            
                            if (templateToSuggest) {
                              const template = classFormatTemplates.find(t => t.id === templateToSuggest);
                              if (template) {
                                // Auto-apply the first format from the template
                                const firstFormat = template.formats[0];
                                if (firstFormat) {
                                  const formatToAdd = {
                                    ...firstFormat,
                                    type: firstFormat.type as ClassFormatType
                                  };
                                  setClassFormats([formatToAdd]);
                                  form.setValue('classFormats', [formatToAdd]);
                                  
                                  toast({
                                    title: "Format Suggested",
                                    description: `Added a default ${template.name} format for ${value} class`,
                                  });
                                }
                              }
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HIIT">HIIT (High Intensity Interval Training)</SelectItem>
                            <SelectItem value="GLC">GLC (Group Lifting Circuit)</SelectItem>
                            <SelectItem value="BURN">BURN (Bootcamp Style Class)</SelectItem>
                            <SelectItem value="METCON">METCON (Metabolic Conditioning)</SelectItem>
                            <SelectItem value="LIFT">LIFT (Strength & Power)</SelectItem>
                            <SelectItem value="CORE">CORE (Core & Stability Focus)</SelectItem>
                            <SelectItem value="FLEX">FLEX (Mobility & Flexibility)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecting a class type will auto-suggest appropriate equipment and formats
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Fitness Level</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFitnessLevel(value as "beginner" | "intermediate" | "advanced");
                          }}
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
                        <FormDescription>
                          This determines exercise selection and intensity
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  {/* Personal Training Options */}
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Type</FormLabel>
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
                          {/* Only show program option when in client profile */}
                          {clientId && (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="program" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                12-Week Program
                              </FormLabel>
                            </FormItem>
                          )}
                        </RadioGroup>
                      </FormItem>
                    )}
                  />

                  {/* Client Details Section */}
                  <div className="space-y-4">
                    <FormLabel>Client Details</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {!clientId && (
                        <>
                          <FormField
                            control={form.control}
                            name="clientDetails.age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input {...field} />
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
                        </>
                      )}
                      {(!clientId || !clientData?.preferences?.goals) && (
                        <FormField
                          control={form.control}
                          name="clientDetails.goals"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Fitness Goals</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      {(!clientId || !clientData?.preferences?.injuries) && (
                        <FormField
                          control={form.control}
                          name="clientDetails.limitations"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Physical Limitations or Injuries</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                      {(!clientId || !clientData?.preferences?.previousExperience) && (
                        <FormField
                          control={form.control}
                          name="clientDetails.experience"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Exercise Experience</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Program Details - Only for 12-Week Program */}
                  {planType === "program" && (
                    <div className="space-y-4">
                      <FormLabel>Program Structure</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="programDetails.weeks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program Duration (weeks)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="4"
                                  max="24"
                                  defaultValue="12"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="programDetails.sessionsPerWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sessions Per Week</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="7"
                                  defaultValue="3"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Circuit Preferences for Personal Training */}
                  <div className="space-y-4">
                    <FormLabel>Training Approach</FormLabel>
                    <FormField
                      control={form.control}
                      name="circuitPreferences.types"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Training Methods</FormLabel>
                            <FormDescription>
                              Select the training methods to include
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fitnessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Fitness Level</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setFitnessLevel(value as "beginner" | "intermediate" | "advanced");
                          }}
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
                        <FormDescription>
                          This will tailor exercise selection and progression to the client's abilities
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Equipment Selection Wizard or Manual Selection */}
              <FormField
                control={form.control}
                name="wizardEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Equipment Selection Method
                      </FormLabel>
                      <FormDescription>
                        Choose between a guided wizard or manual equipment selection
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <span className={!field.value ? "font-medium text-primary" : "text-muted-foreground"}>Manual</span>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded-full h-6 w-6"
                        />
                        <span className={field.value ? "font-medium text-primary" : "text-muted-foreground"}>Wizard</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Equipment Selection */}
              {form.watch("wizardEnabled") ? (
                <Card className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Equipment Selection Wizard</CardTitle>
                    <CardDescription>
                      Let's find the perfect equipment for your workout based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Wizard Step Indicator */}
                    <div className="mb-6">
                      <div className="flex justify-between">
                        <div className={`${wizardStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>Location</div>
                        <div className={`${wizardStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>Goals</div>
                        <div className={`${wizardStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>Availability</div>
                        <div className={`${wizardStep >= 4 ? "text-primary" : "text-muted-foreground"}`}>Selection</div>
                      </div>
                      <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${(wizardStep / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Step 1: Training Location */}
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Where will this workout take place?</h3>
                        <FormField
                          control={form.control}
                          name="trainingLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {trainingLocations.map((location) => 
                                    renderOptionCard(
                                      location.id,
                                      location.name,
                                      location.description,
                                      location.icon,
                                      field.value === location.id,
                                      () => field.onChange(location.id)
                                    )
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 2: Workout Goals */}
                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">What is the primary goal of this workout?</h3>
                        
                        {sessionType === "group" && (
                          <div className="bg-muted p-3 rounded-md mb-4">
                            <div className="flex gap-2 items-center text-sm">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Showing goals specific to {form.watch('classType') || 'group'} classes.
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <FormField
                          control={form.control}
                          name="workoutGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {availableWorkoutGoals
                                    .filter(goal => {
                                      // For group sessions, further filter based on class type if selected
                                      if (sessionType === "group" && form.watch('classType')) {
                                        if (form.watch('classType') === 'HIIT' && goal.id !== 'hiit' && goal.id !== 'weight-loss') return false;
                                        if (form.watch('classType') === 'LIFT' && goal.id !== 'strength' && goal.id !== 'endurance') return false;
                                        if (form.watch('classType') === 'GLC' && goal.id !== 'general-fitness' && goal.id !== 'endurance') return false;
                                        if (form.watch('classType') === 'METCON' && goal.id !== 'weight-loss' && goal.id !== 'endurance') return false;
                                      }
                                      return true;
                                    })
                                    .map((goal) => 
                                      renderOptionCard(
                                        goal.id,
                                        goal.name,
                                        goal.description,
                                        goal.icon,
                                        field.value === goal.id,
                                        () => field.onChange(goal.id)
                                      )
                                    )
                                  }
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 3: Equipment Availability */}
                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">How much equipment is available?</h3>
                        <FormField
                          control={form.control}
                          name="equipmentAvailability"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {equipmentAvailability.map((availability) => 
                                    renderOptionCard(
                                      availability.id,
                                      availability.name,
                                      availability.description,
                                      availability.icon,
                                      field.value === availability.id,
                                      () => field.onChange(availability.id)
                                    )
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <h3 className="font-medium text-lg mt-8">Any specialty equipment available?</h3>
                        <FormField
                          control={form.control}
                          name="specialtyEquipment"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {specialtyEquipment.map((specialty) => (
                                    <div 
                                      key={specialty.id}
                                      className={`border rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                                        field.value?.includes(specialty.id) ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                                      }`}
                                      onClick={() => {
                                        const newValue = field.value?.includes(specialty.id)
                                          ? field.value.filter(id => id !== specialty.id)
                                          : [...(field.value || []), specialty.id];
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{specialty.name}</h4>
                                        {field.value?.includes(specialty.id) && (
                                          <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {specialty.items.join(', ')}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Step 4: Manual Equipment Selection */}
                    {wizardStep === 4 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-lg">Recommended Equipment</h3>
                          <Badge variant="outline" className="ml-2">
                            {form.watch("equipment")?.length || 0} items selected
                          </Badge>
                        </div>

                        {/* Equipment Presets for Quick Selection */}
                        <div className="mb-6">
                          <h3 className="text-sm font-medium mb-2">Equipment Presets</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {filteredPresets.map(preset => (
                              <Button
                                key={preset.id}
                                type="button"
                                variant={selectedPreset === preset.id ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => handlePresetChange(preset.id)}
                              >
                                {selectedPreset === preset.id && <CheckCircle2 className="h-4 w-4 mr-2" />}
                                {preset.name}
                              </Button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {selectedPreset ? 
                              equipmentPresets.find(p => p.id === selectedPreset)?.description :
                              "Select a preset or customize your equipment selection below"}
                          </p>
                        </div>

                        {/* Show Full Gym checkbox */}
                        <FormField
                          control={form.control}
                          name="useFullGym"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-3 rounded-md mb-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                      handlePresetChange("full-gym");
                                    } else if (selectedPreset === "full-gym") {
                                      setSelectedPreset(null);
                                      form.setValue("equipment", []);
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium">
                                  Use Full Gym Equipment
                                </FormLabel>
                                <FormDescription>
                                  Enables access to all equipment for maximum workout variety
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Detailed Equipment Selection with Accordions */}
                        {!form.watch("useFullGym") && (
                          <FormField
                            control={form.control}
                            name="equipment"
                            render={() => (
                              <FormItem>
                                <div className="space-y-2">
                                  <Accordion type="multiple" className="w-full">
                                    {availableEquipment.map((category) => (
                                      <AccordionItem key={category.category} value={category.category}>
                                        <AccordionTrigger className="py-2">
                                          <div className="flex items-center">
                                            <category.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                                            <h4 className="font-medium">{category.category}</h4>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                                            {category.items.map((item) => (
                                              <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="equipment"
                                                render={({ field }) => (
                                                  <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                  >
                                                    <FormControl>
                                                      <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                          const newEquipment = checked
                                                            ? [...field.value, item.id]
                                                            : field.value?.filter(
                                                                (value) => value !== item.id
                                                              );

                                                          field.onChange(newEquipment);
                                                          setSelectedPreset(null);
                                                        }}
                                                      />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                      <FormLabel className="font-normal">
                                                        {item.label}
                                                      </FormLabel>
                                                      <p className="text-xs text-muted-foreground">
                                                        {item.count}
                                                      </p>
                                                    </div>
                                                  </FormItem>
                                                )}
                                              />
                                            ))}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    {wizardStep > 1 ? (
                      <Button variant="outline" type="button" onClick={handlePrevStep}>
                        Previous
                      </Button>
                    ) : (
                      <div /> // Empty div for layout consistency
                    )}

                    {wizardStep < 4 ? (
                      <Button 
                        type="button" 
                        onClick={handleNextStep}
                        disabled={
                          (wizardStep === 1 && !form.watch("trainingLocation")) ||
                          (wizardStep === 2 && !form.watch("workoutGoal")) ||
                          (wizardStep === 3 && !form.watch("equipmentAvailability"))
                        }
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="button" onClick={completeWizard}>
                        Apply Recommendations
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel>Equipment Selection</FormLabel>
                    <Badge variant="outline" className="ml-2">
                      {form.watch("equipment")?.length || 0} items selected
                    </Badge>
                  </div>

                  {/* Equipment Presets */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Equipment Presets</h3>
                    
                    {sessionType === "group" && form.watch('classType') && (
                      <div className="bg-muted/50 p-3 rounded-md mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>
                            Showing recommended equipment for {
                              form.watch('classType') === 'hiit' ? 'HIIT' :
                              form.watch('classType') === 'circuit' ? 'Circuit Training' :
                              form.watch('classType') === 'strength' ? 'Group Strength' :
                              form.watch('classType') === 'bootcamp' ? 'Bootcamp' :
                              form.watch('classType') === 'cardio' ? 'Cardio Focus' :
                              form.watch('classType')
                            } classes
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      {filteredPresets
                        .filter(preset => {
                          // For group sessions, filter presets based on class type
                          if (sessionType === "group" && form.watch('classType')) {
                            if (form.watch('classType') === 'hiit' && preset.id !== 'hiit-class' && preset.id !== 'minimal') return false;
                            if (form.watch('classType') === 'circuit' && preset.id !== 'circuit-class' && preset.id !== 'minimal') return false;
                            if (form.watch('classType') === 'bootcamp' && preset.id !== 'bootcamp' && preset.id !== 'minimal') return false;
                            if (form.watch('classType') === 'strength' && preset.id !== 'strength-class' && preset.id !== 'standard-gym') return false;
                          }
                          return true;
                        })
                        .map(preset => (
                          <Button
                            key={preset.id}
                            type="button"
                            variant={selectedPreset === preset.id ? "default" : "outline"}
                            className="justify-start h-auto py-2 text-left"
                            onClick={() => handlePresetChange(preset.id)}
                          >
                            <div>
                              {selectedPreset === preset.id && <CheckCircle2 className="h-4 w-4 mr-2 inline-block" />}
                              <span className="font-medium">{preset.name}</span>
                              <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                            </div>
                          </Button>
                        ))
                      }
                    </div>
                  </div>

                  {/* Show Full Gym checkbox */}
                  <FormField
                    control={form.control}
                    name="useFullGym"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-3 rounded-md mb-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                handlePresetChange("full-gym");
                              } else if (selectedPreset === "full-gym") {
                                setSelectedPreset(null);
                                form.setValue("equipment", []);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            Use Full Gym Equipment
                          </FormLabel>
                          <FormDescription>
                            Enables access to all equipment for maximum workout variety
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Detailed Equipment Selection with Accordions */}
                  {!form.watch("useFullGym") && (
                    <FormField
                      control={form.control}
                      name="equipment"
                      render={() => (
                        <FormItem>
                          <div className="space-y-2">
                            <Accordion type="multiple" className="w-full">
                              {availableEquipment.map((category) => (
                                <AccordionItem key={category.category} value={category.category}>
                                  <AccordionTrigger className="py-2">
                                    <div className="flex items-center">
                                      <category.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                                      <h4 className="font-medium">{category.category}</h4>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                                      {category.items.map((item) => (
                                        <FormField
                                          key={item.id}
                                          control={form.control}
                                          name="equipment"
                                          render={({ field }) => (
                                            <FormItem
                                              key={item.id}
                                              className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(item.id)}
                                                  onCheckedChange={(checked) => {
                                                    const newEquipment = checked
                                                      ? [...field.value, item.id]
                                                      : field.value?.filter(
                                                          (value) => value !== item.id
                                                        );

                                                    field.onChange(newEquipment);
                                                    setSelectedPreset(null);
                                                  }}
                                                />
                                              </FormControl>
                                              <div className="space-y-1 leading-none">
                                                <FormLabel className="font-normal">
                                                  {item.label}
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground">
                                                  {item.count}
                                                </p>
                                              </div>
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Workout Plan...
                  </>
                ) : (
                  "Generate Workout Plan"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display Generated Workout Plan */}
      {selectedWorkoutPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Generated Workout Plan</span>
              <div className="flex gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                  disabled={exportPdfMutation.isPending}
                >
                  {selectedWorkoutPlan.id ? (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedWorkoutPlan.introduction.overview}
            </CardDescription>
          </CardHeader>
          <CardContent>
                    <div className="space-y-6">
                      {/* Introduction */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Introduction</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Intensity</h4>
                            <p className="text-sm text-muted-foreground">{selectedWorkoutPlan.introduction.intensity}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Preparation</h4>
                            <p className="text-sm text-muted-foreground">{selectedWorkoutPlan.introduction.preparation}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium">Objectives</h4>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {selectedWorkoutPlan.introduction.objectives.map((objective, index) => (
                              <li key={index}>{objective}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Main Workout */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Main Workout</h3>

                        {selectedWorkoutPlan.mainWorkout.map((circuit, index) => (
                          <Card key={index} className="border border-border">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Circuit {circuit.circuitNumber}</CardTitle>
                              <CardDescription>{circuit.objective}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm">{circuit.explanation}</p>
                              <p className="text-sm font-medium">Setup: {circuit.setupInstructions}</p>

                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Exercise</TableHead>
                                    <TableHead>Sets</TableHead>
                                    <TableHead>Reps</TableHead>
                                    <TableHead>Technique</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {circuit.exercises.map((exercise, exIndex) => (
                                    <TableRow key={exIndex}>
                                      <TableCell className="font-medium">{exercise.exercise}</TableCell>
                                      <TableCell>{exercise.sets}</TableCell>
                                      <TableCell>{exercise.reps}</TableCell>
                                      <TableCell className="max-w-[300px]">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="link" className="p-0 h-auto">View Technique</Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>{exercise.exercise}</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                <div className="space-y-4">
                                                  <div>
                                                    <h4 className="font-bold">Technique:</h4>
                                                    <p>{exercise.technique}</p>
                                                  </div>
                                                  {(exercise.men || exercise.woman) && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                      {exercise.men && (
                                                        <div>
                                                          <h4 className="font-bold">Men:</h4>
                                                          <p>{exercise.men}</p>
                                                        </div>
                                                      )}
                                                      {exercise.woman && (
                                                        <div>
                                                          <h4 className="font-bold">Women:</h4>
                                                          <p>{exercise.woman}</p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                  {exercise.notes && (
                                                    <div>
                                                      <h4 className="font-bold">Notes:</h4>
                                                      <p>{exercise.notes}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogAction>Close</AlertDialogAction>
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
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Recovery</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Immediate Steps</h4>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                              {selectedWorkoutPlan.recovery.immediateSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium">Nutrition Tips</h4>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                              {selectedWorkoutPlan.recovery.nutritionTips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Rest Recommendations</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkoutPlan.recovery.restRecommendations}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium">Next Day Guidance</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkoutPlan.recovery.nextDayGuidance}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
            </Card>
          )}
        </div>
      );
    }