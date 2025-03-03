import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Separator } from "@/components/ui/separator";
import { FoodAnalysis } from "./food-analysis";
import { 
  BarChart, 
  PieChart, 
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

export default function NutritionTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("food-diary");
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Query food diary entries
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

  // Query meal plans
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

  // Save analyzed food to diary
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

  // Handle saving analysis to food diary
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

  // Generate totals
  const calculateTotals = (entries: NutritionEntry[]) => {
    return entries.reduce((acc, entry) => {
      return {
        calories: acc.calories + entry.calories,
        protein: acc.protein + parseFloat(entry.protein),
        carbs: acc.carbs + parseFloat(entry.carbs),
        fats: acc.fats + parseFloat(entry.fats),
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  // Group entries by date and meal type
  const groupedEntries = foodDiaryEntries.reduce((acc: Record<string, Record<string, NutritionEntry[]>>, entry: NutritionEntry) => {
    const date = entry.date.split('T')[0];
    if (!acc[date]) acc[date] = {};
    if (!acc[date][entry.mealType]) acc[date][entry.mealType] = [];
    acc[date][entry.mealType].push(entry);
    return acc;
  }, {});

  const mealTypeOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nutrition Tracking</h1>
        <CalendarDateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="food-diary" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Food Diary
          </TabsTrigger>
          <TabsTrigger value="meal-planning" className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            Meal Planning
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>
        
        {/* Food Diary Tab */}
        <TabsContent value="food-diary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Food Analysis Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Add Food</CardTitle>
                <CardDescription>
                  Upload a photo of your meal or manually add food items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tabs defaultValue="photo">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="photo">Photo Analysis</TabsTrigger>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>
                    <TabsContent value="photo">
                      <FoodAnalysis onAnalyzed={setSelectedAnalysis} />
                      
                      {selectedAnalysis && (
                        <div className="mt-4 space-y-4">
                          <Separator />
                          <h3 className="font-medium">Save to Food Diary</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {mealTypeOptions.map(type => (
                              <Button 
                                key={type} 
                                variant="outline" 
                                onClick={() => handleSaveToFoodDiary(selectedAnalysis, type)}
                                disabled={saveToFoodDiaryMutation.isPending}
                              >
                                {saveToFoodDiaryMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <SaveIcon className="mr-2 h-4 w-4" />
                                )}
                                {type}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="manual">
                      <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md border-muted-foreground/25">
                        <p className="text-muted-foreground">Manual food entry coming soon</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            {/* Food Diary Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Summary</CardTitle>
                <CardDescription>
                  {dateRange.from && dateRange.to ? (
                    `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                  ) : (
                    "Select a date range"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEntries ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : foodDiaryEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <p className="text-muted-foreground mb-4">No entries found in this date range</p>
                    <Button variant="outline" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Your First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold">
                              {calculateTotals(foodDiaryEntries).calories.toFixed(0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Average Daily Calories</p>
                          </div>
                        </CardContent>
                      </Card>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                          <span className="text-lg font-semibold">{calculateTotals(foodDiaryEntries).protein.toFixed(0)}g</span>
                          <span className="text-xs text-muted-foreground">Protein</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                          <span className="text-lg font-semibold">{calculateTotals(foodDiaryEntries).carbs.toFixed(0)}g</span>
                          <span className="text-xs text-muted-foreground">Carbs</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 border rounded-md">
                          <span className="text-lg font-semibold">{calculateTotals(foodDiaryEntries).fats.toFixed(0)}g</span>
                          <span className="text-xs text-muted-foreground">Fats</span>
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Meal</TableHead>
                          <TableHead className="text-right">Calories</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(groupedEntries).map(([date, mealTypes]) =>
                          Object.entries(mealTypes).map(([mealType, entries], index) => (
                            <TableRow key={`${date}-${mealType}-${index}`}>
                              <TableCell>{entries.length > 0 ? format(new Date(date), "MMM d") : ''}</TableCell>
                              <TableCell>{mealType}</TableCell>
                              <TableCell className="text-right">
                                {entries.reduce((sum, entry) => sum + entry.calories, 0).toFixed(0)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Food Diary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Food Diary History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEntries ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : foodDiaryEntries.length === 0 ? (
                <div className="flex justify-center py-6">
                  <p className="text-muted-foreground">No entries found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedEntries).map(([date, mealTypes]) => (
                    <div key={date} className="space-y-4">
                      <h3 className="font-semibold">{format(new Date(date), "EEEE, MMMM d, yyyy")}</h3>
                      <div className="space-y-4">
                        {Object.entries(mealTypes).map(([mealType, entries]) => (
                          <div key={`${date}-${mealType}`} className="border rounded-md p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{mealType}</h4>
                              <div className="text-sm text-muted-foreground">
                                {entries.reduce((sum, entry) => sum + entry.calories, 0).toFixed(0)} calories
                              </div>
                            </div>
                            <div className="space-y-2">
                              {entries.map((entry) => (
                                <div key={entry.id} className="flex justify-between items-center border-t pt-2">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {entry.analysis?.mealName || "Food Entry"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      P: {entry.protein} • C: {entry.carbs} • F: {entry.fats}
                                    </p>
                                  </div>
                                  <div className="text-sm">{entry.calories} cal</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Meal Planning Tab */}
        <TabsContent value="meal-planning" className="space-y-6">
          {user?.role !== 'trainer' ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">Meal plans will appear here when your trainer creates one for you</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Meal Plans</h2>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create Meal Plan
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Create Meal Plan</SheetTitle>
                      <SheetDescription>
                        Create a customized meal plan for your client
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      {/* Meal Plan Form - to be implemented */}
                      <p className="text-muted-foreground text-center py-8">Meal plan creation form coming soon</p>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              {isLoadingMealPlans ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : mealPlans.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-4">You haven't created any meal plans yet</p>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Create Your First Meal Plan
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle>Create Meal Plan</SheetTitle>
                            <SheetDescription>
                              Create a customized meal plan for your client
                            </SheetDescription>
                          </SheetHeader>
                          <div className="py-4">
                            {/* Meal Plan Form - to be implemented */}
                            <p className="text-muted-foreground text-center py-8">Meal plan creation form coming soon</p>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Render meal plans here */}
                  <p className="text-muted-foreground text-center col-span-full py-8">Meal plan display coming soon</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Analysis</CardTitle>
              <CardDescription>
                Track your nutrition patterns and progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">Detailed nutrition analytics coming soon</p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <BarChart className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-sm font-medium">Macro Trends</h3>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <PieChart className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-sm font-medium">Calorie Sources</h3>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
