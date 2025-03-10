
import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-heading tracking-tight">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground hero-subtitle">
              Built by fitness professionals for fitness professionals, our
              platform combines cutting-edge technology with deep industry
              knowledge. We understand the unique challenges of running a
              fitness business and have created tools that make a real
              difference.
            </p>
            <p className="text-muted-foreground hero-subtitle">
              From automated workout generation to comprehensive client
              management, we provide everything you need to scale your business
              while maintaining the personal touch your clients value.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Workout Generation</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered workout plans personalized for each client's needs and goals.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Client Management</h3>
                <p className="text-sm text-muted-foreground">
                  Streamlined tools to organize, track, and engage with your fitness clients.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Nutrition Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive nutrition tools to help clients reach their dietary goals.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Business Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Insights and metrics to grow your fitness business strategically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
