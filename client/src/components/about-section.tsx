import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground">
              Built by fitness professionals for fitness professionals, our
              platform combines cutting-edge technology with deep industry
              knowledge. We understand the unique challenges of running a
              fitness business and have created tools that make a real
              difference.
            </p>
            <p className="text-muted-foreground">
              From automated workout generation to comprehensive client
              management, we provide everything you need to scale your business
              while maintaining the personal touch your clients value.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-centre">
                  <div className="text-3xl font-bold text-primary mb-2">
                    <span className="text-sm">Personal Trainer</span>
                  </div>
                  <div className="text-sm">Personalized Coaching</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-centre">
                  <div className="text-3xl font-bold text-primary mb-2">
                    <span className="text-sm">AI Powered</span>
                  </div>
                  <div className="text-sm">Smart Workout Plans</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-centre">
                  <div className="text-3xl font-bold text-primary mb-2">
                    <span className="text-sm">Results Focused</span>
                  </div>
                  <div className="text-sm">Achieve Your Goals</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div
            className="aspect-square rounded-lg bg-cover bg-centre shadow-2xl"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1576678927484-cc907957088c")',
            }}
          />
        </div>
      </div>
    </section>
  );
}
