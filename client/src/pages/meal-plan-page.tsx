import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import MealPlanGenerator from "@/components/meal-plan-generator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MealPlanPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const checkSecrets = useQuery({
    queryKey: ["api-check"],
    queryFn: async () => {
      const res = await fetch("/api/check-anthropic-api");
      if (!res.ok) {
        throw new Error("API key not configured");
      }
      return res.json();
    },
    retry: false,
    enabled: !!user,
  });

  // Check if Claude API is configured
  useEffect(() => {
    if (checkSecrets.isError) {
      toast({
        title: "API Key Missing",
        description: "Anthropic API key is not configured. Some features may not work properly.",
        variant: "destructive",
      });
    }
  }, [checkSecrets.isError, toast]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-centre gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Meal Plan Generator</h1>
            <p className="text-muted-foreground">
              Create personalized meal plans for your clients based on their individual needs and preferences.
            </p>
          </div>
        </div>

        {checkSecrets.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>API Configuration Required</CardTitle>
              <CardDescription>
                The Anthropic Claude API is required to generate meal plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To use the AI Meal Plan Generator, you need to configure your Anthropic API key.
                Please contact your administrator to set up the API key.
              </p>
            </CardContent>
          </Card>
        ) : (
          <MealPlanGenerator clientId={user?.id} />
        )}
      </div>
    </DashboardLayout>
  );
}