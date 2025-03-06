import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  ChartBar,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Zap,
  Settings,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const features = [
  {
    title: "Intelligent Workout Planning",
    description:
      "Create professional workout plans in minutes with our advanced programme generator. Customise templates and scale your training programmes efficiently.",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
    premium: true,
  },
  {
    title: "Client Management",
    description:
      "Manage your client base effectively with profiles, progress tracking, and automated check-ins. Keep all client information organised in one place.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
    path: "/dashboard",
  },
  {
    title: "Business Analytics",
    description:
      "Track your business growth with detailed analytics. Monitor client retention, revenue, and programme effectiveness.",
    icon: ChartBar,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
    path: "/dashboard",
  },
  {
    title: "Content Generator",
    description:
      "Create engaging social media content for your fitness business with one click. Generate professional posts optimized for different platforms.",
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    path: "/content-generator",
  },
  {
    title: "Scheduling Tools",
    description:
      "Streamline your booking process with our integrated calendar. Manage sessions, classes, and availability in one place.",
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
    path: "/dashboard",
  },
  {
    title: "Document Management",
    description:
      "Create and manage workout plans, nutrition guides, and waivers. Use templates to save time and maintain consistency.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc",
    path: "/dashboard",
  },
];

export default function ServicesSection() {
  const { user } = useAuth();

  return (
    <section id="services" className="py-20 bg-zinc-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage and grow your fitness business, all in
            one powerful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg border-zinc-200"
            >
              <Link href={user && feature.path ? feature.path : "/auth"}>
                <div
                  className="h-48 bg-cover bg-center relative grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
                  style={{ backgroundImage: `url(${feature.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {feature.premium && (
                    <div className="absolute top-4 right-4 bg-zinc-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Premium
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <feature.icon className="h-5 w-5" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
