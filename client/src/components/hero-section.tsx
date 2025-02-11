import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1641757088388-94a5e97a219a")',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6">
            Transform Your Body,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Transform Your Life
            </span>
          </h1>
          <p className="text-xl mb-8">
            Personalized training programs designed to help you achieve your fitness
            goals. Join Coach Pete Ryan and start your transformation journey
            today.
          </p>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button size="lg" className="text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/#services">
              <Button size="lg" variant="outline" className="text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
