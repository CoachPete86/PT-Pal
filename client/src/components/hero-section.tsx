import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Transform Your Body.{" "}
            <span className="bg-gradient-to-r from-primary/90 to-primary/50 bg-clip-text text-transparent">
              Forge Your Future.
            </span>
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Specialised training programmes crafted to build strength, power, and
            discipline. Join Coach Pete Ryan and begin your transformation today.
          </p>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button size="lg" className="text-lg bg-primary hover:bg-primary/90 transition-all duration-300">
                Start Training
              </Button>
            </Link>
            <Link href="/#services">
              <Button
                size="lg"
                variant="outline"
                className="text-lg border-2 hover:bg-white/10 transition-all duration-300"
              >
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}