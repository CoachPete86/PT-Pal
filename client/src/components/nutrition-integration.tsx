
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Edit, Trash, Calculator, FileText, Utensils } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Food diary entry type
interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: Date;
}

// Meal plan type
interface MealPlan {
  id: number;
  title: string;
  description: string;
  days: MealPlanDay[];
  startDate: Date;
  endDate: Date;
}

interface MealPlanDay {
  day: string;
  meals: {
    type: string;
    foods: {
      name: string;
      portion: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
}

// User stats for macro calculator
interface UserStats {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
}

export default function NutritionIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("food-diary");
  
  // Food Diary State
  const [newEntry, setNewEntry] = useState<Partial<FoodEntry>>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealType: "breakfast",
  });
  
  // Macro Calculator State
  const [userStats, setUserStats] = useState<UserStats>({
    weight: 70, // kg
    height: 170, // cm
    age: 30,
    gender: "male",
    activityLevel: "moderate",
    goal: "maintain",
  });
  const [macroResults, setMacroResults] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);
  
  // Meal Planning State
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlan | null>(null);
  const [isCreatingMealPlan, setIsCreatingMealPlan] = useState(false);
  const [newMealPlan, setNewMealPlan] = useState({
    title: "",
    description: "",
    duration: 7, // days
  });

  // Food Diary Query
  const foodEntriesQuery = useQuery({
    queryKey: ["food-entries"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/nutrition/entries");
        const data = await res.json();
        return data as FoodEntry[];
      } catch (error) {
        console.error("Failed to fetch food entries:", error);
        return [] as FoodEntry[];
      }
    },
  });

  // Meal Plans Query
  const mealPlansQuery = useQuery({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/nutrition/meal-plans");
        const data = await res.json();
        return data as MealPlan[];
      } catch (error) {
        console.error("Failed to fetch meal plans:", error);
        return [] as MealPlan[];
      }
    },
  });

  // Create Food Entry Mutation
  const createFoodEntryMutation = useMutation({
    mutationFn: async (entry: Partial<FoodEntry>) => {
      const res = await apiRequest("POST", "/api/nutrition/entries", entry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-entries"] });
      toast({
        title: "Food logged successfully",
        description: `Added ${newEntry.name} to your food journal.`,
      });
      setNewEntry({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealType: "breakfast",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to log food",
        description: "There was an error saving your entry.",
        variant: "destructive",
      });
    },
  });

  // Create Meal Plan Mutation
  const createMealPlanMutation = useMutation({
    mutationFn: async (mealPlanData: any) => {
      const res = await apiRequest("POST", "/api/nutrition/generate-meal-plan", mealPlanData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      toast({
        title: "Meal plan created",
        description: "Your meal plan has been generated successfully.",
      });
      setIsCreatingMealPlan(false);
      setNewMealPlan({
        title: "",
        description: "",
        duration: 7,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create meal plan",
        description: "There was an error generating your meal plan.",
        variant: "destructive",
      });
    },
  });

  // Handle input change for food diary entry
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: name === "name" || name === "mealType" ? value : Number(value) || 0,
    });
  };

  // Handle input change for user stats in macro calculator
  const handleStatsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserStats({
      ...userStats,
      [name]: name === "gender" || name === "activityLevel" || name === "goal" 
        ? value 
        : Number(value) || 0,
    });
  };

  // Handle food entry submission
  const handleSubmitFoodEntry = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newEntry.name || !newEntry.calories) {
      toast({
        title: "Missing information",
        description: "Please enter at least a food name and calories.",
        variant: "destructive",
      });
      return;
    }

    createFoodEntryMutation.mutate({
      ...newEntry,
      date: new Date(),
    });
  };

  // Calculate macros based on user stats
  const calculateMacros = () => {
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr;
    if (userStats.gender === "male") {
      bmr = 10 * userStats.weight + 6.25 * userStats.height - 5 * userStats.age + 5;
    } else {
      bmr = 10 * userStats.weight + 6.25 * userStats.height - 5 * userStats.age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const multiplier = activityMultipliers[userStats.activityLevel as keyof typeof activityMultipliers] || 1.55;
    let tdee = bmr * multiplier;

    // Adjust based on goal
    if (userStats.goal === "lose") {
      tdee -= 500; // 500 calorie deficit
    } else if (userStats.goal === "gain") {
      tdee += 500; // 500 calorie surplus
    }

    // Calculate macros (protein, carbs, fat)
    let protein, carbs, fat;
    
    if (userStats.goal === "lose") {
      protein = userStats.weight * 2.2; // Higher protein for weight loss (g)
      fat = (tdee * 0.25) / 9; // 25% of calories from fat
      carbs = (tdee - (protein * 4) - (fat * 9)) / 4; // Remaining calories from carbs
    } else if (userStats.goal === "gain") {
      protein = userStats.weight * 1.8; // Protein for muscle gain (g)
      fat = (tdee * 0.25) / 9; // 25% of calories from fat
      carbs = (tdee - (protein * 4) - (fat * 9)) / 4; // Remaining calories from carbs
    } else {
      // Maintenance
      protein = userStats.weight * 1.6; // Moderate protein (g)
      fat = (tdee * 0.3) / 9; // 30% of calories from fat
      carbs = (tdee - (protein * 4) - (fat * 9)) / 4; // Remaining calories from carbs
    }

    setMacroResults({
      calories: Math.round(tdee),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    });
  };

  // Handle meal plan creation
  const handleCreateMealPlan = () => {
    if (!newMealPlan.title) {
      toast({
        title: "Missing information",
        description: "Please enter a title for your meal plan.",
        variant: "destructive",
      });
      return;
    }

    // Prepare the data for meal plan generation
    const mealPlanData = {
      clientData: {
        age: userStats.age,
        gender: userStats.gender,
        weight: userStats.weight,
        height: userStats.height,
        activityLevel: userStats.activityLevel,
      },
      goals: [userStats.goal],
      nutritionRatios: macroResults ? {
        protein: `${Math.round((macroResults.protein * 4 / macroResults.calories) * 100)}%`,
        carbs: `${Math.round((macroResults.carbs * 4 / macroResults.calories) * 100)}%`,
        fats: `${Math.round((macroResults.fat * 9 / macroResults.calories) * 100)}%`,
      } : undefined,
      duration: newMealPlan.duration,
      mealsPerDay: 3,
      title: newMealPlan.title,
      description: newMealPlan.description,
    };

    createMealPlanMutation.mutate(mealPlanData);
  };

  // Chart data for macros distribution
  const getMacroChartData = () => {
    if (!macroResults) return [];
    
    return [
      { name: "Protein", value: macroResults.protein * 4, colour: "#8884d8" },
      { name: "Carbs", value: macroResults.carbs * 4, colour: "#82ca9d" },
      { name: "Fat", value: macroResults.fat * 9, colour: "#ffc658" },
    ];
  };

  // Get weekly nutrition data for chart
  const getWeeklyNutritionData = () => {
    if (!foodEntriesQuery.data || foodEntriesQuery.data.length === 0) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(dateStr => {
      // Filter entries for this date
      const entriesForDay = foodEntriesQuery.data.filter(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === dateStr;
      });
      
      // Sum up calories, protein, carbs, fat
      const calories = entriesForDay.reduce((sum, entry) => sum + entry.calories, 0);
      const protein = entriesForDay.reduce((sum, entry) => sum + entry.protein, 0);
      const carbs = entriesForDay.reduce((sum, entry) => sum + entry.carbs, 0);
      const fat = entriesForDay.reduce((sum, entry) => sum + entry.fat, 0);
      
      return {
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories,
        protein,
        carbs,
        fat,
      };
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="food-diary" className="flex items-centre gap-2">
            <FileText className="h-4 w-4" />
            Food Diary
          </TabsTrigger>
          <TabsTrigger value="macro-calculator" className="flex items-centre gap-2">
            <Calculator className="h-4 w-4" />
            Macro Calculator
          </TabsTrigger>
          <TabsTrigger value="meal-planning" className="flex items-centre gap-2">
            <Utensils className="h-4 w-4" />
            Meal Planning
          </TabsTrigger>
        </TabsList>

        {/* Food Diary Tab */}
        <TabsContent value="food-diary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Food Diary</CardTitle>
              <CardDescription>Track your daily nutrition intake</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFoodEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Food Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newEntry.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Chicken Salad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mealType">Meal Type</Label>
                    <Select
                      name="mealType"
                      value={newEntry.mealType}
                      onValueChange={(value) => setNewEntry({ ...newEntry, mealType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      name="calories"
                      type="number"
                      value={newEntry.calories || ''}
                      onChange={handleInputChange}
                      placeholder="kcal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      name="protein"
                      type="number"
                      value={newEntry.protein || ''}
                      onChange={handleInputChange}
                      placeholder="g"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      name="carbs"
                      type="number"
                      value={newEntry.carbs || ''}
                      onChange={handleInputChange}
                      placeholder="g"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      name="fat"
                      type="number"
                      value={newEntry.fat || ''}
                      onChange={handleInputChange}
                      placeholder="g"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food Entry
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your recent food log entries</CardDescription>
            </CardHeader>
            <CardContent>
              {foodEntriesQuery.isLoading ? (
                <div className="flex justify-center p-6">Loading entries...</div>
              ) : foodEntriesQuery.data && foodEntriesQuery.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Food</TableHead>
                          <TableHead>Meal</TableHead>
                          <TableHead>Calories</TableHead>
                          <TableHead>Protein</TableHead>
                          <TableHead>Carbs</TableHead>
                          <TableHead>Fat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {foodEntriesQuery.data.slice(0, 5).map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {entry.mealType}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.calories}</TableCell>
                            <TableCell>{entry.protein}g</TableCell>
                            <TableCell>{entry.carbs}g</TableCell>
                            <TableCell>{entry.fat}g</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Weekly Nutrition Chart */}
                  <Card className="p-4">
                    <CardTitle className="text-sm font-medium mb-4">Last 7 Days Nutrition</CardTitle>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getWeeklyNutritionData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="calories" stroke="#8884d8" name="Calories" />
                          <Line type="monotone" dataKey="protein" stroke="#82ca9d" name="Protein (g)" />
                          <Line type="monotone" dataKey="carbs" stroke="#ffc658" name="Carbs (g)" />
                          <Line type="monotone" dataKey="fat" stroke="#ff8042" name="Fat (g)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-centre py-8 text-muted-foreground">
                  No entries yet. Add your first food entry above.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Macro Calculator Tab */}
        <TabsContent value="macro-calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Calculator</CardTitle>
              <CardDescription>Calculate your personalized macronutrient targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={userStats.weight || ''}
                      onChange={handleStatsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={userStats.height || ''}
                      onChange={handleStatsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={userStats.age || ''}
                      onChange={handleStatsChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      value={userStats.gender}
                      onValueChange={(value) => setUserStats({ ...userStats, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      name="activityLevel"
                      value={userStats.activityLevel}
                      onValueChange={(value) => setUserStats({ ...userStats, activityLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                        <SelectItem value="veryActive">Very Active (intense exercise daily)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Select
                      name="goal"
                      value={userStats.goal}
                      onValueChange={(value) => setUserStats({ ...userStats, goal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="gain">Gain Weight/Muscle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={calculateMacros} className="w-full">
                    Calculate Macros
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {macroResults && (
                    <Card className="shadow-sm border">
                      <CardHeader className="pb-2">
                        <CardTitle>Your Macro Targets</CardTitle>
                        <CardDescription>
                          Based on your information and goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-sm font-medium">Daily Calories</div>
                              <div className="text-2xl font-bold">{macroResults.calories} kcal</div>
                            </div>
                            
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-sm font-medium">Protein</div>
                              <div className="text-2xl font-bold">{macroResults.protein}g</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((macroResults.protein * 4 / macroResults.calories) * 100)}% of calories
                              </div>
                            </div>
                            
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-sm font-medium">Carbohydrates</div>
                              <div className="text-2xl font-bold">{macroResults.carbs}g</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((macroResults.carbs * 4 / macroResults.calories) * 100)}% of calories
                              </div>
                            </div>
                            
                            <div className="rounded-lg bg-muted p-3">
                              <div className="text-sm font-medium">Fat</div>
                              <div className="text-2xl font-bold">{macroResults.fat}g</div>
                              <div className="text-xs text-muted-foreground">
                                {Math.round((macroResults.fat * 9 / macroResults.calories) * 100)}% of calories
                              </div>
                            </div>
                          </div>
                          
                          <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getMacroChartData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {getMacroChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.colour} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} kcal`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            These macros are tailored for {userStats.gender === "male" ? "a male" : "a female"} weighing {userStats.weight}kg, {userStats.height}cm tall, {userStats.age} years old, with {userStats.activityLevel} activity level, looking to {userStats.goal === "lose" ? "lose weight" : userStats.goal === "gain" ? "gain weight/muscle" : "maintain weight"}.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meal Planning Tab */}
        <TabsContent value="meal-planning" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-centre justify-between pb-2">
              <div>
                <CardTitle>Meal Plans</CardTitle>
                <CardDescription>Create and view your meal plans</CardDescription>
              </div>
              <Dialog open={isCreatingMealPlan} onOpenChange={setIsCreatingMealPlan}>
                <DialogTrigger asChild>
                  <Button className="flex items-centre gap-2">
                    <Plus className="h-4 w-4" />
                    Create Meal Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Meal Plan</DialogTitle>
                    <DialogDescription>
                      Generate a personalized meal plan based on your nutritional goals.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newMealPlan.title}
                        onChange={(e) => setNewMealPlan({ ...newMealPlan, title: e.target.value })}
                        placeholder="e.g., Weight Loss Meal Plan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newMealPlan.description}
                        onChange={(e) => setNewMealPlan({ ...newMealPlan, description: e.target.value })}
                        placeholder="Brief description of the meal plan goals"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Select
                        value={newMealPlan.duration.toString()}
                        onValueChange={(value) => setNewMealPlan({ ...newMealPlan, duration: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="28">28 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {!macroResults && (
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                        Tip: For better meal plans, calculate your macros in the Macro Calculator tab first.
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingMealPlan(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateMealPlan}
                      disabled={createMealPlanMutation.isPending}
                    >
                      {createMealPlanMutation.isPending ? "Creating..." : "Create Meal Plan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {mealPlansQuery.isLoading ? (
                <div className="text-centre py-12">Loading meal plans...</div>
              ) : mealPlansQuery.data && mealPlansQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {mealPlansQuery.data.map((plan) => (
                    <Card key={plan.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{plan.title}</CardTitle>
                            <CardDescription>
                              {new Date(plan.startDate).toLocaleDateString()} to {new Date(plan.endDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveMealPlan(plan === activeMealPlan ? null : plan)}
                          >
                            {plan === activeMealPlan ? "Hide" : "View"}
                          </Button>
                        </div>
                      </CardHeader>
                      {plan === activeMealPlan && (
                        <CardContent>
                          <div className="space-y-6">
                            {plan.description && (
                              <div className="text-sm">{plan.description}</div>
                            )}
                            
                            {plan.days && plan.days.map((day, index) => (
                              <div key={index} className="space-y-4">
                                <div className="font-medium text-lg">{day.day}</div>
                                <div className="grid grid-cols-1 gap-4">
                                  {day.meals.map((meal, mealIndex) => (
                                    <Card key={mealIndex} className="shadow-none border">
                                      <CardHeader className="py-2 px-4 bg-muted/50">
                                        <CardTitle className="text-sm font-medium capitalize">{meal.type}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-0">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Food</TableHead>
                                              <TableHead>Portion</TableHead>
                                              <TableHead>Calories</TableHead>
                                              <TableHead>P/C/F</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {meal.foods.map((food, foodIndex) => (
                                              <TableRow key={foodIndex}>
                                                <TableCell>{food.name}</TableCell>
                                                <TableCell>{food.portion}</TableCell>
                                                <TableCell>{food.calories} kcal</TableCell>
                                                <TableCell>{food.protein}g / {food.carbs}g / {food.fat}g</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            ))}
                            
                            {/* If the plan doesn't have the expected format, just display raw content */}
                            {!plan.days && typeof plan.content === 'object' && (
                              <pre className="text-xs overflow-auto max-h-[500px] p-4 bg-muted rounded-md">
                                {JSON.stringify(plan.content, null, 2)}
                              </pre>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-centre py-12 text-muted-foreground">
                  No meal plans yet. Create your first meal plan to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
