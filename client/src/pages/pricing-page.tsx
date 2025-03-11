import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const pricingPlans = {
    monthly: [
      {
        name: "Free",
        description: "Basic tools for new trainers",
        price: "$0",
        features: [
          { name: "3 Active Clients", included: true },
          { name: "Basic Workout Generator", included: true },
          { name: "Client Management", included: true },
          { name: "Calendar & Scheduling", included: true },
          { name: "Session Tracking", included: true },
          { name: "Movement Analysis", included: false },
          { name: "Meal Plan Generator", included: false },
          { name: "Content Generator", included: false },
          { name: "White-Label Branding", included: false },
          { name: "Advanced Analytics", included: false },
        ],
        highlight: false,
        cta: "Get Started Free"
      },
      {
        name: "Pro",
        description: "For established fitness professionals",
        price: "$39",
        features: [
          { name: "25 Active Clients", included: true },
          { name: "Advanced Workout Generator", included: true },
          { name: "Client Management", included: true },
          { name: "Calendar & Scheduling", included: true },
          { name: "Session Tracking", included: true },
          { name: "Movement Analysis", included: true },
          { name: "Meal Plan Generator", included: true },
          { name: "Content Generator", included: true },
          { name: "White-Label Branding", included: false },
          { name: "Advanced Analytics", included: false },
        ],
        highlight: true,
        cta: "Try Pro Free for 14 Days"
      },
      {
        name: "Business",
        description: "For growing fitness businesses",
        price: "$89",
        features: [
          { name: "Unlimited Clients", included: true },
          { name: "Advanced Workout Generator", included: true },
          { name: "Client Management", included: true },
          { name: "Calendar & Scheduling", included: true },
          { name: "Session Tracking", included: true },
          { name: "Movement Analysis", included: true },
          { name: "Meal Plan Generator", included: true },
          { name: "Content Generator", included: true },
          { name: "White-Label Branding", included: true },
          { name: "Advanced Analytics", included: true },
        ],
        highlight: false,
        cta: "Get Business Plan"
      }
    ],
    yearly: [
      {
        name: "Free",
        description: "Basic tools for new trainers",
        price: "$0",
        features: [
          { name: "3 Active Clients", included: true },
          { name: "Basic Workout Generator", included: true },
          { name: "Client Management", included: true },
          { name: "Calendar & Scheduling", included: true },
          { name: "Session Tracking", included: true },
          { name: "Movement Analysis", included: false },
          { name: "Meal Plan Generator", included: false },
          { name: "Content Generator", included: false },
          { name: "White-Label Branding", included: false },
          { name: "Advanced Analytics", included: false },
        ],
        highlight: false,
        cta: "Get Started Free"
      },
      {
        name: "Pro",
        description: "For established fitness professionals",
        price: "$29",
        priceDetail: "per month, billed annually ($348)",
        saveAmount: "Save $120",
        features: [
          { name: "25 Active Clients", included: true },
          { name: "Advanced Workout Generator", included: true },
          { name: "Client Management", included: true },
          { name: "Calendar & Scheduling", included: true },
          { name: "Session Tracking", included: true },
          { name: "Movement Analysis", included: true },
          { name: "Meal Plan Generator", included: true },
          { name: "Content Generator", included: true },
          { name: "White-Label Branding", included: false },
          { name: "Advanced Analytics", included: false },
        ],
        highlight: true,
        cta: "Try Pro Free for 14 Days"
      },
      {
        name: "Business",
        description: "For growing fitness businesses",
        price: "$69",
        priceDetail: "per month, billed annually ($828)",
        saveAmount: "Save $240",
        features: [
          { name: "Unlimited Clients", included: true },
          { name: "Advanced Workout Generator", included: true },
          { name: "Client Management", included: true },
          { name: "Calendar & Scheduling", included: true },
          { name: "Session Tracking", included: true },
          { name: "Movement Analysis", included: true },
          { name: "Meal Plan Generator", included: true },
          { name: "Content Generator", included: true },
          { name: "White-Label Branding", included: true },
          { name: "Advanced Analytics", included: true },
        ],
        highlight: false,
        cta: "Get Business Plan"
      }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-centre mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose a plan that works for your fitness business, whether you're just starting out or managing multiple clients.
          </p>
          
          <div className="mt-8">
            <Tabs 
              defaultValue="monthly" 
              value={billingCycle}
              onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
              className="w-[400px] mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Save 25%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {pricingPlans[billingCycle].map((plan, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`h-full flex flex-col overflow-hidden ${plan.highlight ? 'border-primary shadow-lg' : ''}`}>
                {plan.highlight && (
                  <div className="bg-primary text-primary-foreground text-centre py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                    {plan.priceDetail && (
                      <p className="text-sm text-muted-foreground mt-1">{plan.priceDetail}</p>
                    )}
                    {plan.saveAmount && (
                      <span className="ml-2 inline-block rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                        {plan.saveAmount}
                      </span>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth">
                    <Button 
                      variant={plan.highlight ? "default" : "outline"} 
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12 text-centre">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of your billing cycle. When downgrading, the changes will take effect at the end of your current billing cycle.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Is there a contract or commitment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No long-term contracts! Our monthly plans can be canceled anytime. Annual plans offer a significant discount but are paid upfront for the year. We offer a 14-day money-back guarantee on all paid plans.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What happens if I reach my client limit?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you reach your client limit, you'll need to upgrade to a higher tier plan to add more clients. You won't lose any data or functionality – you just won't be able to add new clients until you upgrade or remove existing clients.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Do you offer discounts for fitness studios?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes! We offer special Enterprise plans for fitness studios and gyms with multiple trainers. Contact our sales team for custom pricing based on your specific needs and number of trainers.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Not sure which plan is right for you?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with a free account and upgrade as your business grows, or schedule a demo to see all features in action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">Start for Free</Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="px-8">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}