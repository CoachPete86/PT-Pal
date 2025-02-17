import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { PaymentFormWrapper } from "@/components/payment-form";

const subscriptionPlans = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0/month",
    features: ["Basic workout tracking", "Up to 3 clients", "Basic analytics"],
    tier: "free" as const,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29/month",
    features: [
      "Unlimited clients",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
      "Content generation",
    ],
    tier: "premium" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99/month",
    features: [
      "All Premium features",
      "White-label solution",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    tier: "enterprise" as const,
  },
];

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const loginForm = useForm({
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      role: "trainer",
      subscriptionTier: "free",
      subscriptionStatus: "trial",
    },
  });

  const handleRegistration = async (data: any) => {
    try {
      setRegistrationData(data);
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          subscriptionTier: data.subscriptionTier,
        }),
      });

      if (!response.ok) throw new Error("Failed to create subscription");

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handlePaymentSuccess = async (subscriptionId: string) => {
    if (!registrationData) return;

    try {
      await registerMutation.mutateAsync({
        ...registrationData,
        subscriptionId,
      });
    } catch (error) {
      console.error("Account creation error:", error);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to PTpal</CardTitle>
            <CardDescription>
              Sign in to access your coaching dashboard and manage your clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                {clientSecret ? (
                  <PaymentFormWrapper
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                ) : (
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(handleRegistration)}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Choose Your Plan</h3>
                        <FormField
                          control={registerForm.control}
                          name="subscriptionTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 gap-4"
                                >
                                  {subscriptionPlans.map((plan) => (
                                    <FormItem key={plan.id}>
                                      <FormControl>
                                        <RadioGroupItem
                                          value={plan.tier}
                                          id={plan.id}
                                          className="peer sr-only"
                                        />
                                      </FormControl>
                                      <label
                                        htmlFor={plan.id}
                                        className="flex flex-col p-4 border rounded-lg cursor-pointer peer-aria-checked:border-primary peer-aria-checked:ring-2 peer-aria-checked:ring-primary"
                                      >
                                        <div className="flex justify-between">
                                          <span className="font-semibold">
                                            {plan.name}
                                          </span>
                                          <span className="font-bold">
                                            {plan.price}
                                          </span>
                                        </div>
                                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                          {plan.features.map((feature) => (
                                            <li
                                              key={feature}
                                              className="flex items-center"
                                            >
                                              <Check className="w-4 h-4 mr-2 text-green-500" />
                                              {feature}
                                            </li>
                                          ))}
                                        </ul>
                                      </label>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {clientSecret ? "Pay Now" : "Continue to Payment"}
                      </Button>
                    </form>
                  </Form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div
        className="hidden md:block bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e")',
        }}
      >
        <div className="h-full w-full bg-black/50 p-12 flex items-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">Grow Your PT Business</h2>
            <p className="text-lg">
              Join hundreds of successful personal trainers using PTpal to manage
              their clients, create workout plans, and scale their coaching business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}