import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Camera,
  Dumbbell,
  FileText,
  LineChart,
  MessageSquare,
  Calendar,
  Utensils,
  HeartPulse,
  Award,
  Users,
  Smartphone,
  LayoutDashboard,
  BadgeCheck,
  CheckCircle2,
} from "lucide-react";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("trainer");

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

  const trainerFeatures = [
    {
      title: "Comprehensive Dashboard",
      description: "Get a bird's-eye view of your entire fitness business with our intuitive dashboard.",
      details: [
        "Client overview with session statistics and upcoming appointments",
        "Financial insights with revenue tracking and payment reminders",
        "Quick access to recently created workouts and nutrition plans",
        "Customizable widgets to focus on what matters most to your business"
      ],
      icon: <LayoutDashboard size={24} className="text-primary" />,
    },
    {
      title: "AI Workout Generator",
      description: "Create professional, personalized workout plans in seconds.",
      details: [
        "Choose from various workout formats (HIIT, strength training, circuit, etc.)",
        "Specify equipment availability, duration, and intensity",
        "Customize for specific client goals and limitations",
        "Easily edit suggestions to add your personal touch",
        "Export to PDF or share directly with clients"
      ],
      icon: <Brain size={24} className="text-primary" />,
    },
    {
      title: "Movement Analysis",
      description: "Professional-grade form analysis with AI-powered insights.",
      details: [
        "Upload client exercise videos for detailed form assessment",
        "Receive blueprint-style visualizations highlighting form issues",
        "Specific correction points with actionable feedback",
        "Compare client form with ideal movement patterns",
        "Track form improvements over time"
      ],
      icon: <Camera size={24} className="text-primary" />,
    },
    {
      title: "Meal Plan Generator",
      description: "Create personalized nutrition plans based on client goals and preferences.",
      details: [
        "Customizable macronutrient ratios and calorie targets",
        "Filter by dietary preferences (vegetarian, vegan, gluten-free, etc.)",
        "Generate complete weekly meal plans with recipes",
        "Automatic grocery lists organized by food category",
        "Adjust based on client feedback and preferences"
      ],
      icon: <Utensils size={24} className="text-primary" />,
    },
    {
      title: "Client Management",
      description: "Streamline client organization and communication in one place.",
      details: [
        "Comprehensive client profiles with health history and preferences",
        "Secure document storage for waivers and assessments",
        "Integrated messaging system for efficient communication",
        "Progress tracking with custom metrics and benchmarks",
        "Client onboarding automation with customizable forms"
      ],
      icon: <Users size={24} className="text-primary" />,
    },
    {
      title: "Session Tracking",
      description: "Efficiently manage training sessions and packages.",
      details: [
        "Digital signatures for session completion verification",
        "Automated tracking of remaining sessions in packages",
        "Session notes and performance records",
        "Payment tracking and receipt generation",
        "Expiration management for session packages"
      ],
      icon: <CheckCircle2 size={24} className="text-primary" />,
    },
    {
      title: "Content Generator",
      description: "Create professional marketing content and educational materials.",
      details: [
        "AI-powered social media post generator with customizable themes",
        "Branded client educational materials and handouts",
        "Email newsletter templates and content suggestions",
        "Custom graphics with your branding",
        "Content calendar planning and scheduling"
      ],
      icon: <MessageSquare size={24} className="text-primary" />,
    },
    {
      title: "Business Analytics",
      description: "Gain data-driven insights to optimise your fitness business.",
      details: [
        "Revenue and payment tracking with visual reports",
        "Client retention and attendance analytics",
        "Marketing campaign performance metrics",
        "Session efficiency and capacity utilization data",
        "Growth trends and business forecasting"
      ],
      icon: <LineChart size={24} className="text-primary" />,
    },
  ];

  const clientFeatures = [
    {
      title: "Personalised Dashboard",
      description: "Keep clients engaged with a personalised fitness tracking hub.",
      details: [
        "At-a-glance view of upcoming sessions and recent achievements",
        "Progress visualisation with customisable metrics",
        "Workout and nutrition plan access",
        "Direct messaging with their trainer",
        "Notification centre for reminders and updates"
      ],
      icon: <LayoutDashboard size={24} className="text-primary" />,
    },
    {
      title: "Workout Experience",
      description: "Provide an engaging, interactive workout experience for clients.",
      details: [
        "Voice-guided workout instructions",
        "Interactive workout mascot for motivation",
        "Timer and rep counting assistance",
        "Form guidance with visual cues",
        "Post-workout surveys and feedback collection"
      ],
      icon: <Dumbbell size={24} className="text-primary" />,
    },
    {
      title: "Progress Tracking",
      description: "Help clients visualize their progress and stay motivated.",
      details: [
        "Custom metrics tracking (weight, measurements, strength gains, etc.)",
        "Visual progress charts and comparisons",
        "Achievement badges and milestone celebrations",
        "Progress photos organization and comparison",
        "Performance analytics and improvement insights"
      ],
      icon: <LineChart size={24} className="text-primary" />,
    },
    {
      title: "Nutrition Tools",
      description: "Comprehensive nutrition support for optimal client results.",
      details: [
        "Meal plan viewing with recipe details",
        "Food logging and nutrition tracking",
        "Grocery list generation and shopping assistance",
        "Water and supplementation tracking",
        "Macro and calorie goal progress"
      ],
      icon: <Utensils size={24} className="text-primary" />,
    },
    {
      title: "Mobile Experience",
      description: "Native-quality mobile experience for on-the-go fitness management.",
      details: [
        "Offline workout access",
        "Push notifications for reminders and updates",
        "Quick check-ins and progress updates",
        "Workout video playback",
        "Simplified logging and tracking"
      ],
      icon: <Smartphone size={24} className="text-primary" />,
    },
    {
      title: "Booking & Scheduling",
      description: "Streamlined session booking and calendar management.",
      details: [
        "Easy session scheduling with availability view",
        "Automated reminders and confirmations",
        "Simple rescheduling and cancellation process",
        "Session history and package tracking",
        "Integration with personal calendar apps"
      ],
      icon: <Calendar size={24} className="text-primary" />,
    },
    {
      title: "Document Access",
      description: "Secure storage and access to important fitness documents.",
      details: [
        "Workout plans and session notes",
        "Nutrition guides and meal plans",
        "Assessment results and progress reports",
        "Signed waivers and agreements",
        "Educational resources and handouts"
      ],
      icon: <FileText size={24} className="text-primary" />,
    },
    {
      title: "Health Monitoring",
      description: "Comprehensive health and wellness tracking beyond fitness.",
      details: [
        "Sleep quality monitoring",
        "Stress and recovery tracking",
        "Hydration and nutrition compliance",
        "Mood and energy level tracking",
        "Integration with wearable fitness devices"
      ],
      icon: <HeartPulse size={24} className="text-primary" />,
    },
  ];

  const platformFeatures = [
    {
      title: "White-Label Branding",
      description: "Present a professional, branded experience to your clients.",
      details: [
        "Custom logo and colours throughout the platform",
        "Personalized welcome messages and emails",
        "Branded workout plans and PDFs",
        "Custom domain integration option",
        "Consistent brand presence across all touchpoints"
      ],
      icon: <Award size={24} className="text-primary" />,
    },
    {
      title: "Advanced Security",
      description: "Enterprise-grade security to protect your business and client data.",
      details: [
        "HIPAA-compliant data storage for health information",
        "End-to-end encryption for all communications",
        "Two-factor authentication option",
        "Regular security audits and penetration testing",
        "Comprehensive backup and disaster recovery"
      ],
      icon: <BadgeCheck size={24} className="text-primary" />,
    },
    {
      title: "Integration Ecosystem",
      description: "Connect seamlessly with your existing business tools and services.",
      details: [
        "Calendar integration (Google Calendar, iCal, Outlook)",
        "Payment processing (Stripe, PayPal)",
        "Accounting software connection (QuickBooks, Xero)",
        "Wearable device integration (Fitbit, Apple Watch)",
        "Marketing platform connections (Mailchimp, ActiveCampaign)"
      ],
      icon: <Brain size={24} className="text-primary" />,
    },
    {
      title: "Scalable Infrastructure",
      description: "Reliable platform that grows with your business.",
      details: [
        "99.9% uptime guarantee",
        "Fast performance even with large client bases",
        "Automatic updates with new features and improvements",
        "Responsive support for all technical issues",
        "Regular data backups and disaster recovery"
      ],
      icon: <Users size={24} className="text-primary" />,
    }
  ];

  const renderFeatureCards = (features) => {
    return (
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-centre gap-3">
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </div>
                <CardDescription className="pt-2">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">Key capabilities:</h4>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg 
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-centre mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Fitness Success</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our comprehensive suite of tools designed to revolutionize your fitness business and enhance client experiences.
          </p>
          
          <div className="mt-8">
            <Tabs 
              defaultValue="trainer" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full max-w-3xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trainer">For Trainers</TabsTrigger>
                <TabsTrigger value="client">For Clients</TabsTrigger>
                <TabsTrigger value="platform">Platform</TabsTrigger>
              </TabsList>
              
              <TabsContent value="trainer">
                <div className="text-centre mb-8 mt-4">
                  <h2 className="text-2xl font-semibold">Trainer & Business Tools</h2>
                  <p className="text-muted-foreground mt-2">Powerful features to streamline operations and enhance your coaching</p>
                </div>
                {renderFeatureCards(trainerFeatures)}
              </TabsContent>
              
              <TabsContent value="client">
                <div className="text-centre mb-8 mt-4">
                  <h2 className="text-2xl font-semibold">Client Experience Features</h2>
                  <p className="text-muted-foreground mt-2">Engaging tools that keep your clients motivated and on track</p>
                </div>
                {renderFeatureCards(clientFeatures)}
              </TabsContent>
              
              <TabsContent value="platform">
                <div className="text-centre mb-8 mt-4">
                  <h2 className="text-2xl font-semibold">Platform Capabilities</h2>
                  <p className="text-muted-foreground mt-2">Technical foundation that powers your professional fitness business</p>
                </div>
                {renderFeatureCards(platformFeatures)}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your fitness business?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience the difference a comprehensive platform can make for your coaching business and client results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="px-8">View Pricing Plans</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="px-8">Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}