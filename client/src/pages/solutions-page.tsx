
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Building, Globe, Briefcase, UserPlus } from "lucide-react";

export default function SolutionsPage() {
  const solutions = [
    {
      title: "For Personal Trainers",
      description: "Streamline client management and programme creation to spend more time coaching and less time doing admin.",
      icon: <UserCheck size={24} className="text-primary" />,
      features: [
        "Create custom workout and nutrition plans in seconds",
        "Track client progress and attendance automatically",
        "Generate professional session plans and reports",
        "Manage client payments and packages",
      ],
      cta: "Perfect for independent trainers looking to scale their business"
    },
    {
      title: "For Gyms & Studios",
      description: "Equip your training team with powerful tools that enhance client experience and retention.",
      icon: <Building size={24} className="text-primary" />,
      features: [
        "Centralised client management for multiple trainers",
        "Branded client experience on web and mobile",
        "Advanced analytics on client engagement and retention",
        "Streamlined team communication and scheduling",
      ],
      cta: "Ideal for facilities with 5+ trainers"
    },
    {
      title: "For Online Coaches",
      description: "Deliver premium digital coaching experiences at scale without increasing your workload.",
      icon: <Globe size={24} className="text-primary" />,
      features: [
        "Create professional workout programmes with video demonstrations",
        "Automated check-ins and progress tracking",
        "White-label mobile experience for clients",
        "Built-in messaging and feedback systems",
      ],
      cta: "Perfect for coaches with large online client bases"
    },
    {
      title: "For Corporate Wellness",
      description: "Provide structured wellness programmes for employees with measurable outcomes.",
      icon: <Briefcase size={24} className="text-primary" />,
      features: [
        "Scalable wellness challenges and programmes",
        "Progress tracking and reporting for HR teams",
        "Customisable content aligned with corporate wellness goals",
        "Group and individual training options",
      ],
      cta: "Designed for corporate wellness coordinators"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tailored Solutions for Fitness Professionals</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            PTpal adapts to your unique business model, providing specialised tools for different types of fitness professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <Card key={index} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  {solution.icon}
                  <CardTitle>{solution.title}</CardTitle>
                </div>
                <p className="text-muted-foreground">{solution.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{solution.cta}</p>
                <Link href="/signup">
                  <Button className="w-full mt-6">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Not sure which solution fits your needs?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Schedule a personalised demo with our team to see how PTpal can be customised for your specific business requirements.
          </p>
          <Link href="/demo">
            <Button size="lg">Book a Demo</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
