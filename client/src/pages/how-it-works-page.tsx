
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Clock, Sparkles, Repeat, Users, ChartBar, MessageCircle } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Save Time on Admin",
      description: "PTpal automates routine administrative tasks like session planning, tracking client attendance, and managing client packages.",
      icon: <Clock size={36} className="text-primary" />,
      details: "On average, trainers save 5-7 hours per week on administrative tasks."
    },
    {
      title: "Generate Professional Content",
      description: "Use AI to instantly create customised workout plans, nutrition guides, and client reports that would take hours to create manually.",
      icon: <Sparkles size={36} className="text-primary" />,
      details: "Create client-ready programmes in under 2 minutes with our AI generators."
    },
    {
      title: "Streamline Client Communication",
      description: "Centralise all client interactions, automatically send check-ins, and track client engagement in one platform.",
      icon: <MessageCircle size={36} className="text-primary" />,
      details: "Reduce client communication time by up to 60% while improving client satisfaction."
    },
    {
      title: "Track Everything Automatically",
      description: "Client progress, attendance, and achievements are tracked automatically, giving you real-time insights without manual data entry.",
      icon: <ChartBar size={36} className="text-primary" />,
      details: "Gain actionable insights from automated progress tracking and reporting."
    },
    {
      title: "Scale Your Client Base",
      description: "Handle more clients without increasing your workload by leveraging automation and efficient client management tools.",
      icon: <Users size={36} className="text-primary" />,
      details: "Our users report being able to manage 30% more clients while maintaining service quality."
    },
    {
      title: "Rinse and Repeat",
      description: "With your administrative burden reduced, reinvest your time in coaching, business growth, or personal development.",
      icon: <Repeat size={36} className="text-primary" />,
      details: "Focus on what you do best—delivering exceptional coaching experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How PTpal Transforms Your Coaching Business</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            PTpal handles the tedious administrative tasks so you can focus on what you do best: coaching clients and growing your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col h-full">
              <CardContent className="p-6 flex-grow">
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <div className="mt-auto pt-4 text-sm font-medium bg-muted/50 p-3 rounded-md">
                  {step.details}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your coaching business?</h2>
            <p className="mb-6">
              Join thousands of fitness professionals who have streamlined their workflow and grown their business with PTpal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg">Book a Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
