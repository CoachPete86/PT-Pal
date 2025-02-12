import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">About Coach Pete Ryan</h2>
            <p className="text-muted-foreground">
              As a former British Kickboxing Champion and Extreme Endurance
              Athlete, I bring over 20 years of elite sports experience to my
              coaching practice. Since 2008, I've helped hundreds of clients
              achieve remarkable transformations through my unique approach to
              training and movement.
            </p>
            <p className="text-muted-foreground">
              My expertise in biomechanics and movement analysis allows me to
              create highly effective, personalised programmes that not only
              achieve results but also improve how you move and feel in daily
              life.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    20+
                  </div>
                  <div className="text-sm">Years Experience</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    15+
                  </div>
                  <div className="text-sm">Year Client Retention</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">#1</div>
                  <div className="text-sm">Kickboxing Champion</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div
            className="aspect-square rounded-lg bg-cover bg-center shadow-2xl"
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
