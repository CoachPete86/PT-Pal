import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1574680096145-d05b474e2155")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-black/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <span className="text-primary/90 font-semibold mb-2 block">
            The Ultimate Platform for Fitness Professionals
          </span>
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Streamline Your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Fitness Business
            </span>
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Empower your fitness business with our all-in-one platform. Create personalized
            workout plans, manage clients, and grow your business with our intelligent tools
            and analytics.
          </p>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button size="lg" className="text-lg bg-primary hover:bg-primary/90 transition-all duration-300">
                Get Started Free
              </Button>
            </Link>
            <Link href="/#services">
              <Button
                size="lg"
                variant="outline"
                className="text-lg border-2 hover:bg-white/10 transition-all duration-300"
              >
                View Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}