
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SignupPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Basic tools for new trainers",
      features: [
        "3 Active Clients",
        "Basic Workout Generator",
        "Client Management",
        "Calendar & Scheduling",
        "Session Tracking",
      ],
      excluded: [
        "Movement Analysis",
        "Meal Plan Generator",
        "Content Generator",
        "White-Label Branding",
        "Advanced Analytics",
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "$39",
      description: "For established fitness professionals",
      features: [
        "25 Active Clients",
        "Advanced Workout Generator",
        "Client Management",
        "Calendar & Scheduling",
        "Session Tracking",
        "Movement Analysis",
        "Meal Plan Generator",
        "Content Generator",
      ],
      excluded: [
        "White-Label Branding",
        "Advanced Analytics",
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      description: "Complete solution for fitness studios",
      features: [
        "Unlimited Clients",
        "Advanced Workout Generator",
        "Client Management",
        "Calendar & Scheduling",
        "Session Tracking",
        "Movement Analysis",
        "Meal Plan Generator",
        "Content Generator",
        "White-Label Branding",
        "Advanced Analytics",
      ],
      excluded: []
    }
  ];

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
  };

  const handleContinue = () => {
    if (selectedTier) {
      setLocation(`/register?tier=${selectedTier}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Membership Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your business needs. You can upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative cursor-pointer transition-all ${
                selectedTier === tier.id ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
              }`}
              onClick={() => handleSelectTier(tier.id)}
            >
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold">{tier.price}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                </div>
                <div className="space-y-2">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {tier.excluded.map((feature) => (
                    <div key={feature} className="flex items-center text-muted-foreground">
                      <span className="h-5 w-5 mr-2">-</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={selectedTier === tier.id ? "default" : "outline"} 
                  className="w-full"
                  onClick={() => handleSelectTier(tier.id)}
                >
                  {tier.id === "free" ? "Start for Free" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            disabled={!selectedTier} 
            onClick={handleContinue}
            className="px-8"
          >
            Continue to Registration
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
