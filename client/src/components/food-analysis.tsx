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
import { Loader2, Upload } from "lucide-react";

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
        return data;
      } catch (error: any) {
        throw new Error(error.message || "Failed to analyze food image");
      }
    },
    onSuccess: (data) => {
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
      // Don't reset the form on error to allow retrying
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (4MB limit)
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
              <div className="mt-4 rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Analysis Results:</h4>
                <div className="whitespace-pre-wrap text-sm">
                  {analyzeMutation.data.analysis}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}