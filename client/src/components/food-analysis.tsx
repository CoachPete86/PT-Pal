import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Code } from "@/components/ui/code";
import { ChevronDown, ChevronUp, Loader2, Upload } from "lucide-react";

interface MacroSources {
  [key: string]: string;
}

interface MacroDetails {
  total: string;
  sources: MacroSources;
}

interface Macros {
  protein: MacroDetails & { sources: MacroSources };
  carbs: MacroDetails & { fiber: string; sugar: string; sources: MacroSources };
  fats: MacroDetails & { saturated: string; unsaturated: string; sources: MacroSources };
}

interface AnalysisResult {
  mealName: string;
  mealType: string;
  ingredients: string[];
  brandNames: string[];
  calories: number;
  macros: Macros;
  notes: string[];
  servingSize: string;
  healthScore: number;
  clientGoalsAnalysis: string[];
}

export default function FoodAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      try {
        const res = await apiRequest("POST", "/api/analyze-food", { image: base64Image });
        const data = await res.json();
        if (data.error) {
          throw new Error(data.details || data.error);
        }
        return JSON.parse(data.analysis) as AnalysisResult;
      } catch (error: any) {
        throw new Error(error.message || "Failed to analyze food image");
      }
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Your food image has been analyzed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 4MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Failed to read the selected image",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(preview);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Food Analysis</CardTitle>
          <CardDescription>
            Upload a photo of your meal to get nutritional insights powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="food-image" className="relative cursor-pointer">
                <div
                  className={`h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 ${
                    !preview ? "flex items-center justify-center" : ""
                  }`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Food preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click to upload food image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max size: 4MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="food-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {preview && (
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Food"
                )}
              </Button>
            )}

            {analyzeMutation.data && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{analyzeMutation.data.mealName}</CardTitle>
                  <CardDescription>
                    {analyzeMutation.data.mealType} - {analyzeMutation.data.servingSize}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {analyzeMutation.data.calories}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Estimated Calories
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nutrient</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Protein</TableCell>
                        <TableCell>{analyzeMutation.data.macros.protein.total}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Carbohydrates</TableCell>
                        <TableCell>{analyzeMutation.data.macros.carbs.total}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Fats</TableCell>
                        <TableCell>{analyzeMutation.data.macros.fats.total}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Collapsible
                    open={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    className="space-y-4"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-between"
                      >
                        <span>Detailed Analysis</span>
                        {isDetailsOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Protein Sources */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Protein Sources</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Code className="text-sm">
                              {Object.entries(analyzeMutation.data.macros.protein.sources).map(([source, amount]) => (
                                <div key={source} className="flex justify-between">
                                  <span>{source}:</span>
                                  <span>{amount}</span>
                                </div>
                              ))}
                            </Code>
                          </CardContent>
                        </Card>

                        {/* Carbohydrate Details */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Carbohydrates</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Code className="text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between font-medium">
                                  <span>Fiber:</span>
                                  <span>{analyzeMutation.data.macros.carbs.fiber}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Sugar:</span>
                                  <span>{analyzeMutation.data.macros.carbs.sugar}</span>
                                </div>
                                <div className="border-t pt-2">
                                  {Object.entries(analyzeMutation.data.macros.carbs.sources).map(([source, amount]) => (
                                    <div key={source} className="flex justify-between">
                                      <span>{source}:</span>
                                      <span>{amount}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Code>
                          </CardContent>
                        </Card>

                        {/* Fat Details */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Fats</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Code className="text-sm">
                              <div className="space-y-2">
                                <div className="flex justify-between font-medium">
                                  <span>Saturated:</span>
                                  <span>{analyzeMutation.data.macros.fats.saturated}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Unsaturated:</span>
                                  <span>{analyzeMutation.data.macros.fats.unsaturated}</span>
                                </div>
                                <div className="border-t pt-2">
                                  {Object.entries(analyzeMutation.data.macros.fats.sources).map(([source, amount]) => (
                                    <div key={source} className="flex justify-between">
                                      <span>{source}:</span>
                                      <span>{amount}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Code>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Ingredients List */}
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h4 className="font-medium mb-2">Ingredients:</h4>
                        <Code className="text-sm">
                          <ul className="list-disc pl-4 space-y-1">
                            {analyzeMutation.data.ingredients.map((ingredient, index) => (
                              <li key={index}>{ingredient}</li>
                            ))}
                          </ul>
                        </Code>
                      </div>

                      {/* Brand Names */}
                      {analyzeMutation.data.brandNames.length > 0 && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="font-medium mb-2">Brands:</h4>
                          <Code className="text-sm">
                            <div className="flex flex-wrap gap-2">
                              {analyzeMutation.data.brandNames.map((brand, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-background rounded-md"
                                >
                                  {brand}
                                </span>
                              ))}
                            </div>
                          </Code>
                        </div>
                      )}

                      {/* Client Goals Analysis */}
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h4 className="font-medium mb-2">
                          Goals Analysis
                          <span className="ml-2 text-sm text-muted-foreground">
                            (Health Score: {analyzeMutation.data.healthScore}/10)
                          </span>
                        </h4>
                        <Code className="text-sm">
                          <ul className="list-disc pl-4 space-y-1">
                            {analyzeMutation.data.clientGoalsAnalysis.map((analysis, index) => (
                              <li key={index} className="text-muted-foreground">
                                {analysis}
                              </li>
                            ))}
                          </ul>
                        </Code>
                      </div>

                      {/* Analysis Notes */}
                      {analyzeMutation.data.notes && analyzeMutation.data.notes.length > 0 && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="font-medium mb-2">Analysis Notes:</h4>
                          <Code className="text-sm">
                            <ul className="list-disc pl-4 space-y-1">
                              {analyzeMutation.data.notes.map((note, index) => (
                                <li key={index} className="text-muted-foreground">
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </Code>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}