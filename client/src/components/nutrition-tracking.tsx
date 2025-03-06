import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function NutritionTracking() {
  const { toast } = useToast();
  const [newEntry, setNewEntry] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "breakfast"
  });

  // Simulated food entries that would normally come from an API
  const [foodEntries, setFoodEntries] = useState([
    { id: 1, name: "Oatmeal with Berries", calories: 350, protein: 12, carbs: 60, fat: 7, mealType: "breakfast", date: new Date() }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: name === "name" ? value : Number(value) || ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!newEntry.name || !newEntry.calories) {
      toast({
        title: "Missing information",
        description: "Please enter at least a food name and calories.",
        variant: "destructive"
      });
      return;
    }

    // Create new entry
    const entry = {
      id: Date.now(),
      ...newEntry,
      date: new Date()
    };

    setFoodEntries([entry, ...foodEntries]);

    // Reset form
    setNewEntry({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      mealType: "breakfast"
    });

    toast({
      title: "Food logged successfully",
      description: `Added ${entry.name} to your food journal.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Tracking</CardTitle>
        <CardDescription>Track your daily nutrition intake</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly-overview">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="weekly-overview">Weekly Overview</TabsTrigger>
            <TabsTrigger value="log-food">Log Food</TabsTrigger>
            <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly-overview" className="space-y-4">
            <div className="bg-card p-4 rounded-lg border mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Weekly Nutrition Summary</h3>
                <Select defaultValue="current">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">This Week</SelectItem>
                    <SelectItem value="previous">Last Week</SelectItem>
                    <SelectItem value="twoWeeks">2 Weeks Ago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Mon', calories: 2100, protein: 130, carbs: 190, fat: 70 },
                      { day: 'Tue', calories: 1950, protein: 125, carbs: 180, fat: 65 },
                      { day: 'Wed', calories: 2200, protein: 140, carbs: 200, fat: 75 },
                      { day: 'Thu', calories: 2000, protein: 120, carbs: 185, fat: 70 },
                      { day: 'Fri', calories: 2250, protein: 145, carbs: 205, fat: 80 },
                      { day: 'Sat', calories: 1800, protein: 115, carbs: 160, fat: 60 },
                      { day: 'Sun', calories: 2100, protein: 135, carbs: 195, fat: 70 },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calories" fill="#8884d8" name="Calories (kcal)" />
                    <Bar dataKey="protein" fill="#82ca9d" name="Protein (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">2,050</div>
                    <p className="text-xs text-muted-foreground">Avg. Daily Calories</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">130g</div>
                    <p className="text-xs text-muted-foreground">Avg. Daily Protein</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">188g</div>
                    <p className="text-xs text-muted-foreground">Avg. Daily Carbs</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">70g</div>
                    <p className="text-xs text-muted-foreground">Avg. Daily Fat</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="log-food">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Food Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Food Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={newEntry.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Grilled Chicken Salad"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mealType">Meal Type</Label>
                        <Select
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calories">Calories</Label>
                        <Input
                          id="calories"
                          name="calories"
                          value={newEntry.calories}
                          onChange={handleInputChange}
                          placeholder="kcal"
                          type="number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="protein">Protein (g)</Label>
                        <Input
                          id="protein"
                          name="protein"
                          value={newEntry.protein}
                          onChange={handleInputChange}
                          placeholder="g"
                          type="number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carbs">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          name="carbs"
                          value={newEntry.carbs}
                          onChange={handleInputChange}
                          placeholder="g"
                          type="number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fat">Fat (g)</Label>
                        <Input
                          id="fat"
                          name="fat"
                          value={newEntry.fat}
                          onChange={handleInputChange}
                          placeholder="g"
                          type="number"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full">Log Food</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Food Journal</CardTitle>
                </CardHeader>
                <CardContent>
                  {foodEntries.length > 0 ? (
                    <div className="space-y-4">
                      {foodEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{entry.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{entry.mealType}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{entry.calories} kcal</div>
                            <div className="text-sm text-muted-foreground">
                              P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No food entries today. Start by logging your meals.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meal-plans">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meal Plans</CardTitle>
                <CardDescription>View and create meal plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Available Meal Plans</h3>
                    <Button variant="outline" size="sm">Create New Plan</Button>
                  </div>

                  <div className="rounded-lg border divide-y">
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">High Protein Meal Plan</div>
                        <div className="text-sm text-muted-foreground">7-day plan • 2200 kcal/day</div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">Weight Loss Plan</div>
                        <div className="text-sm text-muted-foreground">14-day plan • 1800 kcal/day</div>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}