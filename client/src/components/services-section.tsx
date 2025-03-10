import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ChartBar,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Dumbbell,
  Settings,
  Camera,
  Utensils,
  Award,
  Smartphone,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI Workout Generator",
    description:
      "Create personalized workout plans in seconds with our AI engine. Specify equipment, duration, and goals for tailored programs.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
    tag: "Popular",
    path: "/services#ai-workout-generator",
    learnMoreLink: "/services",
  },
  {
    title: "Movement Analysis",
    description:
      "Upload videos for AI-powered form analysis. Receive blueprint-style visualization and personalized feedback on technique.",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    tag: "New",
    path: "/services#movement-analysis",
    learnMoreLink: "/services",
  },
  {
    title: "Meal Plan Generator",
    description:
      "Create custom nutrition plans tailored to client goals and preferences. Generate complete meal plans with grocery lists.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
    tag: "New",
    path: "/services#meal-planning",
    learnMoreLink: "/services",
  },
  {
    title: "Client Management",
    description:
      "Manage clients with comprehensive profiles, progress tracking, and secure document storage. Keep everything organized.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
    path: "/services#client-management",
    learnMoreLink: "/services",
  },
  {
    title: "Interactive Workout Tools",
    description:
      "Enhance client experience with voice-activated workout assistance and interactive mascot for guided sessions.",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b",
    tag: "New",
    path: "/services#workout-tools",
    learnMoreLink: "/services",
  },
  {
    title: "Content Generator",
    description:
      "AI-powered social media content creation for fitness professionals. Generate engaging posts optimised for any platform.",
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113",
    path: "/services#content-generator",
    learnMoreLink: "/services",
  },
  {
    title: "Progress Tracking",
    description:
      "Comprehensive metrics and visualization tools to track client progress. Customizable metrics for any fitness goal.",
    icon: ChartBar,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    path: "/services#progress-tracking",
    learnMoreLink: "/services",
  },
  {
    title: "Session Management",
    description:
      "Track session packages, collect digital signatures, and maintain complete records of all client interactions.",
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
    path: "/services#session-management",
    learnMoreLink: "/services",
  },
  {
    title: "White-Label Branding",
    description:
      "Present a professional, branded experience to your clients with customizable colours, logos, and messaging.",
    icon: Award,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc",
    tag: "Business",
    path: "/services#white-label",
    learnMoreLink: "/services",
  },
];

export default function ServicesSection() {
  const { user } = useAuth();

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
    <section id="services" className="py-20 bg-background border-t">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl font-bold mb-4 tracking-tight">Powerful Features for Fitness Professionals</h2>
          <p className="hero-subtitle text-muted-foreground max-w-3xl mx-auto text-center">
            Our comprehensive platform combines AI-powered tools with essential business management 
            features to help you deliver exceptional service and grow your fitness business.
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.slice(0, 6).map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border">
                <Link href={feature.path}>
                  <div
                    className="h-48 bg-cover bg-center relative cursor-pointer"
                    style={{ backgroundImage: `url(${feature.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {feature.tag && (
                      <div className="absolute top-4 right-4">
                        <Badge variant={feature.tag === "New" ? "default" : "outline"} className="font-heading font-medium tracking-wide text-xs">
                          {feature.tag}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl font-heading tracking-tight">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <CardDescription className="text-sm text-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={feature.learnMoreLink} className="flex">
                    <Button variant="outline" size="sm" className="flex items-center justify-center h-9 px-4">
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/services" className="inline-flex">
            <Button variant="outline" size="lg" className="gap-2 font-heading font-medium tracking-wide flex items-center justify-center h-12 px-6">
              <span>View All Features</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
