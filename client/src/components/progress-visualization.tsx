import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, DownloadIcon, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressVisualizationProps {
  clientId?: number;
}

export function ProgressVisualization({ clientId }: ProgressVisualizationProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [activeMetric, setActiveMetric] = useState<string>("weight");
  const [chartType, setChartType] = useState<string>("line");
  const { toast } = useToast();

  // Fetch client progress data
  const { data: progressData, isLoading } = useQuery({
    queryKey: [
      "/api/client-progress", 
      clientId, 
      dateRange.from?.toISOString(), 
      dateRange.to?.toISOString()
    ],
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch nutrition data separately
  const { data: nutritionData, isLoading: isLoadingNutrition } = useQuery({
    queryKey: [
      "/api/nutrition/entries", 
      clientId, 
      dateRange.from?.toISOString(), 
      dateRange.to?.toISOString()
    ],
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process workout metrics data for charts
  const processedWorkoutData = progressData?.workouts?.map((entry: any) => ({
    date: format(new Date(entry.date), "MMM d"),
    weight: entry.metrics?.weight || 0,
    bodyFat: entry.metrics?.bodyFat || 0,
    muscleGain: entry.metrics?.muscleGain || 0,
    strength: calculateStrengthScore(entry.exercises),
    endurance: calculateEnduranceScore(entry.exercises),
    intensity: entry.metrics?.intensity || 0,
  })) || [];

  // Process nutrition metrics for charts
  const processedNutritionData = nutritionData?.map((entry: any) => ({
    date: format(new Date(entry.date), "MMM d"),
    calories: entry.metrics?.calories || 0,
    protein: entry.metrics?.protein || 0,
    carbs: entry.metrics?.carbs || 0,
    fats: entry.metrics?.fats || 0,
    water: entry.metrics?.water || 0,
  })) || [];

  // Helper functions to calculate derived metrics
  function calculateStrengthScore(exercises: any[] = []) {
    if (!exercises || exercises.length === 0) return 0;
    
    // Simple algorithm: average of weight lifted × reps across all strength exercises
    const strengthExercises = exercises.filter(ex => 
      ex.type === 'strength' && ex.weight && ex.reps);
    
    if (strengthExercises.length === 0) return 0;
    
    return strengthExercises.reduce((sum, ex) => 
      sum + (ex.weight * ex.reps), 0) / strengthExercises.length;
  }

  function calculateEnduranceScore(exercises: any[] = []) {
    if (!exercises || exercises.length === 0) return 0;
    
    // Simple algorithm: average duration of cardio exercises
    const cardioExercises = exercises.filter(ex => 
      ex.type === 'cardio' && ex.duration);
    
    if (cardioExercises.length === 0) return 0;
    
    return cardioExercises.reduce((sum, ex) => 
      sum + ex.duration, 0) / cardioExercises.length;
  }

  const handleExportData = () => {
    try {
      // Combine workout and nutrition data
      const combinedData = {
        workoutMetrics: processedWorkoutData,
        nutritionMetrics: processedNutritionData,
        dateRange: {
          from: dateRange.from,
          to: dateRange.to
        }
      };
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `client-progress-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Progress data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the progress data.",
        variant: "destructive",
      });
    }
  };

  if (!clientId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please select a client to view progress visualization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleExportData}
            title="Export Data"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="physical" className="space-y-4">
        <TabsList>
          <TabsTrigger value="physical">Physical Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="physical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight Tracking Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weight Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : processedWorkoutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="weight" fill="#8884d8" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No weight data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Body Fat Tracking Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Body Composition</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : processedWorkoutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bodyFat" stroke="#ff8042" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="muscleGain" stroke="#82ca9d" activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bodyFat" fill="#ff8042" />
                        <Bar dataKey="muscleGain" fill="#82ca9d" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No body composition data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strength Tracking Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Strength Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : processedWorkoutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="strength" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="strength" fill="#8884d8" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No strength data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endurance Tracking Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Endurance Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : processedWorkoutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="endurance" stroke="#82ca9d" activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={processedWorkoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="endurance" fill="#82ca9d" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No endurance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calories Tracking Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Caloric Intake</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNutrition ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : processedNutritionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={processedNutritionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="calories" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={processedNutritionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calories" fill="#8884d8" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No calorie data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Macronutrients Tracking Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Macronutrients</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNutrition ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : processedNutritionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === "line" ? (
                      <LineChart data={processedNutritionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="protein" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="carbs" stroke="#82ca9d" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="fats" stroke="#ff8042" activeDot={{ r: 8 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={processedNutritionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="protein" fill="#8884d8" />
                        <Bar dataKey="carbs" fill="#82ca9d" />
                        <Bar dataKey="fats" fill="#ff8042" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px]">
                    <p className="text-muted-foreground">No macronutrient data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProgressVisualization;
