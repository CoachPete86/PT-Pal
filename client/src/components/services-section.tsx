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
      "One-on-one training sessions tailored to your specific goals and needs",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1607286908165-b8b6a2874fc4",
  },
  {
    title: "Group Classes",
    description:
      "High-energy group workouts that combine strength training and cardio",
    icon: Users,
    image: "https://images.unsplash.com/photo-1657664065994-5e257c88b7f8",
  },
  {
    title: "Online Coaching",
    description:
      "Remote training programs with regular check-ins and virtual support",
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1640622304964-3e2c2c0cd7cd",
  },
  {
    title: "Nutrition Guidance",
    description:
      "Custom meal plans and nutritional advice to support your fitness goals",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1598002041532-459c3549b714",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of professional training services designed to help
            you reach your fitness goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="overflow-hidden">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <service.icon className="h-5 w-5" />
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
