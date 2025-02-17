import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, ChartBar, Users, MessageSquare, Calendar, FileText, Sparkles, Zap } from "lucide-react";

const features = [
  {
    title: "AI Workout Generator",
    description:
      "Create professional workout plans in minutes with our AI-powered generator. Customize templates and scale your programming efficiently.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2",
    premium: true,
  },
  {
    title: "Client Management",
    description:
      "Manage your client base effectively with profiles, progress tracking, and automated check-ins. Keep all client information organized in one place.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c",
  },
  {
    title: "Business Analytics",
    description:
      "Track your business growth with detailed analytics. Monitor client retention, revenue, and program effectiveness.",
    icon: ChartBar,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
  },
  {
    title: "Messaging System",
    description:
      "Stay connected with your clients through our integrated messaging system. Send updates, check progress, and provide motivation.",
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
  },
  {
    title: "Scheduling Tools",
    description:
      "Streamline your booking process with our integrated calendar. Manage sessions, classes, and availability in one place.",
    icon: Calendar,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
  },
  {
    title: "Document Management",
    description:
      "Create and manage workout plans, nutrition guides, and waivers. Use templates to save time and maintain consistency.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage and grow your fitness business, all in one
            powerful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${feature.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {feature.premium && (
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Premium
                  </div>
                )}
              </div>
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