import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Users, Globe, Sun, Brain, ChartBar } from "lucide-react";

const services = [
  {
    title: "1:1 Personal Training",
    description:
      "Expert training at PureGym West Byfleet, focusing on strength, endurance, and mobility. Movement analysis and biomechanics-based approach.",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3",
  },
  {
    title: "Online Coaching",
    description:
      "Virtual coaching with customised workout plans and regular check-ins. Flexible session durations to fit your schedule.",
    icon: Globe,
    image: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d",
  },
  {
    title: "Outdoor Training",
    description:
      "Dynamic outdoor sessions that challenge your body and mind in natural environments. Perfect for those who prefer training outside.",
    icon: Sun,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
  },
  {
    title: "Group Fitness",
    description:
      "High-energy classes including HIIT, Strength, Core, Burn, and Spin. Suitable for all fitness levels.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
  },
  {
    title: "Movement Analysis",
    description:
      "Detailed assessment of your movement patterns and biomechanics. Identify limitations and develop corrective strategies.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c",
  },
  {
    title: "Nutrition Coaching",
    description:
      "Personalised meal plans and macro tracking guidance. Evidence-based nutrition advice to support your fitness goals.",
    icon: ChartBar,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Training Solutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional training services engineered to help you reach your full potential,
            whether you're just starting or looking to break through plateaus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.title}
              className="overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${service.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <service.icon className="h-5 w-5" />
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}