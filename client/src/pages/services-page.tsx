import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

export default function ServicesPage() {
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

  const featureCards = [
    {
      title: "AI Workout Generator",
      description: "Create personalised workout plans in seconds. Customised by fitness level, equipment, and goals.",
      icon: <Brain size={24} className="text-primary" />,
      cta: "Explore Workout Generator"
    },
    {
      title: "Movement Analysis",
      description: "Upload videos for AI-powered form analysis. Get blueprint-style visualisation and personalised feedback.",
      icon: <Camera size={24} className="text-primary" />,
      cta: "Learn About Movement Analysis"
    },
    {
      title: "Meal Plan Generator",
      description: "AI-powered nutrition planning based on client goals and preferences. Includes grocery lists and prep instructions.",
      icon: <Utensils size={24} className="text-primary" />,
      cta: "Discover Meal Planning"
    },
    {
      title: "Client Management Suite",
      description: "Centralised dashboard for managing clients, bookings, and progress tracking. All your client data in one place.",
      icon: <Users size={24} className="text-primary" />,
      cta: "View Management Features"
    },
    {
      title: "Session Tracking",
      description: "Document completed sessions with digital signatures. Track packages and remaining sessions automatically.",
      icon: <FileText size={24} className="text-primary" />,
      cta: "Explore Session Tracking"
    },
    {
      title: "Progress Visualization",
      description: "Visual progress tracking with customizable metrics. Show clients their improvements with engaging charts.",
      icon: <LineChart size={24} className="text-primary" />,
      cta: "See Progress Tools"
    },
    {
      title: "Smart Scheduling",
      description: "Integrated calendar with booking system. Automated reminders and session confirmations.",
      icon: <Calendar size={24} className="text-primary" />,
      cta: "Discover Scheduling"
    },
    {
      title: "Interactive Workout Tools",
      description: "Voice-activated workout assistant and interactive mascot for engaging client experiences.",
      icon: <Dumbbell size={24} className="text-primary" />,
      cta: "Try Workout Tools"
    },
    {
      title: "Content Generator",
      description: "AI-powered social media content creator. Generate engaging posts, nutrition tips, and motivational content.",
      icon: <MessageSquare size={24} className="text-primary" />,
      cta: "Explore Content Generator"
    },
    {
      title: "Health & Fitness Tracking",
      description: "Comprehensive tracking of fitness metrics, nutrition, and wellness indicators.",
      icon: <HeartPulse size={24} className="text-primary" />,
      cta: "Learn About Tracking"
    },
    {
      title: "White-Label Customization",
      description: "Fully customizable branding with your logo, colours, and welcome message. Present a professional image.",
      icon: <Award size={24} className="text-primary" />,
      cta: "Discover Branding Options"
    },
    {
      title: "Mobile Client Experience",
      description: "Native-quality mobile experience for your clients. Push notifications and offline capabilities.",
      icon: <Smartphone size={24} className="text-primary" />,
      cta: "See Mobile Features"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Comprehensive Features for Fitness Professionals</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our powerful suite of tools designed specifically for personal trainers and fitness coaches to optimise their business and enhance client experiences.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {featureCards.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-centre gap-3">
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p>{feature.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    {feature.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your fitness business?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of fitness professionals who have elevated their coaching experience with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="px-8">View Pricing Plans</Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="px-8">Sign Up Free</Button>
            </Link>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12 text-centre">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>How does the AI workout generator work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our AI workout generator uses advanced machine learning to create personalized workouts based on your client's fitness level, goals, and available equipment. You can customise intensity, duration, and focus areas to match exactly what your clients need.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I white-label the platform for my business?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes! You can fully customise the platform with your logo, brand colours, and welcome message. Your clients will experience a seamless branded environment that reinforces your professional identity.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How accurate is the movement analysis feature?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our movement analysis uses computer vision technology to provide detailed form feedback. The system can identify key movement patterns and common errors, providing blueprint-style visualisation and specific correction points for improving technique.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can clients access their workout plans on mobile?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Absolutely! The platform offers a native-quality mobile experience for your clients. They can access workout plans, nutrition guides, and progress tracking on any device with push notifications for reminders and updates.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}