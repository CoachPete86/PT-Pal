import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Users, Smartphone, Heart } from "lucide-react";

const services = [
  {
    title: "Personal Training",
    description:
      "One-to-one training sessions customised to your specific goals and needs",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77",
  },
  {
    title: "Group Sessions",
    description:
      "High-intensity group workouts combining strength training and conditioning",
    icon: Users,
    image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
  },
  {
    title: "Online Coaching",
    description:
      "Remote training programmes with regular check-ins and virtual support",
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc",
  },
  {
    title: "Nutrition Guidance",
    description:
      "Tailored meal plans and nutritional advice to optimise your performance",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-zinc-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Training Solutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional training services engineered to help you reach peak
            performance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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