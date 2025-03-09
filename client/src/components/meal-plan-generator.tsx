import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-states";
import { Slider } from "@/components/ui/slider";

// Define form schema
const mealPlanFormSchema = z.object({
  clientData: z.object({
    age: z.string().optional(),
    gender: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    activityLevel: z.string().default("moderate"),
  }),
  preferences: z.object({
    preferred: z.array(z.string()).default([]),
    disliked: z.array(z.string()).default([]),
  }),
  dietaryRestrictions: z.array(z.string()).default([]),
  goals: z.array(z.string()).default(["balanced nutrition"]),
  nutritionRatios: z.object({
    protein: z.string().default("25%"),
    carbs: z.string().default("50%"),
    fats: z.string().default("25%"),
  }),
  duration: z.number().default(7),
  mealsPerDay: z.number().default(3),
});

type MealPlanFormValues = z.infer<typeof mealPlanFormSchema>;

interface MealPlanIngredient {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlanMeal {
  name: string;
  ingredients: MealPlanIngredient[];
  preparation: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface MealPlanDay {
  day: number;
  date?: string;
  targetCalories: number;
  meals: MealPlanMeal[];
  macroBreakdown: {
    protein: {
      grams: number;
      percentage: number;
    };
    carbs: {
      grams: number;
      percentage: number;
    };
    fat: {
      grams: number;
      percentage: number;
    };
  };
}

interface GroceryItem {
  name: string;
  amount: string;
  category: string;
}

interface MealPlan {
  id?: number;
  title: string;
  description?: string;
  clientInfo?: {
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
    activityLevel: string;
  };
  dailyCalorieTarget: number;
  days: MealPlanDay[];
  groceryList: GroceryItem[];
  notes?: string[];
}

export default function MealPlanGenerator({ clientId }: { clientId?: number }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generator");
  const [generatedMealPlan, setGeneratedMealPlan] = useState<MealPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [preferredFood, setPreferredFood] = useState("");
  const [dislikedFood, setDislikedFood] = useState("");
  const [dietaryRestriction, setDietaryRestriction] = useState("");
  const [goal, setGoal] = useState("");

  // Get form defaults
  const defaultValues: MealPlanFormValues = {
    clientData: {
      age: "",
      gender: "",
      weight: "",
      height: "",
      activityLevel: "moderate",
    },
    preferences: {
      preferred: [],
      disliked: [],
    },
    dietaryRestrictions: [],
    goals: ["balanced nutrition"],
    nutritionRatios: {
      protein: "25%",
      carbs: "50%",
      fats: "25%",
    },
    duration: 7,
    mealsPerDay: 3,
  };

  // Set up form
  const form = useForm<MealPlanFormValues>({
    resolver: zodResolver(mealPlanFormSchema),
    defaultValues,
  });

  // Create mutation for meal plan generation
  const generateMutation = useMutation({
    mutationFn: async (values: MealPlanFormValues) => {
      const response = await apiRequest("POST", "/api/nutrition/generate-meal-plan", {
        body: JSON.stringify({
          ...values,
          clientId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate meal plan");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedMealPlan(data.mealPlan);
      setActiveTab("meal-plan");
      toast({
        title: "Meal plan generated successfully!",
        description: "Your personalized meal plan is ready to view.",
      });
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate meal plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to add preferred food
  const addPreferredFood = () => {
    if (!preferredFood.trim()) return;
    
    const updatedPreferred = [...form.getValues().preferences.preferred, preferredFood];
    form.setValue("preferences.preferred", updatedPreferred);
    setPreferredFood("");
  };

  // Function to add disliked food
  const addDislikedFood = () => {
    if (!dislikedFood.trim()) return;
    
    const updatedDisliked = [...form.getValues().preferences.disliked, dislikedFood];
    form.setValue("preferences.disliked", updatedDisliked);
    setDislikedFood("");
  };

  // Function to add dietary restriction
  const addDietaryRestriction = () => {
    if (!dietaryRestriction.trim()) return;
    
    const updatedRestrictions = [...form.getValues().dietaryRestrictions, dietaryRestriction];
    form.setValue("dietaryRestrictions", updatedRestrictions);
    setDietaryRestriction("");
  };

  // Function to add goal
  const addGoal = () => {
    if (!goal.trim()) return;
    
    const updatedGoals = [...form.getValues().goals, goal];
    form.setValue("goals", updatedGoals);
    setGoal("");
  };

  // Handle form submission
  const onSubmit = (values: MealPlanFormValues) => {
    generateMutation.mutate(values);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="generator">Meal Plan Generator</TabsTrigger>
          <TabsTrigger value="meal-plan" disabled={!generatedMealPlan}>
            Meal Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Meal Plan Generator</CardTitle>
              <CardDescription>
                Generate a customised meal plan based on your client's needs and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientData.age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age (years)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 35" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientData.gender"
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientData.weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 70" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientData.height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 175" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientData.activityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select activity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                                <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                                <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                                <SelectItem value="very_active">Very Active (2x per day)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">Dietary Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Preferred Foods</FormLabel>
                        <div className="flex space-x-2 mb-2">
                          <Input
                            placeholder="e.g. Chicken, Rice, Broccoli"
                            value={preferredFood}
                            onChange={(e) => setPreferredFood(e.target.value)}
                          />
                          <Button type="button" onClick={addPreferredFood} className="flex-shrink-0">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch("preferences.preferred").map((item, i) => (
                            <Badge key={i} variant="secondary" className="text-sm">
                              {item}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const updated = form.getValues().preferences.preferred.filter((_, index) => index !== i);
                                  form.setValue("preferences.preferred", updated);
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <FormLabel>Disliked Foods</FormLabel>
                        <div className="flex space-x-2 mb-2">
                          <Input
                            placeholder="e.g. Mushrooms, Seafood"
                            value={dislikedFood}
                            onChange={(e) => setDislikedFood(e.target.value)}
                          />
                          <Button type="button" onClick={addDislikedFood} className="flex-shrink-0">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch("preferences.disliked").map((item, i) => (
                            <Badge key={i} variant="secondary" className="text-sm">
                              {item}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  const updated = form.getValues().preferences.disliked.filter((_, index) => index !== i);
                                  form.setValue("preferences.disliked", updated);
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">Dietary Restrictions</h3>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        placeholder="e.g. Gluten-free, Dairy-free, Vegan"
                        value={dietaryRestriction}
                        onChange={(e) => setDietaryRestriction(e.target.value)}
                      />
                      <Button type="button" onClick={addDietaryRestriction} className="flex-shrink-0">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("dietaryRestrictions").map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          {item}
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const updated = form.getValues().dietaryRestrictions.filter((_, index) => index !== i);
                              form.setValue("dietaryRestrictions", updated);
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">Nutrition Goals</h3>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        placeholder="e.g. Weight loss, Muscle gain, Improved energy"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                      <Button type="button" onClick={addGoal} className="flex-shrink-0">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("goals").map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          {item}
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const updated = form.getValues().goals.filter((_, index) => index !== i);
                              form.setValue("goals", updated);
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">Macro Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="nutritionRatios.protein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein: {field.value}</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15%">15%</SelectItem>
                                  <SelectItem value="20%">20%</SelectItem>
                                  <SelectItem value="25%">25%</SelectItem>
                                  <SelectItem value="30%">30%</SelectItem>
                                  <SelectItem value="35%">35%</SelectItem>
                                  <SelectItem value="40%">40%</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nutritionRatios.carbs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs: {field.value}</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30%">30%</SelectItem>
                                  <SelectItem value="35%">35%</SelectItem>
                                  <SelectItem value="40%">40%</SelectItem>
                                  <SelectItem value="45%">45%</SelectItem>
                                  <SelectItem value="50%">50%</SelectItem>
                                  <SelectItem value="55%">55%</SelectItem>
                                  <SelectItem value="60%">60%</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nutritionRatios.fats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fats: {field.value}</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15%">15%</SelectItem>
                                  <SelectItem value="20%">20%</SelectItem>
                                  <SelectItem value="25%">25%</SelectItem>
                                  <SelectItem value="30%">30%</SelectItem>
                                  <SelectItem value="35%">35%</SelectItem>
                                  <SelectItem value="40%">40%</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />

                    <h3 className="text-lg font-medium">Meal Plan Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration: {field.value} days</FormLabel>
                            <FormControl>
                              <Slider
                                min={1}
                                max={14}
                                step={1}
                                defaultValue={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mealsPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meals Per Day: {field.value}</FormLabel>
                            <FormControl>
                              <Slider
                                min={2}
                                max={6}
                                step={1}
                                defaultValue={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <>
                        <LoadingState className="mr-2" />
                        Generating Meal Plan...
                      </>
                    ) : (
                      "Generate Meal Plan"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meal-plan">
          {generatedMealPlan ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{generatedMealPlan.title || "Personalized Meal Plan"}</CardTitle>
                  <CardDescription>
                    Daily calorie target: {generatedMealPlan.dailyCalorieTarget} calories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex overflow-x-auto pb-2 gap-2">
                      {generatedMealPlan.days.map((day, index) => (
                        <Button
                          key={index}
                          variant={selectedDayIndex === index ? "default" : "outline"}
                          onClick={() => setSelectedDayIndex(index)}
                          className="flex-shrink-0"
                        >
                          Day {day.day}
                        </Button>
                      ))}
                    </div>

                    {generatedMealPlan.days[selectedDayIndex] && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="p-4">
                            <CardTitle className="text-sm mb-2">Protein</CardTitle>
                            <div className="text-2xl font-bold">
                              {generatedMealPlan.days[selectedDayIndex].macroBreakdown.protein.grams}g
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {generatedMealPlan.days[selectedDayIndex].macroBreakdown.protein.percentage}% of calories
                            </div>
                          </Card>
                          <Card className="p-4">
                            <CardTitle className="text-sm mb-2">Carbs</CardTitle>
                            <div className="text-2xl font-bold">
                              {generatedMealPlan.days[selectedDayIndex].macroBreakdown.carbs.grams}g
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {generatedMealPlan.days[selectedDayIndex].macroBreakdown.carbs.percentage}% of calories
                            </div>
                          </Card>
                          <Card className="p-4">
                            <CardTitle className="text-sm mb-2">Fat</CardTitle>
                            <div className="text-2xl font-bold">
                              {generatedMealPlan.days[selectedDayIndex].macroBreakdown.fat.grams}g
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {generatedMealPlan.days[selectedDayIndex].macroBreakdown.fat.percentage}% of calories
                            </div>
                          </Card>
                        </div>

                        <div className="space-y-4">
                          {generatedMealPlan.days[selectedDayIndex].meals.map((meal, mealIndex) => (
                            <Card key={mealIndex}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{meal.name}</CardTitle>
                                <div className="flex gap-2 text-sm">
                                  <Badge variant="outline">{meal.totalCalories} cal</Badge>
                                  <Badge variant="outline">P: {meal.totalProtein}g</Badge>
                                  <Badge variant="outline">C: {meal.totalCarbs}g</Badge>
                                  <Badge variant="outline">F: {meal.totalFat}g</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <h4 className="font-semibold mb-2">Ingredients:</h4>
                                <ul className="list-disc pl-5 mb-3">
                                  {meal.ingredients.map((ingredient, i) => (
                                    <li key={i} className="text-sm">
                                      {ingredient.name} ({ingredient.amount})
                                      <span className="text-xs text-muted-foreground ml-1">
                                        {ingredient.calories} cal | {ingredient.protein}g P | {ingredient.carbs}g C | {ingredient.fat}g F
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <h4 className="font-semibold mb-2">Preparation:</h4>
                                <p className="text-sm">{meal.preparation}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grocery List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(
                      generatedMealPlan.groceryList.reduce((acc, item) => {
                        if (!acc[item.category]) {
                          acc[item.category] = [];
                        }
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, GroceryItem[]>)
                    ).map(([category, items]) => (
                      <Card key={category} className="bg-background">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5">
                            {items.map((item, index) => (
                              <li key={index} className="text-sm">
                                {item.name} ({item.amount})
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-centre">
                  <Button
                    onClick={() => {
                      // Print functionality
                      window.print();
                    }}
                  >
                    Print Grocery List
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-centre justify-centre h-40">
                <p className="text-muted-foreground">
                  No meal plan generated yet. Please use the generator to create a meal plan.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}