import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LoadingState } from "@/components/ui/loading-states";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, CreditCard, Brush } from "lucide-react";

const workspaceFormSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  theme: z.object({
    primary: z.string(),
    variant: z.enum(["professional", "tint", "vibrant"]),
    appearance: z.enum(["light", "dark", "system"]),
    radius: z.number(),
  }),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

export default function WorkspaceSettings() {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["/api/workspace"],
  });

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace?.name || "",
      businessName: workspace?.businessName || "",
      theme: workspace?.theme || {
        primary: "#0ea5e9",
        variant: "professional",
        appearance: "system",
        radius: 0.5,
      },
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: WorkspaceFormValues) => {
      const res = await apiRequest("PATCH", "/api/workspace", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your workspace settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WorkspaceFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingState variant="plate" size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Workspace Settings
          </CardTitle>
          <CardDescription>
            Customize your workspace and manage your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your workspace's display name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Your business or brand name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <Brush className="h-5 w-5" />
                  Theme Customization
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="theme.variant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Variant</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="professional">
                              Professional
                            </SelectItem>
                            <SelectItem value="tint">Tint</SelectItem>
                            <SelectItem value="vibrant">Vibrant</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme.appearance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appearance</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select appearance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? (
                  <LoadingState variant="dumbbell" size="sm" className="mr-2" />
                ) : null}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Current Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {workspace?.subscriptionTier === "free"
                    ? "Free Tier"
                    : workspace?.subscriptionTier === "premium"
                      ? "Premium"
                      : "Enterprise"}
                </p>
              </div>
              {workspace?.subscriptionTier === "free" && (
                <Button
                  variant="default"
                  onClick={() => setIsUpgrading(true)}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {isUpgrading ? (
                    <LoadingState variant="pulse" size="sm" className="mr-2" />
                  ) : null}
                  Upgrade to Premium
                </Button>
              )}
            </div>

            {workspace?.subscriptionTier !== "free" && (
              <div className="text-sm text-muted-foreground">
                <p>
                  Status:{" "}
                  <span className="capitalize">
                    {workspace?.subscriptionStatus}
                  </span>
                </p>
                {workspace?.trialEndsAt && (
                  <p>
                    Trial ends:{" "}
                    {new Date(workspace.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
