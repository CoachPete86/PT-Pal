import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">About Coach Pete Ryan</h2>
            <p className="text-muted-foreground">
              With over a decade of experience in personal training and sports
              science, I've helped hundreds of clients achieve their fitness goals
              and transform their lives.
            </p>
            <p className="text-muted-foreground">
              My approach combines cutting-edge training techniques with
              personalised attention to create programmes that work for your unique
              needs and lifestyle.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10+</div>
                  <div className="text-sm">Years Experience</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm">Clients Trained</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm">Dedication</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div
            className="aspect-square rounded-lg bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1507679799987-c73779587ccf")',
            }}
          />
        </div>
      </div>
    </section>
  );
}