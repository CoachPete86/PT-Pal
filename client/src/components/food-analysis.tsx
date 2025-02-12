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
import { Loader2, Upload } from "lucide-react";

interface AnalysisResult {
  mealName: string;
  mealType: string;
  ingredients: string[];
  brandNames: string[];
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  notes: string[];
  servingSize: string;
}

export default function FoodAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

                  <div className="space-y-2">
                    <h4 className="font-medium">Ingredients:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {analyzeMutation.data.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analyzeMutation.data.brandNames.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Brands:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyzeMutation.data.brandNames.map((brand, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted rounded-md text-sm"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

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
                        <TableCell>{analyzeMutation.data.protein}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Carbohydrates</TableCell>
                        <TableCell>{analyzeMutation.data.carbs}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Fats</TableCell>
                        <TableCell>{analyzeMutation.data.fats}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {analyzeMutation.data.notes && analyzeMutation.data.notes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Notes:</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {analyzeMutation.data.notes.map((note, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}