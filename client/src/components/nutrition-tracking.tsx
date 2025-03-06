import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FoodAnalysis } from "./food-analysis";
import {
  BarChart as LucideBarChart,
  PieChart as LucidePieChart,
  Calendar,
  PlusCircle,
  ArrowLeftRight,
  CalendarPlus,
  Loader2,
  SaveIcon
} from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

interface NutritionEntry {
  id: number;
  userId: number;
  clientId?: number;
  date: string;
  mealType: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  notes: string;
  image?: string;
  analysis: Record<string, any>;
}

interface MealPlan {
  id: number;
  trainerId: number;
  clientId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  meals: MealPlanDay[];
  status: 'active' | 'completed' | 'draft';
}

interface MealPlanDay {
  day: number;
  meals: {
    mealType: string;
    foods: string[];
    macros: {
      calories: number;
      protein: string;
      carbs: string;
      fats: string;
    };
    notes?: string;
  }[];
}

function DropdownNav({ options, activeTab, onSelect }: { options: { id: string; label: string }[], activeTab: string, onSelect: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)}>{options.find(option => option.id === activeTab)?.label || 'Select View'}</Button>
      {isOpen && (
        <ul className="absolute bg-white shadow-md mt-2 py-2 rounded-md w-full">
          {options.map(option => (
            <li key={option.id} className="cursor-pointer px-4 py-2 hover:bg-gray-100" onClick={() => { onSelect(option.id); setIsOpen(false); }}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export default function NutritionTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Sample data - in a real app this would come from API
  const macroData = [
    { name: "Protein", value: 90 },
    { name: "Carbs", value: 150 },
    { name: "Fat", value: 45 },
  ];

  const weeklyData = [
    { day: "Mon", calories: 1850, target: 2000 },
    { day: "Tue", calories: 1920, target: 2000 },
    { day: "Wed", calories: 2100, target: 2000 },
    { day: "Thu", calories: 1780, target: 2000 },
    { day: "Fri", calories: 2200, target: 2000 },
    { day: "Sat", calories: 2350, target: 2000 },
    { day: "Sun", calories: 1950, target: 2000 },
  ];


  // Query food diary entries (retained from original, but not used in edited example)
  const { data: foodDiaryEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/nutrition/entries', dateRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/nutrition/entries?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch nutrition entries");
      }
      return res.json();
    }
  });

  // Query meal plans (retained from original, but not used in edited example)
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery({
    queryKey: ['/api/nutrition/meal-plans'],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/nutrition/meal-plans`);
      if (!res.ok) {
        throw new Error("Failed to fetch meal plans");
      }
      return res.json();
    },
    enabled: user?.role === 'trainer'
  });

  // Save analyzed food to diary (retained from original, but not used in edited example)
  const saveToFoodDiaryMutation = useMutation({
    mutationFn: async (entry: Partial<NutritionEntry>) => {
      const res = await apiRequest("POST", "/api/nutrition/entries", entry);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save to food diary");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition/entries'] });
      toast({
        title: "Entry Saved",
        description: "Food has been added to your diary",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle saving analysis to food diary (retained from original, but not used in edited example)
  const handleSaveToFoodDiary = (analysis: any, mealType: string) => {
    if (!analysis) return;

    saveToFoodDiaryMutation.mutate({
      date: new Date().toISOString(),
      mealType,
      calories: analysis.calories,
      protein: analysis.macros.protein.total,
      carbs: analysis.macros.carbs.total,
      fats: analysis.macros.fats.total,
      notes: analysis.notes?.join(", ") || "",
      analysis: analysis,
    });
  };

  const mealTypeOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Nutrition Tracking</h2>
      <div className="mb-6 max-w-[300px]">
          <DropdownNav 
            options={[
              { id: "daily", label: "Daily View" },
              { id: "weekly", label: "Weekly Progress" },
              { id: "meals", label: "Meal Plans" }
            ]}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        </div>
      {activeTab === "daily" && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Nutrition</CardTitle>
              <CardDescription>Track your daily intake and macros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Calorie Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">1,850</p>
                        <p className="text-xs text-muted-foreground">of 2,000 daily goal</p>
                      </div>
                      <div className="h-16 w-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Consumed", value: 1850 },
                                { name: "Remaining", value: 150 }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={35}
                              fill="#8884d8"
                              dataKey="value"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Macro Nutrients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Add Food</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="food-item">Food Item</Label>
                        <Input id="food-item" placeholder="e.g., Grilled Chicken" />
                      </div>
                      <div>
                        <Label htmlFor="portion">Portion</Label>
                        <Input id="portion" placeholder="e.g., 100g" />
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full">Add to Log</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <div>
                        <h3 className="text-sm font-medium">Calorie Sources</h3>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Breakfast", calories: 450 },
                            { name: "Lunch", calories: 650 },
                            { name: "Dinner", calories: 550 },
                            { name: "Snacks", calories: 200 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="calories" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      {activeTab === "weekly" && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Your calorie intake for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calories" fill="#8884d8" name="Calories" />
                    <Bar dataKey="target" fill="#82ca9d" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      {activeTab === "meals" && (
          <Card>
            <CardHeader>
              <CardTitle>Meal Plans</CardTitle>
              <CardDescription>View and schedule your meal plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-12">
                <p className="text-muted-foreground mb-4">No meal plans created yet</p>
                <Button>Create Meal Plan</Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}