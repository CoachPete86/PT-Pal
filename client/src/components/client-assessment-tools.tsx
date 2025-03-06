
import React, { useState } from "react";
import {
  ClipboardCheck,
  FileText,
  BarChart3,
  Video,
  HelpCircle,
  Check,
  Cog,
  UserPlus,
  ListTodo,
  Scale,
  Ruler,
  Heart,
  Clipboard,
  Camera,
  ChevronDown,
  ChevronRight,
  Aperture,
  Upload,
  RefreshCcw,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

// Mock data for demos
const mockAssessments = [
  {
    id: 1,
    name: "Initial Fitness Assessment",
    lastCompleted: "2023-04-15",
    type: "comprehensive",
    progress: 100,
    status: "completed",
  },
  {
    id: 2,
    name: "Movement Screen",
    lastCompleted: "2023-05-02",
    type: "movement",
    progress: 100,
    status: "completed",
  },
  {
    id: 3,
    name: "Quarterly Progress Check",
    lastCompleted: null,
    type: "progress",
    progress: 0,
    status: "pending",
  },
  {
    id: 4,
    name: "Recovery Readiness",
    lastCompleted: "2023-05-10",
    type: "readiness",
    progress: 75,
    status: "in-progress",
  },
];

const mockClients = [
  { id: 1, name: "Sarah Johnson", lastAssessment: "2023-05-10", dueAssessment: false },
  { id: 2, name: "Michael Chen", lastAssessment: "2023-03-22", dueAssessment: true },
  { id: 3, name: "Lisa Williams", lastAssessment: "2023-04-30", dueAssessment: false },
  { id: 4, name: "David Martinez", lastAssessment: "2023-02-15", dueAssessment: true },
];

export default function ClientAssessmentTools() {
  const [selectedTab, setSelectedTab] = useState("assessments");
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  // Mock form state
  const [formData, setFormData] = useState({
    client: "",
    assessmentType: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Mock function for form submission
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mock readiness data
  const readinessData = {
    sleepQuality: 7,
    stressLevel: 4,
    muscleSoreness: 6,
    energyLevel: 8,
    motivation: 7,
  };

  // Mock measurement data
  const measurementHistory = [
    {
      date: "2023-05-10",
      weight: "165 lbs",
      bodyFat: "18%",
      chestMeasurement: "40 in",
      waistMeasurement: "32 in",
      hipMeasurement: "38 in",
      armMeasurement: "14 in",
      thighMeasurement: "22 in",
    },
    {
      date: "2023-04-10",
      weight: "168 lbs",
      bodyFat: "19%",
      chestMeasurement: "40.5 in",
      waistMeasurement: "33 in",
      hipMeasurement: "38.5 in",
      armMeasurement: "13.5 in",
      thighMeasurement: "22.5 in",
    },
    {
      date: "2023-03-10",
      weight: "172 lbs",
      bodyFat: "21%",
      chestMeasurement: "41 in",
      waistMeasurement: "34 in",
      hipMeasurement: "39 in",
      armMeasurement: "13 in",
      thighMeasurement: "23 in",
    },
  ];

  // Mock movement screening data
  const movementScreeningData = {
    squat: 3,
    lunge: 2,
    pushUp: 3,
    shoulderMobility: 2,
    trunkStability: 3,
    rotaryStability: 2,
    totalScore: 15,
  };

  const renderAssessmentDetails = () => {
    if (!selectedAssessment) return null;

    const assessment = mockAssessments.find((a) => a.id === selectedAssessment);
    if (!assessment) return null;

    switch (assessment.type) {
      case "readiness":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Client Readiness Questionnaire</h3>
              <Badge variant={assessment.status === "completed" ? "default" : "outline"}>
                {assessment.status === "completed"
                  ? "Completed"
                  : assessment.status === "in-progress"
                  ? "In Progress"
                  : "Pending"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Sleep Quality</Label>
                  <span className="text-sm font-medium">{readinessData.sleepQuality}/10</span>
                </div>
                <Progress value={(readinessData.sleepQuality / 10) * 100} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Stress Level</Label>
                  <span className="text-sm font-medium">{readinessData.stressLevel}/10</span>
                </div>
                <Progress value={(readinessData.stressLevel / 10) * 100} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Muscle Soreness</Label>
                  <span className="text-sm font-medium">{readinessData.muscleSoreness}/10</span>
                </div>
                <Progress value={(readinessData.muscleSoreness / 10) * 100} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Energy Level</Label>
                  <span className="text-sm font-medium">{readinessData.energyLevel}/10</span>
                </div>
                <Progress value={(readinessData.energyLevel / 10) * 100} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Motivation</Label>
                  <span className="text-sm font-medium">{readinessData.motivation}/10</span>
                </div>
                <Progress value={(readinessData.motivation / 10) * 100} />
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium mb-2">Coach Recommendations</h4>
              <p className="text-sm text-muted-foreground">
                Based on today's readiness scores, consider reducing intensity by 15% and focusing on
                technique work rather than max effort. Prioritize post-workout recovery protocols.
              </p>
            </div>
          </div>
        );

      case "movement":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Movement Screening Assessment</h3>
              <Badge variant="default">Completed</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Movement Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Squat Pattern</Label>
                        <Badge variant="outline">{movementScreeningData.squat}/4</Badge>
                      </div>
                      <Progress
                        value={(movementScreeningData.squat / 4) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Lunge Pattern</Label>
                        <Badge variant="outline">{movementScreeningData.lunge}/4</Badge>
                      </div>
                      <Progress
                        value={(movementScreeningData.lunge / 4) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Push-Up</Label>
                        <Badge variant="outline">{movementScreeningData.pushUp}/4</Badge>
                      </div>
                      <Progress
                        value={(movementScreeningData.pushUp / 4) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Shoulder Mobility</Label>
                        <Badge variant="outline">
                          {movementScreeningData.shoulderMobility}/4
                        </Badge>
                      </div>
                      <Progress
                        value={(movementScreeningData.shoulderMobility / 4) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Trunk Stability</Label>
                        <Badge variant="outline">
                          {movementScreeningData.trunkStability}/4
                        </Badge>
                      </div>
                      <Progress
                        value={(movementScreeningData.trunkStability / 4) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Rotary Stability</Label>
                        <Badge variant="outline">
                          {movementScreeningData.rotaryStability}/4
                        </Badge>
                      </div>
                      <Progress
                        value={(movementScreeningData.rotaryStability / 4) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center justify-center h-24 w-24 rounded-full border-4"
                      style={{
                        borderColor:
                          movementScreeningData.totalScore >= 17
                            ? "green"
                            : movementScreeningData.totalScore >= 14
                            ? "orange"
                            : "red",
                      }}
                    >
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {movementScreeningData.totalScore}
                        </div>
                        <div className="text-xs text-muted-foreground">OUT OF 24</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Key Findings:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Limited shoulder mobility affects overhead movements</li>
                      <li>• Lunge pattern asymmetry between left and right sides</li>
                      <li>• Good trunk stability during static positions</li>
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setShowAnalysisDialog(true)}
                  >
                    View Detailed Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="font-medium mb-2">Corrective Exercise Recommendations</h4>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 border rounded-md bg-muted/20">
                  <h5 className="font-medium mb-1">Shoulder Mobility Drills</h5>
                  <p className="text-sm text-muted-foreground">
                    Wall slides, banded dislocations, and thoracic extensions
                  </p>
                </div>
                <div className="p-3 border rounded-md bg-muted/20">
                  <h5 className="font-medium mb-1">Split Stance Balance Work</h5>
                  <p className="text-sm text-muted-foreground">
                    Assisted split squats with focus on left leg stability
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "comprehensive":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Initial Fitness Assessment</h3>
              <Badge variant="default">Completed</Badge>
            </div>

            <Tabs defaultValue="measurements">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="measurements">Measurements</TabsTrigger>
                <TabsTrigger value="performance">Performance Tests</TabsTrigger>
                <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                <TabsTrigger value="goals">Goals & Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="measurements" className="pt-4 space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Body Fat %</TableHead>
                        <TableHead>Chest</TableHead>
                        <TableHead>Waist</TableHead>
                        <TableHead>Hips</TableHead>
                        <TableHead>Arms</TableHead>
                        <TableHead>Thighs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurementHistory.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.weight}</TableCell>
                          <TableCell>{record.bodyFat}</TableCell>
                          <TableCell>{record.chestMeasurement}</TableCell>
                          <TableCell>{record.waistMeasurement}</TableCell>
                          <TableCell>{record.hipMeasurement}</TableCell>
                          <TableCell>{record.armMeasurement}</TableCell>
                          <TableCell>{record.thighMeasurement}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Camera className="h-4 w-4" />
                    Add Progress Photos
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <RefreshCcw className="h-4 w-4" />
                    Update Measurements
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cardiovascular Fitness</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Resting Heart Rate</Label>
                          <span className="text-sm font-medium">68 bpm</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">1-Mile Run Time</Label>
                          <span className="text-sm font-medium">8:45</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">VO2 Max (Est.)</Label>
                          <span className="text-sm font-medium">42.3 ml/kg/min</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t">
                        <Label className="text-sm">Cardiovascular Fitness Level</Label>
                        <div className="relative pt-4">
                          <div className="h-2 w-full bg-muted rounded-full">
                            <div
                              className="absolute h-2 bg-green-500 rounded-full"
                              style={{ width: "65%" }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Poor</span>
                            <span>Fair</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Strength & Power</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Push-Ups (Max Reps)</Label>
                          <span className="text-sm font-medium">18</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Plank Hold (Max Time)</Label>
                          <span className="text-sm font-medium">1:25</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-sm">Vertical Jump</Label>
                          <span className="text-sm font-medium">18 inches</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t">
                        <Label className="text-sm">Strength & Power Level</Label>
                        <div className="relative pt-4">
                          <div className="h-2 w-full bg-muted rounded-full">
                            <div
                              className="absolute h-2 bg-amber-500 rounded-full"
                              style={{ width: "45%" }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Poor</span>
                            <span>Fair</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Mobility & Flexibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm">Sit & Reach</Label>
                        <div className="flex items-center mt-1">
                          <Progress value={60} className="h-2 flex-1" />
                          <span className="text-sm font-medium ml-2">+3 cm</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Shoulder Flexibility</Label>
                        <div className="flex items-center mt-1">
                          <Progress value={40} className="h-2 flex-1" />
                          <span className="text-sm font-medium ml-2">Fair</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Ankle Mobility</Label>
                        <div className="flex items-center mt-1">
                          <Progress value={75} className="h-2 flex-1" />
                          <span className="text-sm font-medium ml-2">Good</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lifestyle" className="pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Nutrition Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="text-sm py-2">
                            Current Diet Pattern
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1 text-sm">
                              <li>• Typically skips breakfast</li>
                              <li>• Lunch often take-out or pre-packaged</li>
                              <li>• Cooks dinner 3-4 times per week</li>
                              <li>• Weekend meals higher in calories</li>
                              <li>• Low vegetable and fruit intake</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="text-sm py-2">
                            Dietary Preferences
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1 text-sm">
                              <li>• Enjoys protein-rich meals</li>
                              <li>• Dislikes most leafy greens</li>
                              <li>• Prefers savory over sweet</li>
                              <li>• No food allergies</li>
                              <li>• Tends to snack when stressed</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="text-sm py-2">
                            Hydration Status
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label className="text-sm">Daily Water Intake</Label>
                                <span className="text-sm font-medium">~4 glasses</span>
                              </div>
                              <Progress value={40} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Current intake is below recommended levels
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Lifestyle Factors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="text-sm py-2">Sleep Patterns</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label className="text-sm">Average Sleep Duration</Label>
                                <span className="text-sm font-medium">6.5 hours</span>
                              </div>
                              <Progress value={65} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Reports difficulty falling asleep, occasional night waking
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="text-sm py-2">Stress Levels</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label className="text-sm">Self-Reported Stress</Label>
                                <span className="text-sm font-medium">Moderate-High</span>
                              </div>
                              <Progress value={70} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Work-related stress, limited stress management techniques
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="text-sm py-2">
                            Activity Level
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label className="text-sm">Daily Step Count</Label>
                                <span className="text-sm font-medium">~6,500</span>
                              </div>
                              <Progress value={50} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Desk job, limited activity outside planned exercise
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="pt-4 space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Client Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Primary Goals</Label>
                        <ul className="mt-2 space-y-2">
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Lose 15 pounds over the next 3 months</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Improve overall strength and energy levels</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Develop consistent exercise routine (3-4x weekly)</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <Label className="font-medium">Secondary Goals</Label>
                        <ul className="mt-2 space-y-2">
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Improve nutrition habits, particularly weekday lunches</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Develop better stress management techniques</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Fitness Program Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-md">
                        <h4 className="font-medium mb-2">Training Focus</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Progressive strength training 2x weekly</li>
                          <li>• HIIT sessions 1-2x weekly for fat loss</li>
                          <li>• Focus on building posterior chain strength</li>
                          <li>• Include mobility work for shoulders and hips</li>
                        </ul>
                      </div>

                      <div className="p-3 border rounded-md">
                        <h4 className="font-medium mb-2">Nutrition Strategies</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Implement simple breakfast options</li>
                          <li>• Meal prep lunches 2x weekly</li>
                          <li>• Increase protein intake to ~1.6g/kg</li>
                          <li>• Develop structured hydration plan</li>
                        </ul>
                      </div>

                      <div className="p-3 border rounded-md">
                        <h4 className="font-medium mb-2">Lifestyle Recommendations</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Implement 10-minute evening wind-down routine</li>
                          <li>• Daily 5-minute breathing practice for stress</li>
                          <li>• Walking breaks during workday (target 8,000 steps)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Assessment Tools</h1>
          <p className="text-muted-foreground">
            Track client progress and collect important health and fitness data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showNewAssessmentDialog} onOpenChange={setShowNewAssessmentDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                New Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Assessment</DialogTitle>
                <DialogDescription>
                  Set up a new assessment for your client
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Select
                    value={formData.client}
                    onValueChange={(value) => handleInputChange("client", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Clients</SelectLabel>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assessment-type" className="text-right">
                    Assessment Type
                  </Label>
                  <Select
                    value={formData.assessmentType}
                    onValueChange={(value) => handleInputChange("assessmentType", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Assessment</SelectItem>
                      <SelectItem value="movement">Movement Screening</SelectItem>
                      <SelectItem value="nutrition">Nutrition Assessment</SelectItem>
                      <SelectItem value="readiness">Daily Readiness Check</SelectItem>
                      <SelectItem value="progress">Progress Check-In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3 flex items-center space-x-2">
                    <Checkbox id="notify-client" />
                    <Label htmlFor="notify-client">Send client preparation instructions</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowNewAssessmentDialog(false)}>Create Assessment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="flex items-center gap-2" variant="outline">
            <BarChart3 className="h-4 w-4" />
            Analysis Tools
          </Button>
        </div>
      </div>

      <Tabs defaultValue="assessments" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">Assessment Templates</TabsTrigger>
          <TabsTrigger value="clients">Client Assessments</TabsTrigger>
          <TabsTrigger value="analysis">Movement Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4 mt-6">
          {selectedAssessment ? (
            <div>
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setSelectedAssessment(null)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
              {renderAssessmentDetails()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Assessment Templates</CardTitle>
                  <CardDescription>
                    Standard assessments and questionnaires for your clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {mockAssessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedAssessment(assessment.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                assessment.type === "comprehensive"
                                  ? "bg-blue-100 text-blue-600"
                                  : assessment.type === "readiness"
                                  ? "bg-green-100 text-green-600"
                                  : assessment.type === "movement"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-amber-100 text-amber-600"
                              }`}
                            >
                              {assessment.type === "comprehensive" ? (
                                <ClipboardCheck className="h-5 w-5" />
                              ) : assessment.type === "readiness" ? (
                                <Heart className="h-5 w-5" />
                              ) : assessment.type === "movement" ? (
                                <Aperture className="h-5 w-5" />
                              ) : (
                                <BarChart3 className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{assessment.name}</h4>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                {assessment.lastCompleted ? (
                                  <span>Last used: {assessment.lastCompleted}</span>
                                ) : (
                                  <span className="text-muted-foreground/70">Not used yet</span>
                                )}
                                <span
                                  className={`ml-2 h-2 w-2 rounded-full ${
                                    assessment.status === "completed"
                                      ? "bg-green-500"
                                      : assessment.status === "in-progress"
                                      ? "bg-amber-500"
                                      : "bg-gray-300"
                                  }`}
                                ></span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 sm:mt-0">
                            <Badge variant="outline">
                              {assessment.type === "comprehensive"
                                ? "Full Assessment"
                                : assessment.type === "readiness"
                                ? "Readiness Check"
                                : assessment.type === "movement"
                                ? "Movement Screen"
                                : "Progress Check"}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/10 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAssessmentDialog(true)}
                  >
                    Create New Template
                  </Button>
                  <Button variant="ghost" size="sm">
                    Import Templates
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Tools</CardTitle>
                  <CardDescription>
                    Specialized tools for client evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Readiness Questionnaire
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Scale className="mr-2 h-4 w-4" />
                      Body Composition
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Ruler className="mr-2 h-4 w-4" />
                      Measurement Tracker
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ListTodo className="mr-2 h-4 w-4" />
                      Goal Setting Worksheet
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Video className="mr-2 h-4 w-4" />
                      Movement Analysis
                    </Button>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h3 className="font-medium mb-2">Assessment Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="client-access" className="text-sm">
                          Client self-assessments
                        </Label>
                        <Switch id="client-access" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-reminders" className="text-sm">
                          Automated reminders
                        </Label>
                        <Switch id="auto-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="progress-reports" className="text-sm">
                          Monthly progress reports
                        </Label>
                        <Switch id="progress-reports" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Assessment History</CardTitle>
              <CardDescription>
                Track assessment completion and schedule follow-ups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Last Assessment</TableHead>
                      <TableHead>Assessment Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Assessment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.lastAssessment}</TableCell>
                        <TableCell>Comprehensive</TableCell>
                        <TableCell>
                          {client.dueAssessment ? (
                            <Badge className="bg-amber-500">Due for reassessment</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-500">
                              Up to date
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.dueAssessment ? "Overdue" : "July 30, 2023"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNewAssessmentDialog(true)}
                          >
                            <ClipboardCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedAssessment(1)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/10 pt-4">
              <Button variant="outline" size="sm">
                Schedule Batch Assessments
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Assessment Schedule
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Comprehensive assessments every 3 months
                      <br />
                      Progress check-ins monthly
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Movement Analysis</CardTitle>
              <CardDescription>
                AI-powered movement analysis from video uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-12">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Upload Movement Video</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                    Record your client performing key movements and upload for AI analysis. Supported
                    movements include: squat, deadlift, push-up, and lunge patterns.
                  </p>
                  <div className="flex gap-4">
                    <Button size="sm" variant="outline">
                      Record Now
                    </Button>
                    <Button size="sm">Upload Video</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Recent Analyses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">Sarah Johnson - Squat Pattern</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Analyzed May 10, 2023
                              </p>
                            </div>
                            <Badge>Completed</Badge>
                          </div>
                        </div>
                        <div className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">Michael Chen - Deadlift Form</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Analyzed April 28, 2023
                              </p>
                            </div>
                            <Badge>Completed</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Analysis Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Analysis Detail Level</Label>
                          <Select defaultValue="standard">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="detailed">Detailed (Pro)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Movement Library</Label>
                          <Select defaultValue="strength">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strength">Strength Movements</SelectItem>
                              <SelectItem value="functional">Functional Patterns</SelectItem>
                              <SelectItem value="sport">Sport-Specific (Pro)</SelectItem>
                              <SelectItem value="rehab">Rehabilitation (Pro)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="outline" className="w-full">
                          <Cog className="h-4 w-4 mr-2" />
                          Configure Analysis Parameters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Movement Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Movement Analysis Report</DialogTitle>
            <DialogDescription>
              Detailed breakdown of movement patterns and recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="font-medium mb-2">Key Findings</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Limited dorsiflexion during squat descent</li>
                  <li>• Right-left asymmetry in hip mechanics</li>
                  <li>• Forward head position during lunge pattern</li>
                  <li>• Weak core activation during rotational movements</li>
                </ul>
              </div>
              <div className="p-3 border rounded-md bg-muted/20">
                <h4 className="font-medium mb-2">Strength Scores</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <Label className="text-xs">Core Stability</Label>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <Label className="text-xs">Hip Mobility</Label>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <Label className="text-xs">Shoulder Control</Label>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div>
                      <Label className="text-xs">Ankle Mobility</Label>
                      <Progress value={30} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Corrective Exercise Recommendations</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border rounded-md">
                  <h5 className="text-sm font-medium">Ankle Mobility</h5>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• Weighted ankle mobilizations: 2x10 each side</li>
                    <li>• Half-kneeling dorsiflexion stretch: 3x30s</li>
                    <li>• Calf foam rolling: 60s per side pre-workout</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-md">
                  <h5 className="text-sm font-medium">Hip Mechanics</h5>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• Single-leg hip hinge: 3x8 each side</li>
                    <li>• 90/90 hip flow: 2 minutes total daily</li>
                    <li>• Glute activation series before lower body work</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Training Modifications</h4>
              <div className="p-3 border rounded-md bg-muted/20">
                <ul className="space-y-1 text-sm">
                  <li>• Elevate heels during squat pattern (temporary)</li>
                  <li>• Additional focus on right side during unilateral work</li>
                  <li>• Include "position before load" cueing in programs</li>
                  <li>• Re-test movement patterns in 4 weeks</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalysisDialog(false)}>
              Close Report
            </Button>
            <Button>Generate Corrective Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
